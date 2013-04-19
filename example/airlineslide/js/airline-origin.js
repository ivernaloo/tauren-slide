(function () {
    /*
    * @ handle the control bar
    * @ param {num} index the current cursor point to
    * @ param {num} index the last cursor point to
    * */
    function controlBars( index , last) {
        -1 !== index && identifier.eq(index).addClass("on");
       - 1 !== last && identifier.eq(last).removeClass("on")
    }

    /*
    * @ function slide the dom
    * @ param {num} the step of num
    * @ param {function} the callback function
    * */
    function slide(num, func) {
        var cursorIndex = num > lens ? 0 : num;
        controlBars(cursorIndex, lastIndex);
        lastIndex = cursorIndex;
        slide.stop().animate({
            left: -1 * conWidth * num
        }, {
            duration: _duration,
            complete: func
        });
        0 == cursorIndex ? slide.children().eq(num - 1).clone().appendTo(".pattern") : $(".pattern").empty()
    }

    /*
    * slide to the next
    * @param {num} direction and step
    * */
    function next(step, c) {
        timestamp = +new Date; // the unique identifier, also a timestamp.
        if (0 === step)
            controlBars( lastIndex, -1)
            slide.css({
                left: -1 * conWidth * lastIndex
            })
        else {
            var b;
            if (0 < step) return b = lastIndex + 1, b > lens && !c && (b = 0), b <= lens ? slide(b) : slide(b, function () {
                slide.css({
                    left: 0
                })
            });
            b = lastIndex - 1;
            0 > b && (b = lens, slide.css({
                left: -1 * conWidth * (lens + 1)
            }));
            return slide(b)
        }
    }
    var con = $("#slideshow"),
        conWidth = con.width(),
        slide = con.find("> div.img > span"),
        slideLength = slide.children().length;
        slide.children().eq(0).clone().appendTo(slide);
    var lastIndex = 0,
        lens = slideLength - 1,
        timestamp = 0,
        _duration = 600,
        identifier;
    identifier = $(Array(slideLength + 1).join("<slide></slide>")).each(function (d, a) {
        $(a).data({
            idx: d
        })
    });
    var btns = $('<s class="prev"><slide></slide></s><s class="next"><slide></slide></s>');

    $('<div class="btns"/ >').append($("<b/>").append(identifier).delegate("slide", "click", function () {
        slide($(this).data("idx"))
    }).css({
            width: 20 * slideLength,
            marginLeft: -10 * slideLength
        })).delegate("s", "click", function () {
            next($(this).is(".prev") ? -1 : 1, !0)
        }).append(btns).appendTo(con);
    next(1);

    /*
    * detect the ie status
    * */
    var isIE = $.browser.msie && "7.0" > $.browser.version;

    /*
    * when hove on the column
    * */
    con.hover(function (a) {
        if (isIE) btns["mouseenter" == a.type ? "show" : "hide"]();
        else btns.stop()["fade" + ("mouseenter" == a.type ? "In" : "Out")]("fast")
    });

    /*
    * auto play
    * */
    if ("auto-play" == con.attr("rel")) {
        var o = setInterval(function () {
            5000 > +new Date - timestamp || next(1, !0) // auto slide to the next?
        }, 5000);
        slide.mouseover(function () {
            clearInterval(o)
        });
        slide.mouseout(function () {
            o = setInterval(function () {
                5000 > +new Date - timestamp || next(1, !0)
            }, 5000)
        })
    }
    con = $(document.body).width();
    slideLength = (con - 960) / 2;
    $("#slideshow").css("width", con);
    $("#slideshow .img").css("width", con);
    $("#slideshow .btns").css("left",
        slideLength);
    $(".paging").css("width", slideLength);
    $(".subpattern").css("right", 0);
    $("#slideshow .img span").css({
        paddingLeft: slideLength
    })
})();