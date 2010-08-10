(function($) {
    var debugMode = true;
    
    function debug(msg) {
        if(debugMode && window.console && window.console.log){
            window.console.log(msg);
        }
    }
    
    $.fn.cleanWhitespace = function() {
        textNodes = this.contents().filter(function(){
            return (this.nodeType == 3 && !/\S/.test(this.nodeValue));
        }).remove();
    };
    
    $.fn.extend({
        carousel: function(config) {
            var defaults = {
                "visiblePanes": 1,
                "panesToMove": 1,
                "pagination": true,
                "speed": "fast",
                "loop": false,
                "autoplay": false
            };
            
            this.options = $.extend(defaults, config);
            
            var o = this;
            
            return this.each(function(){
                var carousel = $(this),
                clip = carousel.find(".clip:first"),
                list = clip.find(">ul:first"),
                panels = list.find(">li");
                
                clip.css("overflow", "hidden");
                list.css("position", "relative");
                list.cleanWhitespace();
                
                var clipWidth = clip.width(),
                currentPane = 0,
                numPanes = panels.length - o.options.visiblePanes,
                delta = Math.floor(clipWidth / o.options.visiblePanes);
                
                if (o.options.autoplay) {
                    var timer = window.setInterval(function() {
                        moveBy(null, 1);
                    }, o.options.autoplay || 5000);
                }
                
                $('<ul class="carousel-nav"><li class="prev"><button>Prev</button></li><li class="next"><button>Next</button></li></ul>').appendTo(carousel);
                var prev = carousel.find(".carousel-nav .prev"),
                next = carousel.find(".carousel-nav .next");
                prev.find("button").click(function(e){
                    moveBy(e, -1);
                });
                next.find("button").click(function(e){
                    moveBy(e, 1);
                });
                
                var checkNavEnabled = function() {
                    if (!o.options.loop) {
                        if (currentPane == 0) {
                            prev.addClass("disabled");
                            prev.find("button").get(0).disabled = true;
                        } else {
                            prev.removeClass("disabled");
                            prev.find("button").get(0).disabled = false;
                        }
                        if (currentPane == numPanes) {
                            next.addClass("disabled");
                            next.find("button").get(0).disabled = true;
                        } else {
                            next.removeClass("disabled");
                            next.find("button").get(0).disabled = false;
                        }
                    }
                };
                checkNavEnabled();
                
                var moveBy = function(e, panes) {
                    if (e) e.preventDefault();
                    currentPane += panes * o.options.panesToMove;
                    gotoPane(currentPane);
                    if (o.options.autoplay && !o.options.loop && currentPane == numPanes) clearInterval(timer);
                };
                
                var gotoPane = function(pane) {
                    if (pane < 0) pane = o.options.loop ? numPanes : 0;
                    if (pane > numPanes) pane = o.options.loop ? 0 : numPanes;
                    
                    currentPane = pane;
                    
                    list.animate({
                        left: (-delta * currentPane) + "px"
                    }, o.options.speed, function(){
                        checkNavEnabled();
                    });
                };
            });
        }
    });
})(jQuery);