//Widget Slide
/*鼠标放上去出现切换大按钮和缩略图列表*/
var ctrlTabs = $('.widget-slide-ctrl-tabs');
var ctrlPrev = $('.widget-slide-ctrl-prev');
var ctrlNext = $('.widget-slide-ctrl-next');
var FOCUS_DELAY;
/*
* 绑定控制图标的显示与隐藏
* */
$('.widget-slide').addEvent('mouseover',function(){ //整体绑定的事件
    clearTimeout(FOCUS_DELAY);
    $( ".widget-slide-ctrl-tabs", $(this)).addCss('visibility:visible;');
    $( ".widget-slide-ctrl-prev", $(this)).addCss('visibility:visible;');//类似于find(),$(selector, abc)
    $( ".widget-slide-ctrl-next",  $(this)).addCss('visibility:visible;');  //左，右控制的按钮
}) .addEvent('mouseout',function(){
        //当前函数没有执行对象，就用一个变量储存当前的this
        var t = this;
        FOCUS_DELAY = setTimeout(function(){
            $( ".widget-slide-ctrl-tabs", $(t)).addCss('visibility:hidden;');
            $( ".widget-slide-ctrl-prev", $(t)).addCss('visibility:hidden;');
            $( ".widget-slide-ctrl-next",  $(t)).addCss('visibility:hidden;');
        }, 25);
    });
/*鼠标放小切换图上，出现切换图标*/
//Mod Scroll
(function(){
    /*
    * @constuctor
    * 构造Scroll对象
    * */
    var Scrl = function(elem){
        var axis = "x"; //滚动方向
        if ( $(elem).attr("class").indexOf("mod-scroll-y") != -1 ) axis = "y";  //获取滚动方向的参数
        var t = this, body = NTES.one("> div.widget-slide-body > ul", elem);
        t._body_elems = $("li", body);//想获取里面的滚动元素
        t._ctrls = $("> div.widget-slide-ctrl > ul.widget-slide-ctrl-nav > li", elem);
        t._ctrls_img = $("> div.widget-slide-ctrl > div.widget-slide-ctrl-tabs > ul > li", elem);
        t._len = t._ctrls.length;
        t.index = 0;
        if (axis == "x"){   //水平方向的滚动
            var bWidth = NTES.one("> li", body).offsetWidth * body.$("> li").length; //计算滚动宽度
            t._step = bWidth / t._len, //每次滚动的距离
                body.addCss({ width: bWidth + "px"});
            $(body.parentNode).addCss({ width: t._step + "px"});    //设置滚动宽度
        }else{              //垂直方向的滚动
            t._step = NTES.one("> li", body).offsetHeight;
            var bHeight = t._step * t._len;
            body.addCss({ height: bHeight + "px"});
            $(body.parentNode).addCss({ height: t._step + "px"});
        }
        /*
        * @调用构造函数
        * 构造的是一个滚动的对象
        * */
        t._scrl = new NTES.ui.Scroll(body, axis); //这里没有传入handle函数 todo:构造滚动对象
                                                   //滚动的方法绑定在构造函数的 _scrl的操作对象上。
        if (axis == "y"){
            t._scrl.speed = 50;//50
            t._scrl.fps = 20;//20
            t._scrl.lpf = 1;
        }
        /*鼠标放到切换小按钮，切换大图*/
        /*
        * t指向Scrol创建的对象
        * @param Event 操作的事件
        * @param callback 回调的参数
        * @param param 传给回调函数的参数
        * */
        t._ctrls.each(function(i){  //绑定操作控制器
            $(this).addEvent("mouseover", t.show.bind(t, i), i);
        });
        /*鼠标放到缩略图上，切换大图*/
        t._ctrls_img.each(function(i){  //绑定到操作的控制图片上
            $(this).addEvent("mouseover", t.show.bind(t, i), i);
        });
        /*鼠标点击左右切换按钮，切换大图*/
        NTES.one("> div.widget-slide-ctrl > a.widget-slide-ctrl-prev", elem).addEvent("click", function(e){ //前一张图片
            e.preventDefault();
            t.show(--t.index);
        }).addEvent("mouseup", function(){ this.blur(); });
        NTES.one("> div.widget-slide-ctrl > a.widget-slide-ctrl-next", elem).addEvent("click", function(e){ //后一张图片
            e.preventDefault();
            t.show(++t.index);
        }).addEvent("mouseup", function(){ this.blur(); });
        t.show(0);
    }
    Scrl.prototype = {
        /*
        * 控制隐藏与显示
        * */
        show: function(i){
            var t = this;
            t.index = i < 0 ? t._len - 1 : i > t._len - 1 ? 0 : i; // 小于0指向最后一个。
            t._scrl.onStart = function(){   //初始化时调用
                t._ctrls.removeCss("current");
                t._ctrls.$(t.index).addCss("current");
                if(t._ctrls_img.length > 0){
                    t._ctrls_img.removeCss("current");
                    t._ctrls_img.$(t.index).addCss("current");
                }
            }





            /*
            * todo: 第一个，最后一个需要特殊处理
            * */
             t._scrl.scrollTo(t._step * t.index); /*从头开始循环*/
        }
    }
    /*
    * @实例化
    * 创建不同的slide切换对象
    * */
    $("div.widget-slide").each(function(){
        new Scrl(this);
    });
})();