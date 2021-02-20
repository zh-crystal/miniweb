import re

from urllib.parse import unquote
from pymysql import connect

URL_FUNC_DICT = dict()


def route(url):
    def set_func(func):
        URL_FUNC_DICT[url] = func
        def call_func(*args, **kwargs):
            return func(*args, **kwargs)
    return set_func


@route(r'/stock.html')
def stock(ret):
    with open('./templates/stock.html', encoding='utf-8') as f:
        content = f.read()
    conn = connect(host='localhost', port=3306, user='zyl', password='zylmysql', database='stock_db', charset='utf8')
    cur = conn.cursor()
    html = ''
    cur.execute("select * from info i where i.id in (select f.info_id from focus f);")
    stock_infos = cur.fetchall()
    tr_templates = """
            <tr>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>
                    <input type="button" value="已添加" id="toAdd" name="toAdd" systemidvaule="%s" class="focused">
                </td>
            </tr>
        """
    for line_info in stock_infos:
        html += tr_templates % (*line_info, line_info[1])
    cur.execute("select * from info i where i.id not in (select f.info_id from focus f);")
    stock_infos = cur.fetchall()
    tr_templates = """
        <tr>
            <td>%s</td>
            <td>%s</td>
            <td>%s</td>
            <td>%s</td>
            <td>%s</td>
            <td>%s</td>
            <td>%s</td>
            <td>%s</td>
            <td>
                <input type="button" value="添加" id="toAdd" name="toAdd" systemidvaule="%s">
            </td>
        </tr>
    """
    for line_info in stock_infos:
        html += tr_templates % (*line_info, line_info[1])
    cur.close()
    conn.close()
    content = re.sub(r'{%content%}', html, content)
    return content


@route(r"/add/(\d+)\.html")
def add_focus(ret):
    # 1. 获取股票代码
    stock_code = ret.group(1)
    # 2. 判断试下是否有这个股票代码
    conn = connect(host='localhost', port=3306, user='zyl', password='zylmysql', database='stock_db', charset='utf8')
    cs = conn.cursor()
    sql = """select * from info where code=%s;"""
    cs.execute(sql, (stock_code,))
    # 如果要是没有这个股票代码，那么就认为是非法的请求
    if not cs.fetchone():
        cs.close()
        conn.close()
        return "没有这支股票..."
    # 3. 判断以下是否已经关注过
    sql = """ select * from info as i inner join focus as f on i.id=f.info_id where i.code=%s;"""
    cs.execute(sql, (stock_code,))
    # 如果查出来了，那么表示已经关注过
    if cs.fetchone():
        cs.close()
        conn.close()
        return "已关注..."
    # 4. 添加关注
    sql = """insert into focus (info_id) select id from info where code=%s;"""
    cs.execute(sql, (stock_code,))
    conn.commit()
    cs.close()
    conn.close()
    return "关注成功...."


@route(r"/center.html")
def center(ret):
    with open("./templates/center.html", encoding='utf-8') as f:
        content = f.read()
    conn = connect(host='localhost', port=3306, user='zyl', password='zylmysql', database='stock_db', charset='utf8')
    cs = conn.cursor()
    cs.execute(
        "select i.code,i.short,i.chg,i.turnover,i.price,i.highs,f.note_info from info as i inner join focus as f on i.id=f.info_id;")
    stock_infos = cs.fetchall()
    cs.close()
    conn.close()
    tr_template = """
            <tr>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td>%s</td>
                <td style="color: red;">%s</td>
                <td>
                    <a type="button" class="btn btn-default btn-xs" href="/update/%s.html"> <span
                            class="glyphicon glyphicon-star" aria-hidden="true"></span> 修改 </a>
                </td>
                <td>
                    <input type="button" value="删除" id="toDel" name="toDel" systemidvaule="%s">
                </td>
            </tr>
    """
    html = ""
    for line_info in stock_infos:
        html += tr_template % (
        line_info[0], line_info[1], line_info[2], line_info[3], line_info[4], line_info[5], line_info[6], line_info[0], line_info[0])
    content = re.sub(r"{%content%}", html, content)
    return content


@route(r"/del/(\d+)\.html")
def del_focus(ret):
    # 1. 获取股票代码
    stock_code = ret.group(1)
    # 2. 判断试下是否有这个股票代码
    conn = connect(host='localhost',port=3306,user='zyl',password='zylmysql',database='stock_db',charset='utf8')
    cs = conn.cursor()
    sql = """select * from info where code=%s;"""
    cs.execute(sql, (stock_code,))
    # 如果要是没有这个股票代码，那么就认为是非法的请求
    if not cs.fetchone():
        cs.close()
        conn.close()
        return "没有这支股票..."
    # 3. 判断以下是否已经关注过
    sql = """ select * from info as i inner join focus as f on i.id=f.info_id where i.code=%s;"""
    cs.execute(sql, (stock_code,))
    # 如果没有关注过，那么表示非法的请求
    if not cs.fetchone():
        cs.close()
        conn.close()
        return "未关注..."
    # 4. 取消关注
    # sql = """insert into focus (info_id) select id from info where code=%s;"""
    sql = """delete from focus where info_id = (select id from info where code=%s);"""
    cs.execute(sql, (stock_code,))
    conn.commit()
    cs.close()
    conn.close()
    return "取消关注成功...."


@route(r"/update/(\d+)\.html")
def show_update_page(ret):
    """显示修改的那个页面"""
    # 1. 获取股票代码
    stock_code = ret.group(1)
    # 2. 打开模板
    with open("./templates/update.html", encoding='utf-8') as f:
        content = f.read()
    # 3. 根据股票代码查询相关的备注信息
    conn = connect(host='localhost', port=3306, user='zyl', password='zylmysql', database='stock_db', charset='utf8')
    cs = conn.cursor()
    sql = """select f.note_info from focus as f inner join info as i on i.id=f.info_id where i.code=%s;"""
    cs.execute(sql, (stock_code,))
    stock_infos = cs.fetchone()
    note_info = stock_infos[0]  # 获取这个股票对应的备注信息
    cs.close()
    conn.close()
    content = re.sub(r"{%note_info%}", note_info, content)
    content = re.sub(r"{%code%}", stock_code, content)
    return content


@route(r"/update/(\d+)/(.*)\.html")
def save_update_page(ret):
    """"保存修改的信息"""
    stock_code = ret.group(1)
    comment = unquote(ret.group(2))
    conn = connect(host='localhost', port=3306, user='zyl', password='zylmysql', database='stock_db', charset='utf8')
    cs = conn.cursor()
    sql = """update focus set note_info=%s where info_id = (select id from info where code=%s);"""
    cs.execute(sql, (comment, stock_code))
    conn.commit()
    cs.close()
    conn.close()
    return "修改成功..."


def application(env, start_response):
    source, mimetype = env.get('PATH_INFO', ''), env.get('MIMETYPE', 'text/plain;charset=utf-8')
    for url, func in URL_FUNC_DICT.items():
        ret = re.match(url, source)
        if ret:
            start_response('200 OK', [('Content-Type', mimetype)])
            print('200 OK!')
            return func(ret)
    else:
        print('404!')
        start_response('404', [('Content-Type', mimetype)])
        return '<h1>No page!</h1>'
