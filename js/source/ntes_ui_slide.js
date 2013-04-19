/*
* 构造方法
* */

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
                    interval : false,
                    pause : "hover",
                    event : "mouseover",
                    gap : 0
                           },
            t.options = $.util.extend( t.defaults , options ),
            t.event = t.options.event || t.defaults.event,
            t.btn = {},
            t.scrol = [],
            t.step,//步长
            t.gap = t.options.gap,
            t.btn.prev = t.options.prev,
            t.btn.next = t.options.next;

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
        * @自动循环播放
        * */
        cycle: function(e){
           var t = this;
            console.info("event :",e)
            if(!e) t.paused = false;
            if( t.options.interval ){
                t.interval = setTimeout(function(){    //开始自动循环
                                                    t.next();
                                                    t.sliding = false; //进入下一个循环
                                                    console.info("timestamp:")

                    },
                                                t.options.gap
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
            if(!e) t.paused = true
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
            if (t.sliding) {
                t.sliding = false
                return
            }
            return t.slide("next")
        } ,

        /*
        * @播放前一个
        * */
        prev: function(event){
            var t = this
            event && event.preventDefault();
            if (t.sliding) {
                t.sliding = false
                return
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
                * */
            $($active.parentNode).addCss("position:relative;width:"+ t.step*2+"px;height:"+$.style.getCurrentStyle($active,'height'));
            $($next).addCss("position:absolute;top:0px;left:"+t.step+"px;");
            $($active).addCss("position:absolute;top:0px;left:0;");
            $($next).addCss("display:block");

            t.s = new NTES.ui.Scroll($active.parentNode, "x")
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

            t.s.scrollTo(t.step);
            this.sliding = false; //进入下一个循环
            /*
            * @循环
            * */
            t.s.onStop = function(){
                $active.removeCss(t.css);
                $active.removeCss("position:absolute;top:0px;left:0;display:block;")
                $next.addCss(t.css);
            }

            t.current = t.nextIndex;
            isCycling && t.cycle();
            return t;
        }
     }

    /*
    * 扩展到外部的通用接口
    * */
//    $.ui.Carousel = Carousel;



