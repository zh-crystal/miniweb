#!/usr/bin/python3

import sys
import os
import socket
import multiprocessing
import re
import logging


class HttpServer(object):
    """docstring for HttpServer"""

    def __init__(self, port, app, static_path):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(('', port))
        self.socket.listen(128)
        self.app = app
        self.static_path = static_path

    def serve(self):
        while True:
            client_socket, client_addr = self.socket.accept()
            new_client = multiprocessing.Process(target=self.handle_request, args=(client_socket,))
            new_client.start()
            client_socket.close()

    def handle_request(self, client_socket):
        recv_data = client_socket.recv(1024).decode('utf-8', 'ignore')
        headers = recv_data.splitlines()
        if not headers:
            return
        request_line = headers[0]
        print(request_line)
        source = re.match(r'[^/]+(/[^ ?#]*)', request_line).group(1)
        if source == '/':
            source = '/index.html'
        if source.startswith('/static'):
            source_path = '.' + source
        elif source == '/favicon.ico':
            source_path = './static/images/favicon.ico'
        else:
            source_path = self.static_path + source
        source_type = os.path.splitext(source)[-1][1:]
        mimetype_dict = {
            'html': 'text/html',
            "jpeg": "image/jpeg",
            "jpg": "image/jpeg",
            "png": "image/png",
            "gif": "image/gif",
            "ico": "image/ico",
            "js": "text/javascript",
            "css": "text/css"
        }
        source_mimetype = mimetype_dict.get(source_type, 'text/plain') + ";charset=utf-8"
        print(source_path, '  ->  ' + source_mimetype, end='')
        try:
            f = open(source_path, 'rb')
        except FileNotFoundError:
            print('...dynamic...', end='')
            env = {'PATH_INFO': source, 'MIMETYPE': source_mimetype}
            response_body = self.app(env, self.set_response_header)
            response_header = 'HTTP/1.1 %s\r\n' % self.status
            for header in self.headers:
                response_header += '%s:%s\r\n' % (header[0], header[1])
            response_header += '\r\n'
            response = response_header + response_body
            client_socket.send(response.encode('utf-8'))
        except:
            print('...404!')
            response_header = 'HTTP/1.1 404 not found\r\n'
            response_body = '<h1>File Not Found</h1>'
            response_header += 'Content-Type: text/html;charset=utf-8\r\n\r\n'
            # 不添加Content-Length，因为前后端编码方式不同，对中文字符长度判断有差异
            response = response_header + response_body
            client_socket.send(response.encode('utf-8'))
        else:
            print('...200 OK!')
            response_header = 'HTTP/1.1 200 OK\r\n'
            response_body = f.read()
            f.close()
            response_header += 'Content-Type:%s\r\n\r\n' % source_mimetype
            client_socket.send(response_header.encode('utf-8'))
            client_socket.send(response_body)
        finally:
            client_socket.close()

    def set_response_header(self, status, headers):
        self.status, self.headers = status, headers
        self.headers += [('Server', 'mini_web v1.0')]


def main():
    port, frame, app = 8888, 'mini_frame', 'application'
    logging.basicConfig(
        level=logging.INFO,
        filename='./out/log.txt',
        filemode='a',
        format='%(asctime)s - %(filename)s[line:%(lineno)d] - %(levelname)s: %(message)s'
    )
    if len(sys.argv) >= 2:
        try:
            port = int(sys.argv[1])
        except Exception as e:
            logging.error(e)
        try:
            ret = re.match(r'([^:]+):(.*)', sys.argv[2])
            frame = ret.group(1)
            app = ret.group(2)
        except Exception as e:
            logging.error(e)
    with open('./web.cnf') as f:
        conf_info = eval(f.read())
    sys.path.append(conf_info['dynamic_path'])
    frame = __import__(frame)
    app = getattr(frame, app)
    httpd = HttpServer(port, app, conf_info['static_path'])
    logging.info('Server: serving http on port %d...' % port)
    print('Server: serving http on port %d...' % port)
    httpd.serve()


if __name__ == '__main__':
    main()
