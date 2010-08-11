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
                "autoplay": false,
                "delay": 2000
            };
            
            this.options = $.extend(defaults, config);
            
            var o = this;
            
            return this.each(function(){
                var carousel = $(this),
                clip = carousel.find(".clip:first"),
                list = clip.find(">ul:first"),
                panels = list.find(">li"),
                timer, playing = false;
                
                clip.css("overflow", "hidden");
                list.css("position", "relative");
                list.cleanWhitespace();
                
                var clipWidth = clip.width(),
                currentPane = 0,
                numPanes = panels.length - o.options.visiblePanes,
                delta = Math.floor(clipWidth / o.options.visiblePanes);
                
                var play = $('<button>Play</button>').click(function(e) {
                    carousel.trigger("play");
                }),
                pause = $('<button>Pause</button>').click(function(e) {
                    carousel.trigger("pause");
                }),
                prev = $('<button>Prev</button>').click(function(e) {
                    carousel.trigger("move", -1);
                }),
                next = $('<button>Next</button>').click(function(e) {
                    carousel.trigger("move", 1);
                });
                
                $('<ul class="carousel-nav" />')
                    .append(
                        $('<li class="prev" />').append(prev)
                    )
                    .append(
                        $('<li class="play" />').append(play)
                    )
                    .append(
                        $('<li class="pause" />').append(pause)
                    )
                    .append(
                        $('<li class="next" />').append(next)
                    )
                    .appendTo(carousel);
                
                if (o.options.pagination) {
                    var pagination = $('<ol class="carousel-pages" />');
                    for (var i = 0; i < panels.length / o.options.panesToMove; i++) {
                        $('<li><button value="' + i + '">' + parseInt(i+1) + '</button></li>').appendTo(pagination);
                    }
                    pagination.appendTo(carousel);
                    pagination.click(function(e){
                        e.preventDefault();
                        if (e.target.nodeName == 'BUTTON') {
                            carousel.trigger("jump", e.target.value * o.options.panesToMove);
                        }
                    });
                }
                
                var active = function(button, state) {
                    if (!state) {
                        button.closest("li").addClass("disabled");
                        button.get(0).disabled = true;
                    } else {
                        button.closest("li").removeClass("disabled");
                        button.get(0).disabled = false;
                    }
                }
                
                var checkNavEnabled = function() {
                    if (!o.options.loop) {
                        if (currentPane == 0) {
                            active(prev, false);
                        } else {
                            active(prev, true);
                        }
                        if (currentPane == numPanes) {
                            active(next, false);
                        } else {
                            active(next, true);
                        }
                    }
                };
                checkNavEnabled();
                
                carousel.bind("jump", function(e, pane) {
                    if (pane < 0) pane = o.options.loop ? numPanes : 0;
                    if (pane > numPanes) pane = o.options.loop ? 0 : numPanes;
                    
                    currentPane = pane;
                    
                    list.animate({
                        left: (-delta * currentPane) + "px"
                    }, o.options.speed, function(){
                        checkNavEnabled();
                    });
                    
                    carousel.find(".carousel-pages .current").removeClass("current");
                    carousel.find(".carousel-pages button").eq(Math.ceil(currentPane / o.options.panesToMove)).closest("li").addClass("current");
                });
                
                carousel.bind("move", function(e, panes) {
                    panes = panes || 1;
                    currentPane += panes * o.options.panesToMove;
                    carousel.trigger("jump", currentPane);
                    if (playing && !o.options.loop && currentPane == numPanes) carousel.trigger("pause");
                });
                
                carousel.bind("play", function(e) {
                    playing = true;
                    active(play, false);
                    active(pause, true);
                    timer = window.setInterval(function() {
                        carousel.trigger("move", 1);
                    }, o.options.delay || 5000);
                });
                
                carousel.bind("pause", function(e) {
                    playing = false;
                    active(pause, false);
                    active(play, true);
                    clearInterval(timer);
                });
                
                if (o.options.autoplay) carousel.trigger("play");
            });
        }
    });
})(jQuery);