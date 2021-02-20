$(function () {
    $('#login').click(function () {
        // ajax关于get方法的简写
        $.get(
            './json/data.json',
            function (dat) {
                $('.login_btns').hide();
                $('.user_info em').html(dat.name);
                $('.user_info').show();
            },
            'json'
        );
    });

    var $slide = $('.slide_con');
    var $slides = $('.slide_list li');
    var $p_con = $('.slide_point');
    var s_length = $slides.length;
    $slides.not(':first').css({'left': 760});
    for (var i = 0; i < s_length; i++) {
        var $new_li = $('<li>');
        if (i === 0) {
            $new_li.addClass('active');
        }
        $new_li.appendTo($p_con);
    }
    var $points = $('.slide_point li');
    var nowli = 0, prevli = 0;
    $points.click(function () {
        nowli = $(this).index();
        if (nowli === prevli) {
            return false;
        }
        $(this).addClass('active').siblings().removeClass('active');
        move();
    });
    var $prev = $('.slide_prev'), $next = $('.slide_next');
    var ismove = false; // 防止暴力操作，频繁点击
    $prev.click(function () {
        if (ismove) {
            return false;
        }
        ismove = true;
        nowli--;
        move();
        $points.eq(nowli).addClass('active').siblings().removeClass('active');
    });
    $next.click(function () {
        if (ismove) {
            return false;
        }
        ismove = true;
        nowli++;
        move();
        $points.eq(nowli).addClass('active').siblings().removeClass('active');
    });
    var timer = null;
    timer = setInterval(next, 2000);
    $slide.mouseenter(function () {
        clearInterval(timer);
    });
    $slide.mouseleave(function () {
        timer = setInterval(next, 2000);
    });

    function move() {
        if (nowli < 0) { // 第一张向左
            nowli = s_length - 1;
            prevli = 0;
            $slides.eq(nowli).css({'left': -760});
            $slides.eq(prevli).animate({'left': 760});
        } else if (nowli > s_length - 1) { // 最后一张向右
            nowli = 0;
            prevli = s_length - 1;
            $slides.eq(nowli).css({'left': 760});
            $slides.eq(prevli).animate({'left': -760});
        } else if (nowli > prevli) { // 右->左
            $slides.eq(nowli).css({'left': 760});
            $slides.eq(prevli).animate({'left': -760});
        } else {
            $slides.eq(nowli).css({'left': -760});
            $slides.eq(prevli).animate({'left': 760});
        }
        $slides.eq(nowli).animate({'left': 0}, function () {
            ismove = false;
        });
        prevli = nowli;
    }

    function next() {
        nowli++;
        move();
        $points.eq(nowli).addClass('active').siblings().removeClass('active');
    }
});