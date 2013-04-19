/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-2-22
 * Time: 下午5:02
 * To change this template use File | Settings | File Templates.
 */

/*
 * @ for the carsouel of airline channel
 * */
(function(){

    // @skeleton use for the slide handle Object
    var airlineSlide = {
        con : $("#slideshow")
    }
    window.airlineSlide = airlineSlide

    /*
    * @ width
    * @ get the property of width
    * */

    /*
    * @ slide
    * @ slide the component
    * */


    /*
    * @test
    * */
    $.domready(
        function(){
            console.info("domready")
            console.info("airlineSlide",airlineSlide.con)
            console.info("airlineSlide.con:",airlineSlide.con.width())
            console.info("width width:",$(window).width())

        }
    )

    window.onload = function(){
        console.info("windows.onload")
    }
})()

//new NTES.ui.Carousel( $("#js_slider .slider-ctrl-con") ,$("#js_slider .slider-main-img") , "current" , { prev: $("#js_slider .slider-ctrl-prev") , next :$("#js_slider .slider-ctrl-next"),event: "click" , interval:2500 })