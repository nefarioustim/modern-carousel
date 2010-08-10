(function($) {
    var debugMode = true;
    
    function debug(msg){
        if(debugMode && window.console && window.console.log){
            window.console.log(msg);
        }
    }
    
    $.fn.extend({
        carousel: function(config) {
            var defaults = {
                "visiblePanes": 1,
                "panesToMove": 1,
                "horizontal": true,
                "pagination": true,
                "speed": "fast",
                "loop": true,
                "autoplay": 1000
            };

            this.options = $.extend(defaults, config);

            var o = this;

            return this.each(function(){
                var el = $(this),
                panels = el.find(".panel"),
                clip = el.find(".clip"),
                cont = clip.find(">ul");
                
                clip.css("overflow", "hidden");
                
                var carouselWidth = clip.width(),
                carouselHeight = clip.get(0).offsetHeight;
                
                clip.css("clip", "rect(0 " + carouselWidth +"px " + carouselHeight + "px 0)");
                
                if (!clip.css("width")) {
                    clip.css("width", carouselWidth +"px");
                }
                if (!clip.css("height")) {
                    clip.css("height", carouselHeight +"px");
                }
                
                cont.css("position", "relative");
                
                if (o.options.horizontal) {
                    cont.css("width", "999999px");
                } else {
                    cont.css("height", "999999px");
                }
                
                var currentPane = 0,
                numberOfPanes = panels.length - o.options.visiblePanes,
                moveDelta = (o.options.horizontal) ? Math.floor(carouselWidth / o.options.visiblePanes) : Math.floor(carouselHeight / o.options.visiblePanes);
                
                el.bind("carouselUpdatePanels", function(){
                    panels = el.find(".panel");
                    numberOfPanes = panels.length - o.options.visiblePanes;
                });
                
                $('<ul class="carousel-nav"><li class="prev"><button>Prev</button></li><li class="next"><button>Next</button></li></ul>').appendTo(el);
                el.find(".carousel-nav .prev button").click(function(e){
                    moveBy(e, -1);
                });
                el.find(".carousel-nav .next button").click(function(e){
                    moveBy(e, 1);
                });
                
                if (o.options.pagination) {
                    var pagination = $('<ol class="carousel-pages" />');
                    for (var i = 0; i < panels.length / o.options.panesToMove; i++) {
                        $('<li><button value="' + i + '">' + parseInt(i+1) + '</button></li>').appendTo(pagination);
                    }
                    pagination.appendTo(el);
                    pagination.click(function(e){
                        e.preventDefault();
                        if (e.target.nodeName == 'BUTTON') {
                            gotoPane(e.target.value * o.options.panesToMove);
                        }
                    });
                }
                
                if (o.options.autoplay) {
                    o.options.loop = true;
                    var timer = window.setInterval(function(){moveBy(null, 1)}, o.options.autoplay || 5000);
                }

                el.find(".carousel-pages button").eq(Math.ceil(currentPane / o.options.panesToMove)).addClass("current");
                
                var togglePrev = function(bool) {
                    var prev = el.find(".carousel-nav .prev"),
                    next = el.find(".carousel-nav .next");
                    
                    if (bool) {
                        prev.removeClass("disabled");
                        prev.find("button").get(0).disabled = false;
                    } else {
                        prev.addClass("disabled");
                        prev.find("button").get(0).disabled = true;
                    }
                    
                    if (next.hasClass("disabled") && prev.hasClass("disabled")) {
                        el.find(".carousel-nav").css("display", "none");
                    }
                };
                
                var toggleNext = function(bool) {
                    var prev = el.find(".carousel-nav .prev"),
                    next = el.find(".carousel-nav .next");
                    
                    if (bool) {
                        next.removeClass("disabled");
                        next.find("button").get(0).disabled = false;
                    } else {
                        next.addClass("disabled");
                        next.find("button").get(0).disabled = true;
                    }
                    
                    if (next.hasClass("disabled") && prev.hasClass("disabled")) {
                        el.find(".carousel-nav").css("display", "none");
                    }
                };
                
                if (!o.options.loop) {
                    if (currentPane == 0) {
                        togglePrev(false);
                    }
                    if (currentPane == numberOfPanes) {
                        toggleNext(false);
                    }
                }
                
                var moveBy = function(e, panes) {
                    if (e) {
                        e.preventDefault();
                    }
                    currentPane += panes * o.options.panesToMove;
                    gotoPane(currentPane);
                    el.trigger("carouselMoveBy", panes);
                    el.trigger("carouselUpdatePanels");
                };

                var gotoPane = function(pane) {
                    if (pane < 0) pane = o.options.loop ? numberOfPanes : 0;
                    if (pane > numberOfPanes) pane = o.options.loop ? 0 : numberOfPanes;
                    
                    if (!o.options.loop) {
                        if (pane == 0) {
                            togglePrev(false);
                        } else {
                            togglePrev(true);
                        }
                        if (pane == numberOfPanes) {
                            toggleNext(false);
                        } else {
                            toggleNext(true);
                        }
                    }
                    
                    currentPane = pane;
                    el.find(".carousel-pages .current").removeClass("current");
                    el.find(".carousel-pages button").eq(Math.ceil(currentPane / o.options.panesToMove)).addClass("current");
                    if (o.options.horizontal) {
                        cont.animate({
                            left: (-moveDelta * currentPane) + "px"
                        }, o.options.speed);
                    } else {
                        cont.animate({
                            top: (-moveDelta * currentPane) + "px"
                        }, o.options.speed);
                    }
                };
            });
        }
    });
})(jQuery);