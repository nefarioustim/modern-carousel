/*!
 * jQuery Carousel widget
 * http://nefariousdesigns.co.uk/projects/widgets/carousel/
 * 
 * Source code: http://github.com/nefarioustim/modern-carousel/
 *
 * Copyright © 2010 Tim Huegdon
 * http://timhuegdon.com
 */
 
(function($) {
    var debugMode = true;
    
    function debug(msg) {
        if(debugMode && window.console && window.console.log){
            window.console.log(msg);
        }
    }
    
    $.fn.cleanWhitespace = function() {
        this.contents().filter(function() {
            if (this.nodeType != 3) {
                $(this).cleanWhitespace();
                return false;
            }
            else {
                return !/\S/.test(this.nodeValue);
            }
        }).remove();
    };
    
    $.fn.carousel = function(config) {
        var defaults = {
            "visiblePanes": 1,
            "panesToMove": 1,
            "pagination": true,
            "speed": 200,
            "loop": false,
            "autoplay": false,
            "hovercontrols": false,
            "hoverpause": false,
            "delay": 2000,
            "transition": false
        };
        
        if (config) $.extend(defaults, config);
        
        this.each(function(){
            var timer,
                carousel = $(this),
                clip = carousel.find(".clip:first"),
                list = clip.find(">ul:first"),
                panels = list.find(">li");
            
            defaults.aspectVert = /(vertical)/i.test(list.get(0).className);
            
            carousel.data("playing", false);
            
            clip.css("overflow", "hidden");
            list.css({
                "position": "relative"
            });
            clip.cleanWhitespace();
            
            var clipWidth = clip.width(),
                clipHeight = clip.get(0).offsetHeight,
                currentPane = 0,
                numPanes = panels.length,
                delta = defaults.aspectVert ? Math.floor(clipHeight / defaults.visiblePanes) : Math.floor(clipWidth / defaults.visiblePanes);
            
            // Build basic carousel controls
            
            var controls = {
                    "prev": {},
                    "play": {},
                    "pause": {},
                    "next": {}
                },
                controlset = $('<div class="controls" />');
                basic = $('<ul class="basic" />');

            $.each(controls, function(name, value){
                controls[name]  = $('<li class="' + name + '"><button>' + name + '</button></li>')
                                    .find("button")
                                    .data("name", name)
                                    .end();
                
                basic.append(controls[name]);
            });

            basic.appendTo(controlset.appendTo(carousel));
            basic.delegate("button", "click", function(e){
                e.preventDefault();
                carousel.trigger($(this).data("name"));
            });
            
            // Carousel pagination
            
            if (defaults.pagination) {
                var pagination = $('<ol class="pages" />');
                for (var i = 0; i < panels.length / defaults.panesToMove; i++) {
                    $('<li><button value="' + i + '">' + parseInt(i+1, 10) + '</button></li>').appendTo(pagination);
                }
                pagination.appendTo(carousel.find(".controls"));
                pagination.delegate("button", "click", function(e){
                    e.preventDefault();
                    carousel.trigger("jump", [e.target.value * defaults.panesToMove, currentPane]);
                });
            }
            
            if (defaults.hovercontrols)
                controlset.hide();
            
            // Carousel hover
            carousel.hover(function(e){
                if (defaults.hovercontrols)
                    controlset
                        .stop()
                        .fadeIn({"duration": 200, "queue": false});
                if (defaults.hoverpause) {
                    if (carousel.data("playing"))
                        var play = true;
                    carousel.trigger("pause");
                    if (play)
                        carousel.data("playing", true);
                }
            }, function(e){
                if (defaults.hovercontrols)
                    controlset
                        .fadeOut({"duration": 200, "queue": false});
                if (defaults.hoverpause && carousel.data("playing"))
                    carousel.trigger("play");
            });
            
            // Handy functions
            
            var active = function(control, state) {
                if (!state) {
                    control.addClass("disabled");
                    control.find("button")
                        .get(0)
                        .disabled = true;
                } else {
                    control.removeClass("disabled");
                    control.find("button")
                        .get(0)
                        .disabled = false;
                }
            }
            
            carousel.delegate(".clip > ul > li *", "focus", function(e) {
                var idx = $(e.target)
                            .closest(".clip > ul > li")
                            .index();
                
                if (idx > (defaults.visiblePanes + currentPane) - 1) {
                    carousel.trigger("pause");
                    carousel.trigger("jump", idx);
                } else if (idx < currentPane) {
                    carousel.trigger("pause");
                    carousel.trigger("jump", idx - defaults.visiblePanes);
                }
            });
            
            // Eventmageddon!
            
            carousel.bind("nav-state.carousel", function() {
                if (!defaults.loop) {
                    active(controls["prev"], !(currentPane == 0));
                    active(controls["next"], !(currentPane == numPanes));
                }
                if (defaults.pagination) {
                    carousel.find(".pages .current")
                        .removeClass("current");
                    carousel.find(".pages button")
                        .eq(Math.ceil(currentPane / defaults.panesToMove))
                        .closest("li")
                        .addClass("current");
                }
            });
            
            carousel.bind("move.carousel", function(e, panes) {
                clip.cleanWhitespace();
                numPanes = list.find("> li").length;
                var lastPane = currentPane;
                panes = panes || 1;
                
                currentPane += panes * defaults.panesToMove;
                
                if (currentPane + (defaults.visiblePanes - defaults.panesToMove) >= numPanes) {
                    if (defaults.loop) {
                        currentPane = 0;
                    }
                } else if (currentPane <= -defaults.panesToMove) {
                    if (defaults.loop) {
                        currentPane = numPanes + (panes * defaults.panesToMove);
                    }
                }
                
                carousel.trigger("jump", [currentPane, lastPane]);
                if (carousel.data("playing") && !defaults.loop && currentPane == numPanes) {
                    carousel.trigger("pause");
                }
            });
            
            carousel.bind("jump.carousel", function(e, pane, lastPane) {
                if (pane < 0) {
                    pane = 0;
                }
                if (pane > numPanes - defaults.visiblePanes) {
                    pane = numPanes - defaults.visiblePanes;
                }
                
                currentPane = pane;
                
                // If you start seeing strange animation jumps when your
                // carousel has a large number of panels, try uncommenting
                // the queue parameter below.
                var animParams = {
                    duration: defaults.speed,
                    // queue: false,
                    complete: function(){
                        carousel.trigger("nav-state");
                    }
                };
                
                if (defaults.transition) {
                    var transConfig = {
                        "carousel":     carousel,
                        "defaults":     defaults,
                        "delta":        delta,
                        "last":         lastPane,
                        "current":      currentPane,
                        "anim":         animParams
                    }
                    carousel.carousel[defaults.transition](transConfig);
                } else {
                    if (defaults.aspectVert) {
                        list.animate({
                            top: (-delta * pane) + "px"
                        }, animParams);
                    } else {
                        list.animate({
                            left: (-delta * pane) + "px"
                        }, animParams);
                    }
                }
            });
            
            carousel.bind("prev.carousel", function(e) {
                carousel.trigger("pause");
                carousel.trigger("move", -1);
            });
            
            carousel.bind("next.carousel", function(e) {
                carousel.trigger("pause");
                carousel.trigger("move", 1);
            });
            
            carousel.bind("play.carousel", function(e) {
                carousel.data("playing", true);
                active(controls["play"], false);
                active(controls["pause"], true);
                timer = window.setInterval(function() {
                    carousel.trigger("move", 1);
                }, defaults.delay);
            });
            
            carousel.bind("pause.carousel", function(e) {
                carousel.data("playing", false);
                active(controls["pause"], false);
                active(controls["play"], true);
                clearInterval(timer);
            });
            
            // Initialisation complete; fire her up.
            
            carousel.trigger("nav-state");
            
            if (defaults.autoplay) {
                carousel.trigger("play");
            } else {
                carousel.trigger("pause");
            }
        });
        
        return this;
    };
    
    $.fn.carousel.fade = function(config) {
        var currentPaneEl   = config.carousel.find(".clip>ul>li").eq(config.last),
            nextPaneEl      = config.carousel.find(".clip>ul>li").eq(config.current),
            list            = config.carousel.find(".clip>ul");
        
        currentPaneEl
            .css({
              'position':   'absolute',
              'top':        '0',
              'left':       '0',
              'z-index':    '1'
            });
        
        nextPaneEl
            .hide()
            .css({
              'position':   'absolute',
              'top':        '0',
              'left':       '0',
              'z-index':    '2'
            });
        
        config.anim.complete = function() {
            currentPaneEl.hide();
            config.carousel.trigger("nav-state");
        };
        nextPaneEl.fadeIn(config.anim);
    };
})(jQuery);