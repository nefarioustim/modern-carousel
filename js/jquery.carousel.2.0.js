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
                "speed": 200,
                "loop": false,
                "autoplay": false,
                "hovercontrols": true,
                "hoverpause": true,
                "delay": 2000
            };
            
            this.options = $.extend(defaults, config);
            
            var o = this;
            
            return this.each(function(){
                var carousel = $(this),
                    clip = carousel.find(".clip:first"),
                    list = clip.find(">ul:first"),
                    panels = list.find(">li"),
                    timer;
                
                carousel.data('playing', false);
                
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
                    controlset = $('<div class="controls" />');
                    basic = $('<ul class="basic" />');

                $.each(controls, function(name, value){
                    controls[name]  = $('<li class="' + name + '"><button>' + name + '</button></li>')
                                        .find('button')
                                        .data('name', name)
                                        .end();
                    
                    basic.append(controls[name]);
                });

                basic.appendTo(controlset.appendTo(carousel));
                basic.delegate("button", "click", function(e){
                    e.preventDefault();
                    carousel.trigger('carousel-' + $(this).data('name'));
                });
                
                // Carousel pagination
                
                if (o.options.pagination) {
                    var pagination = $('<ol class="pages" />');
                    for (var i = 0; i < panels.length / o.options.panesToMove; i++) {
                        $('<li><button value="' + i + '">' + parseInt(i+1) + '</button></li>').appendTo(pagination);
                    }
                    pagination.appendTo(carousel.find(".controls"));
                    pagination.delegate("button", "click", function(e){
                        e.preventDefault();
                        carousel.trigger("carousel-jump", e.target.value * o.options.panesToMove);
                    });
                }
                
                if (o.options.hovercontrols)
                    controlset.hide();
                
                // Carousel hover
                carousel.hover(function(e){
                    if (o.options.hovercontrols)
                        controlset.fadeIn(400);
                    if (o.options.hoverpause) {
                        if (carousel.data('playing'))
                            var play = true;
                        carousel.trigger("carousel-pause");
                        if (play)
                            carousel.data('playing', true);
                    }
                }, function(e){
                    if (o.options.hovercontrols)
                        controlset.fadeOut(400);
                    if (o.options.hoverpause && carousel.data('playing'))
                        carousel.trigger("carousel-play");
                });
                
                //carousel.pagination.
                
                // Handy functions
                
                var active = function(control, state) {
                    if (!state) {
                        control.addClass("disabled");
                        control.find('button')
                            .get(0)
                            .disabled = true;
                    } else {
                        control.removeClass("disabled");
                        control.find('button')
                            .get(0)
                            .disabled = false;
                    }
                }
                
                var checkNavEnabled = function() {
                    if (!o.options.loop) {
                        active(controls["prev"], !(currentPane == 0));
                        active(controls["next"], !(currentPane == numPanes));
                    }
                    if (o.options.pagination) {
                        carousel.find(".pages .current")
                            .removeClass("current");
                        carousel.find(".pages button")
                            .eq(Math.ceil(currentPane / o.options.panesToMove))
                            .closest("li")
                            .addClass("current");
                    }
                };
                checkNavEnabled();
                
                // Eventmageddon!
                
                carousel.bind("carousel-jump", function(e, pane) {
                    if (pane < 0)
                        pane = o.options.loop ? numPanes : 0;
                    if (pane > numPanes)
                        pane = o.options.loop ? 0 : numPanes;
                    
                    currentPane = pane;
                    
                    list.animate({
                        left: (-delta * currentPane) + "px"
                    }, {
                        duration: o.options.speed,
                        queue: false,
                        complete: function(){
                            checkNavEnabled();
                        }
                    });
                });
                
                carousel.bind("carousel-move", function(e, panes) {
                    panes = panes || 1;
                    currentPane += panes * o.options.panesToMove;
                    carousel.trigger("carousel-jump", currentPane);
                    if (carousel.data('playing') && !o.options.loop && currentPane == numPanes)
                        carousel.trigger("carousel-pause");
                });
                
                carousel.bind("carousel-prev", function(e) {
                    carousel.trigger("carousel-pause");
                    carousel.trigger("carousel-move", -1);
                });
                
                carousel.bind("carousel-next", function(e) {
                    carousel.trigger("carousel-pause");
                    carousel.trigger("carousel-move", 1);
                });
                
                carousel.bind("carousel-play", function(e) {
                    carousel.data('playing', true);
                    active(controls["play"], false);
                    active(controls["pause"], true);
                    timer = window.setInterval(function() {
                        carousel.trigger("carousel-move", 1);
                    }, o.options.delay);
                });
                
                carousel.bind("carousel-pause", function(e) {
                    carousel.data('playing', false);
                    active(controls["pause"], false);
                    active(controls["play"], true);
                    clearInterval(timer);
                });
                
                // Initialisation complete; fire her up.
                
                if (o.options.autoplay) {
                    carousel.trigger("carousel-play");
                } else {
                    carousel.trigger("carousel-pause");
                }
            });
        }
    });
})(jQuery);