(function(window, undefined){

    var $ = window.NTES || {};
    if (!$.ui) {
        $.ui = {};
    }

    /*con
     * @定义滚动的方向
     * */
    var scrollMode = {
        forward : function(lpf) {
            var t = this , pos = Math.abs(t._bPos) - lpf; //向左移动
//            console.info("right pos :",pos)
//            pos = (pos > 0 ? pos : 0); //防止小于0
            t._setPos(pos); //定位
            (pos == 0 && t.stop()); //停止移动
        },
        backward : function(lpf) {
            var t = this ,pos = t._bPos + lpf;  //向右移动
            pos = (pos < t._bRange ? pos : t._bRange);  //不超出范围
            t._setPos(pos);
            (pos == t._bRange && t.stop());
        }
    };
    /*
     * @constructor
     * @body {object} 操作对象
     * @axis {array} 坐标值
     * @handle {function} 回调函数
     * @options {object} 配置函数
     * 构造滚动对象
     * */
    $.ui.ScrollCarousel = function(body, axis, handle , options) {
        if (!arguments.length) {    // 空对象时跳出
            return;
        }
        var t = this;
        t.constructor = arguments.callee;
        //转化出定位对象
        t._axis = axis == 'y' ? 'y' : 'x';  //移动的对象
        t._fix = t._axis == 'x' ? {
            pos: 'left',
            offsetSize: 'offsetWidth',
            pageAxis: 'pageX',
            offsetPos: 'left',
            scrollPos: 'scrollLeft'
        } :	{
            pos: 'top',
            offsetSize: 'offsetHeight',
            pageAxis: 'pageY',
            offsetPos: 'offsetTop',
            scrollPos: 'scrollTop'
        };
        t.fps = (options && Math.ceil(options["fps"]/50)) || 13; //刷新率,时间单位，用来设置时间刷新间隔
        t.fps = t.fps < 13 ? 13 : t.fps; //防止过快
        t.lpf = 10; //移动步长
        t.speed = 40;
        if ($.browser.msie) {
            t.speed = 20;
        }
        t._body = body;
        t._bCnt = body.parentNode;
        t._bRange = Math.max(0, t._body[t._fix.offsetSize] - t._bCnt[t._fix.offsetSize]);
        t._bPos = t._body.offsetLeft;

        $(t._bCnt).addCss("overflow:hidden")//修正scrollLeft无法设值的问题
        if(handle !== undefined){
            t._handle = handle;
            t._hCnt = handle.parentNode;
            t._hPos = 0;
            t._hRange = Math.max(0, t._hCnt[t._fix.offsetSize] - t._handle[t._fix.offsetSize]);

            t.bhRate = t._hRange ? t._bRange / t._hRange : 0;

            /*
             * @绑定鼠标操作
             * */
            var mouse = new $.ui.Mouse(t._handle);
            mouse.mouseStart = t._mouseStart.bind(t);
            mouse.mouseDrag = t._mouseDrag.bind(t);
            mouse.mouseStop = t._mouseStop.bind(t);
            $(t._hCnt).addEvent('click', t._mouseClick.bind(t));

        }
    };

    $.ui.ScrollCarousel.prototype = {
        /*
         * @通过_timer来进行循环
         * */
        start: function(toward, length) {
            var t = this;
            if(t._timer == undefined){
                toward = toward == 'forward' ? 'forward' : 'backward';
                t._move = scrollMode[toward];
//                console.info("params length :",length)
                var params = {
                    length : isNaN(length) ? -1 : parseInt(length)
                };
                /*console.info("params :",params)
                console.info("fps :", t.fps)
                console.info("toward :", toward)*/
                t._timer = setInterval(t._scroll.bind(t, params), t.fps);
                t.onStart && t.onStart();
            }
        },
        stop: function() {
            var t = this;
            if (t._timer !== undefined) {
                clearTimeout(t._timer);
                t._timer = undefined;
                t.onStop && t.onStop();
            }
            return this;
        },
        scrollTo: function(length){

            var t = this, distance = length;
//            console.info("scrollTo legnth:",length)
//            console.info("t._bPos",t._bPos)
            distance < 0 ? t.stop().start('forward', -1 * distance) : t.stop().start('backward', distance);
        },
        /*
         * @param {object} 操作的对象
         * @滚动的核心函数
         * */
        _scroll: function(params) {
            var t = this, lpf = t.lpf;//步长
//            console.info("params.length :",params.length)
            if (params.length !== 0) {
                if (params.length > 0) {
                    lpf = Math.min(t.lpf * Math.ceil(params.length / t.speed), params.length);
                    params.length -= lpf; //控制位移
                }
                t._move(lpf);
            } else {
                t.stop();
            }
        },

        /*
         * @pos {Array} 位置定位
         * */
        _setPos: function(pos){
            var t = this;
            t._bPos = pos;
            t._body.style.left = -t._bPos+"px";
            if(t._handle){
                t._hPos = t.bhRate ? pos / t.bhRate : 0;
                t._handle.addCss(t._fix.pos + ':' + t._hPos + 'px');
            }
        },
        _mouseStart: function(event){
            var t = this;
            t._diffPos = event[t._fix.pageAxis] - t._handle[t._fix.offsetPos];
            return true;
        },
        _mouseDrag: function(event){
            var t = this, pos = Math.max(0, Math.min(event[t._fix.pageAxis] - t._diffPos, t._hRange));
            t._setPos(pos * t.bhRate);
            return false;
        },
        _mouseStop: function(event){
            return false;
        },
        _mouseClick: function(event){
            var t = this, cnt = t._hCnt, cPos = cnt[t._fix.offsetPos];
            while(cnt.offsetParent){
                cnt = cnt.offsetParent;
                cPos += cnt[t._fix.offsetPos];
            }
            t.scrollTo((event[t._fix.pageAxis] - t._handle[t._fix.offsetSize] / 2 - cPos) * t.bhRate);
        }
    };

    /*
     * @constructor
     * @ctrls {Object Array}  控制句柄
     * @contents {Object Array} 操作的内容
     * @css {String} 切换的className
     * @options {Map} 传入其它的参数
     * */
    $.ui.Carousel = function(ctrls ,contents ,css ,options){
        var t = this;
        t.ctrls = ctrls,
            t.cons = contents,
            t.css = css,
            t.defaults = {
                auto : false,
                interval : 5000,
                pause : "hover",
                event : "mouseover"
            },
            t.options = $.util.extend( t.defaults , options ),
            t.event = t.options.event || t.defaults.event,
            t.btn = {},
            t.scrol = [],
            t.step,//步长
            t.btn.prev = t.options.prev,
            t.btn.next = t.options.next,
            t.current;
        /*
         * @检查参数
         * */
         if(arguments.length < 3) {
            return;
        };
        if(t.cons.length != t.ctrls.length) {
            throw "can not match ctrls(" + t.ctrls.length + ") and contents(" + t.cons.length + ")";
        }

        /*
         * @映射链表
         * 用来查找当前元素的前后元素
         * */
        t.activeMap = {
            prev : function(elem){
                var _prev = elem.previousSibling;
                for ( ; _prev; _prev = _prev.previousSibling ) {
                    if ( _prev.nodeType === 1 && _prev !== elem ) {
                        return _prev
                    }
                }
            },

            next : function(elem){
                var _next = elem.nextSibling;
                for ( ; _next; _next = _next.nextSibling ) {
                    if ( _next.nodeType === 1 && _next !== elem ) {
                        return _next
                    }
                }
            }
        }
        /*
         * @映射链表
         * 用来存储操作对象的第一和最后一个值
         * */
        t.consMap = {
            first : function(cons){
                return cons[0];
            },
            last : function(cons){
                return cons[cons.length-1];
            }
        }
        /*
         * @映射Map
         * 用来区分水平与垂直方向值的获取
         * */
        t.stepMap = {
            x : function(elem){
                return elem.offsetWidth
            },
            y : function(elem){
                return elem.offsetHeight
            }
        }
        t.step = t.stepMap.x(t.cons[0]); //定义步长

        if(!t.current){
            t.cons.each(function(i){
                if(this.className.indexOf(t.css) > -1){
                    t.current = i;
                }
            })
        }
        $( t.ctrls[t.current] ).addCss(t.css)

        t.ctrls.each(function(i){
            $(t.ctrls[i]).addEvent(t.event, function(){
                t.to(i);
            })
        })

        if(t.btn.prev){
            if( t.event != "click" ){
                t.btn.prev.addEvent("click", function(event){
                    t.prev();
                    return false
                })
            }

            t.btn.prev.addEvent(t.event, t.prev.bind(t))
        }
        if(t.btn.next){
            if( t.event != "click" ){
                t.btn.next.addEvent("click", function(event){
                    t.next()
                    return false
                })
            }
            t.btn.next.addEvent(t.event, t.next.bind(t))
        }
        t.total = t.cons.length;//数量

        t.cycle(); //开始循环
    }
    $.ui.Carousel.prototype = {

        /*
         * 获取样式
         *
         * */
        getStyle : function (oElm, strCssRule){
            var strValue = "";
            if(document.defaultView && document.defaultView.getComputedStyle){
                strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
            }
            else if(oElm.currentStyle){
                strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
                    return p1.toUpperCase();
                });
                strValue = oElm.currentStyle[strCssRule];
            }
            return strValue;
        },
        /*
         * @自动循环播放
         * */
        cycle: function(e){
            var t = this;

            t.paused = false;
            if( t.options.auto ){
                t.interval = setInterval(function(){    //开始自动循环
                        t.next();
                    },
                    t.options.interval
                );
            }
            return this;
        },

        /*
         * @定位到坐标
         * */
        to: function(pos){
            var t = this,
                $active = t.cons[t.current] || t.cons[0];

            if( pos > (t.cons.length-1) || pos < 0 ) return
            if(t.current == pos){
                return t.pause().cycle()
            }
            return t.slide( pos > t.current ? "next" : "prev", t.cons[pos]);
        },

        /*
         * @暂停
         * */
        pause: function(e){
            var t = this;
            t.paused = true
            clearInterval(t.interval)
            t.interval = null
            return t;
        },

        /*
         * @播放下一个
         * */
        next: function(event){
            var t = this
            event && event.preventDefault();
//            console.info("t.sliding ------ :", t.sliding)

            if (t.sliding) {
                return
            }
//            console.info("t.sliding :", t.sliding)

            return t.slide("next")
        },

        /*
         * @播放前一个
         * */
        prev: function(event){
            var t = this
            event && event.preventDefault();

            if (t.sliding) {
                return false
            }
            return t.slide("prev")
        } ,

        /*
         * @滚动
         *  依靠javascript刷新和transition.(@todo:transition的方式需要开发)
         * @param {string} type滚动的方向
         * @param {object} 下一个操作的对象
         * */
        slide: function(type, next){
            var t = this,
                $active,
                $activeMap,
                $next,  //下一个操作对象
                isCycling = t.interval,
                direction = type == "next" ? "left" : "right",
                fallback = type == "next" ? "first" : "last";

            $active = t.cons[t.current] || t.cons[0];
            $next = next || t.activeMap[type]($active);
            $next = $next || t.consMap[fallback](t.cons);

            this.sliding = true; //正滚动;
            isCycling && t.pause() //isCycling是循环体

            if($next.className.indexOf(t.css) > -1) return;

            /*
             * @控制相邻的两个图片滚动
             * @param {object} $active
             * @param {object} $next
             * t.getStyle($active,"height")
             * */
            if (direction == "left"){
                $($active.parentNode).addCss("position:relative;width:"+ t.step*2+"px;overflow:hidden;zoom:1;position:relative;left:0px;height:"+ t.stepMap["y"]($active)+"px;");//滚动对象
                $($active.parentNode.parentNode).addCss("position:relative;overflow:hidden;zoom:1;width:"+t.step+"px;");
                $($next).addCss("position:absolute;top:0px;left:"+t.step+"px;zoom:1;display:block");
                $($active).addCss("position:absolute;top:0px;left:0;display:block;zoom:1;");
            } else {
                $($active.parentNode).addCss("position:relative;width:"+ t.step*2+"px;overflow:hidden;zoom:1;position:relative;left:-"+t.step+"px;height:"+ t.stepMap["y"]($active)+"px;");//滚动对象
                $($active.parentNode.parentNode).addCss("position:relative;overflow:hidden;zoom:1;width:"+t.step+"px;");
                $($next).addCss("position:absolute;top:0px;left:0px;zoom:1;display:block");
                $($active).addCss("position:absolute;top:0px;left:"+t.step+"px;display:block;zoom:1;");
            }

            t.s = new NTES.ui.ScrollCarousel($active.parentNode, "x", undefined, { fps : t.options.interval })

            /*k
             * @定义滚动对象
             */

            t.cons.each(function(i){
                if(t.cons[i] == $next){
                    t.nextIndex = i;
                }
            })
            $(t.ctrls[t.current]).removeCss(t.css);
            $(t.ctrls[t.nextIndex]).addCss(t.css); //添加控制器的class

            switch (direction){
                case "left" :   t.s.scrollTo(t.step)
                    break
                case "right":   t.s.scrollTo(-t.step)
                    break
            }
            t.s.onStart = function(){
                t.sliding = true; //进入下一个循环
            }
            /*
             * @循环
             * */
            t.s.onStop = function(){
                if( direction == "left"){
                    $active.removeCss(t.css);
                    $active.removeCss("position:absolute;top:0px;left:0;display:block;")
                    $($next).removeCss("left:"+t.step+"px;");
                    $($active.parentNode).removeCss("width:"+ t.step*2+"px;left:-"+t.step+"px;");//滚动对象
                    $next.addCss(t.css);
                    t.sliding = false; //进入下一个循环

                }else{
                    $active.removeCss(t.css);
                    $next.addCss(t.css);
                    $($next.parentNode).removeCss("position:relative;width:"+ t.step*2+"px;overflow:hidden;left:0px;");//滚动对象
                    $($next).removeCss("position:absolute;top:0px;left:0px;zoom:1;display:block");
                    $($active).removeCss("position:absolute;top:0px;left:"+t.step+"px;display:block;zoom:1;");
                    t.sliding = false; //进入下一个循环

                }
            }
//            console.info("isCycling",isCycling)

            t.current = t.nextIndex;
            isCycling && t.cycle();
            return t;
        }
    }
})(window);


