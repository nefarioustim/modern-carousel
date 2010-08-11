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
                    timer,
                    playing = false;
                
                clip.css("overflow", "hidden");
                list.css("position", "relative");
                list.cleanWhitespace();
                
                var clipWidth = clip.width(),
                    currentPane = 0,
                    numPanes = panels.length - o.options.visiblePanes,
                    delta = Math.floor(clipWidth / o.options.visiblePanes);
                
                // Build basic carousel controls
                
                var controls = {
                        'prev': {},
                        'play': {},
                        'pause': {},
                        'next': {}
                    },
                    ul = $('<ul class="carousel-nav"></ul>');

                $.each(controls, function(name, value){
                    controls[name]  = $('<li class="' + name + '"><button>' + name + '</button></li>')
                                        .find('button')
                                        .click(function(){
                                            carousel.trigger(name);
                                        })
                                        .end();
                    
                    ul.append(controls[name]);
                });

                ul.appendTo(carousel);
                
                // Carousel pagination
                
                if (o.options.pagination) {
                    var pagination = $('<ol class="carousel-pages" />');
                    for (var i = 0; i < panels.length / o.options.panesToMove; i++) {
                        $('<li><button value="' + i + '">' + parseInt(i+1) + '</button></li>').appendTo(pagination);
                    }
                    pagination.appendTo(carousel);
                    pagination.click(function(e){
                        e.preventDefault();
                        if (e.target.nodeName == 'BUTTON')
                            carousel.trigger("jump", e.target.value * o.options.panesToMove);
                    });
                }
                
                // Handy functions
                
                var active = function(control, state) {
                    if (!state) {
                        control.addClass("disabled");
                        control.find('button').get(0).disabled = true;
                    } else {
                        control.removeClass("disabled");
                        control.find('button').get(0).disabled = false;
                    }
                }
                
                var checkNavEnabled = function() {
                    if (!o.options.loop) {
                        if (currentPane == 0) {
                            active(controls["prev"], false);
                        } else {
                            active(controls["prev"], true);
                        }
                        if (currentPane == numPanes) {
                            active(controls["next"], false);
                        } else {
                            active(controls["next"], true);
                        }
                    }
                };
                checkNavEnabled();
                
                // Eventmageddon!
                
                carousel.bind("jump", function(e, pane) {
                    if (pane < 0)
                        pane = o.options.loop ? numPanes : 0;
                    if (pane > numPanes)
                        pane = o.options.loop ? 0 : numPanes;
                    
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
                    if (playing && !o.options.loop && currentPane == numPanes)
                        carousel.trigger("pause");
                });
                
                carousel.bind("prev", function(e) {
                    carousel.trigger("move", -1);
                });
                
                carousel.bind("next", function(e) {
                    carousel.trigger("move", 1);
                });
                
                carousel.bind("play", function(e) {
                    playing = true;
                    active(controls["play"], false);
                    active(controls["pause"], true);
                    timer = window.setInterval(function() {
                        carousel.trigger("move", 1);
                    }, o.options.delay || 5000);
                });
                
                carousel.bind("pause", function(e) {
                    playing = false;
                    active(controls["pause"], false);
                    active(controls["play"], true);
                    clearInterval(timer);
                });
                
                // Initialisation complete; fire her up.
                
                if (o.options.autoplay)
                    carousel.trigger("play");
            });
        }
    });
})(jQuery);