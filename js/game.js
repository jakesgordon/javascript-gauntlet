//=============================================================================
// feature detection
//=============================================================================
ua = function() {

  var ua  = navigator.userAgent.toLowerCase(); // should avoid user agent sniffing... but sometimes you just gotta do what you gotta do
  var key =        ((ua.indexOf("opera")   > -1) ? "opera"   : null);
      key = key || ((ua.indexOf("firefox") > -1) ? "firefox" : null);
      key = key || ((ua.indexOf("chrome")  > -1) ? "chrome"  : null);
      key = key || ((ua.indexOf("safari")  > -1) ? "safari"  : null);
      key = key || ((ua.indexOf("msie")    > -1) ? "ie"      : null);

  try {
    var re      = (key == "ie") ? "msie ([\\d\\.]*)" : key + "\\/([\\d\\.]*)"
    var matches = ua.match(new RegExp(re, "i"));
    var version = matches ? matches[1] : null;
  } catch (e) {}

  return {
    full:    ua,
    name:    key + (version ? " " + version : ""),
    version: version,
    major:   version ? parseInt(version) : null,
    is: {
      firefox: (key == "firefox"),
      chrome:  (key == "chrome"),
      safari:  (key == "safari"),
      opera:   (key == "opera"),
      ie:      (key == "ie")
    },
    has: {
      audio:  AudioFX && AudioFX.enabled,
      canvas: (document.createElement('canvas').getContext),
      touch:  ('ontouchstart' in window)
    }
  }
}();

//=============================================================================
// type detection
//=============================================================================

is = {
  'string':         function(obj) { return (typeof obj === 'string');                 },
  'number':         function(obj) { return (typeof obj === 'number');                 },
  'bool':           function(obj) { return (typeof obj === 'boolean');                },
  'array':          function(obj) { return (obj instanceof Array);                    },
  'undefined':      function(obj) { return (typeof obj === 'undefined');              },
  'func':           function(obj) { return (typeof obj === 'function');               },
  'null':           function(obj) { return (obj === null);                            },
  'notNull':        function(obj) { return (obj !== null);                            },
  'invalid':        function(obj) { return ( is['null'](obj) ||  is.undefined(obj));  },
  'valid':          function(obj) { return (!is['null'](obj) && !is.undefined(obj));  },
  'emptyString':    function(obj) { return (is.string(obj) && (obj.length == 0));     },
  'nonEmptyString': function(obj) { return (is.string(obj) && (obj.length > 0));      },
  'emptyArray':     function(obj) { return (is.array(obj) && (obj.length == 0));      },
  'nonEmptyArray':  function(obj) { return (is.array(obj) && (obj.length > 0));       },
  'document':       function(obj) { return (obj === document);                        }, 
  'window':         function(obj) { return (obj === window);                          },
  'element':        function(obj) { return (obj instanceof HTMLElement);              },
  'event':          function(obj) { return (obj instanceof Event);                    },
  'link':           function(obj) { return (is.element(obj) && (obj.tagName == 'A')); }
}

//=============================================================================
// type coersion
//=============================================================================

to = {
  'bool':   function(obj, def) { if (is.valid(obj)) return ((obj == 1) || (obj == true) || (obj == "1") || (obj == "y") || (obj == "Y") || (obj.toString().toLowerCase() == "true") || (obj.toString().toLowerCase() == 'yes')); else return (is.bool(def) ? def : false); },
  'number': function(obj, def) { if (is.valid(obj)) { var x = parseFloat(obj); if (!isNaN(x)) return x; } return (is.number(def) ? def : 0); },
  'string': function(obj, def) { if (is.valid(obj)) return obj.toString(); return (is.string(def) ? def : ''); }
}

//=============================================================================
//
// Compatibility for older browsers (compatibility: http://kangax.github.com/es5-compat-table/)
//
//  Function.bind:        https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
//  Object.create:        http://javascript.crockford.com/prototypal.html
//  Object.extend:        (defacto standard like jquery $.extend or prototype's Object.extend)
//  Class.create:         create a simple javascript 'class' (a constructor function with a prototype and optional class methods)
//
//=============================================================================

if (!Function.prototype.bind) {
  Function.prototype.bind = function(obj) {
    var slice = [].slice,
        args  = slice.call(arguments, 1),
        self  = this,
        nop   = function () {},
        bound = function () {
          return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));   
        };
    nop.prototype   = self.prototype;
    bound.prototype = new nop();
    return bound;
  };
}

if (!Object.create) {
  Object.create = function(base) {
    function F() {};
    F.prototype = base;
    return new F();
  }
}

if (!Object.extend) {
  Object.extend = function(destination, source) {
    for (var property in source) {
      if (source.hasOwnProperty(property))
        destination[property] = source[property];
    }
    return destination;
  };
}

var Class = {
  create: function(prototype, extensions) {
    var ctor = function() { if (this.initialize) return this.initialize.apply(this, arguments); }
    ctor.prototype = prototype || {};      // instance methods
    Object.extend(ctor, extensions || {}); // class methods
    return ctor;
  }
}

if (!window.requestAnimationFrame) {// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
                                 window.mozRequestAnimationFrame    || 
                                 window.oRequestAnimationFrame      || 
                                 window.msRequestAnimationFrame     || 
                                 function(callback, element) {
                                   window.setTimeout(callback, 1000 / 60);
                                 }
}

Game = {

  run: function(gameFactory, cfg) {
    document.addEventListener('DOMContentLoaded', function() {
      window.game   = gameFactory();
      window.runner = new Game.Runner(window.game, cfg);
    }, false);
  },

  //===========================================================================
  // GAME RUNNER
  //===========================================================================

  Runner: Class.create({

    initialize: function(game, cfg) {
      this.game          = game;
      this.cfg           = (cfg = Object.extend(cfg || {}, (game.cfg && game.cfg.runner) || {}));
      this.fps           = cfg.fps || 30;
      this.dstep         = 1.0 / cfg.fps;
      this.frame         = 0;
      this.canvas        = $(cfg.id || 'canvas');
      this.bounds        = this.canvas.getBoundingClientRect();
      this.width         = cfg.width  || this.canvas.offsetWidth;
      this.height        = cfg.height || this.canvas.offsetHeight;
      this.canvas        = this.canvas;
      this.canvas.width  = this.width;
      this.canvas.height = this.height;
      this.ctx           = this.canvas.getContext('2d');
      game.run(this);
      if (to.bool(this.cfg.start))
        this.start();
      return this.game;
    },

    timestamp: function() { return new Date().getTime(); },

    start: function() {

      this.addEvents();
      this.resetStats();

      if (this.cfg.manual)
        return this.draw();

      var timestamp = this.timestamp,
          start, middle, end, last = timestamp(),
          dt    = 0.0,            // time elapsed (seconds)
          stopping = false,       // flag for stopping game loop
          self = this;            // closure over this

      var step = function() {
        start  = timestamp(); dt = self.update(dt + Math.min(1, (start - last)/1000.0)); // send dt as seconds, MAX of 1s (to avoid huge delta's when requestAnimationFrame put us in the background)
        middle = timestamp(); self.draw();
        end    = timestamp();
        self.updateStats(middle - start, end - middle);
        last = start;
        if (!stopping)
          requestAnimationFrame(step);
      }
      this.stop = function() { stopping = true; }
      step();

    },

    update: function(dt) {
      while (dt >= this.dstep) {
        this.game.update(this.frame);
        this.frame = this.frame + 1;
        dt = dt - this.dstep;
      }
      return dt;
    },

    manual: function() {
      if (this.cfg.manual) {
        var start  = this.timestamp(); this.update(this.dstep);
        var middle = this.timestamp(); this.draw();
        var end    = this.timestamp();
        this.updateStats(middle - start, end - middle);
      }
    },

    draw: function() {
      this.ctx.save();
      this.game.draw(this.ctx, this.frame);
      this.ctx.restore();
      this.drawStats();
    },

    resetStats: function() {
      if (this.cfg.stats) {
        this.stats = new Stats();
        this.stats.extra = {
          update: 0,
          draw:   0
        };
        this.stats.domElement.id = 'stats';
        this.canvas.parentNode.appendChild(this.stats.domElement);
        this.stats.domElement.appendChild($({
          tag:     'div',
          'class': 'extra',
          'style': 'font-size: 8pt; position: absolute; top: -50px;',
          html: "<span class='update'></span><br><span class='draw'></span>"
        }));
        this.stats.updateCounter = $(this.stats.domElement).down('div.extra span.update');
        this.stats.drawCounter   = $(this.stats.domElement).down('div.extra span.draw');
      }
    },

    updateStats: function(update, draw) {
      if (this.cfg.stats) {
        this.stats.update();
        this.stats.extra.update = update ? Math.max(1, update) : this.stats.extra.update;
        this.stats.extra.draw   = draw   ? Math.max(1, draw)   : this.stats.extra.draw;
      }
    },

    drawStats: function() {
      if (this.cfg.stats) {
        this.stats.updateCounter.update("update: " + Math.round(this.stats.extra.update) + "ms");
        this.stats.drawCounter.update(  "draw: " + Math.round(this.stats.extra.draw) + "ms");
      }
    },

    addEvents: function() {
      var game = this.game;

      if (game.onfocus) {
        document.body.tabIndex = to.number(document.body.tabIndex, 0); // body needs tabIndex to recieve focus
        $(document.body).on('focus', function(ev) { game.onfocus(ev); });
      }

      if (game.onclick) {
        this.canvas.on('click', function(ev) { game.onclick(ev); });
      }

      if (game.onwheel) {
        this.canvas.on(ua.is.firefox ? "DOMMouseScroll" : "mousewheel", function(ev) { game.onwheel(Game.Event.mouseWheelDelta(ev), ev); });
      }

    },

    setSize: function(width, height) {
      this.width  = this.canvas.width  = width;
      this.height = this.canvas.height = height;
    }

  }),

  //===========================================================================
  // UTILS
  //===========================================================================

  qsValue: function(name, format) {
    var pattern = name + "=(" + (format || "\\w+") + ")",
        re      = new RegExp(pattern),
        match   = re.exec(location.search);
    return match ? match[1] : null;
  },

  qsNumber: function(name, def) {
    var value = this.qsValue(name);
    return value ? to.number(value, def) : null;
  },

  qsBool: function(name, def) {
    return to.bool(this.qsValue(name), def);
  },

  storage: function() {
    try {
      return this.localStorage = this.localStorage || window.localStorage || {};
    }
    catch(e) { // IE localStorage throws exceptions when using non-standard port (e.g. during development)
      return this.localStorage = {};
    }
  },

  createCanvas: function(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  },

  renderToCanvas: function(width, height, render, canvas) { // http://kaioa.com/node/103
    canvas = canvas || this.createCanvas(width, height, canvas);
    render(canvas.getContext('2d'));
    return canvas;
  },

  parseImage: function(image, callback) {
    var tx, ty, index, pixel,
        tw      = image.width,
        th      = image.height,
        canvas  = Game.renderToCanvas(tw, th, function(ctx) { ctx.drawImage(image, 0, 0); }),
        ctx     = canvas.getContext('2d'),
        data    = ctx.getImageData(0, 0, tw, th).data,
        helpers = {
          valid: function(tx,ty) { return (tx >= 0) && (tx < tw) && (ty >= 0) && (ty < th); },
          index: function(tx,ty) { return (tx + (ty*tw)) * 4; },
          pixel: function(tx,ty) { var i = this.index(tx,ty); return this.valid(tx,ty) ? (data[i]<<16)+(data[i+1]<<8)+(data[i+2]) : null; }
        }

    for(ty = 0 ; ty < th ; ty++)
      for(tx = 0 ; tx < tw ; tx++)
        callback(tx, ty, helpers.pixel(tx,ty), helpers);
  },

  createImage: function(url, options) {
    options = options || {};
    var image = $({tag: 'img'});
    if (options.onload)
      image.on('load', options.onload);
    image.src = url;
    return image;
  },

  loadResources: function(images, sounds, callback) { /* load multiple images and sounds and callback when ALL have finished loading */
    images    = images || [];
    sounds    = sounds || [];
    var count = images.length + sounds.length;
    var resources = { images: {}, sounds: {} };
    if (count == 0) {
      callback(resources);
    }
    else {

      var done = false;
      var loaded = function() {
        if (!done) {
          done = true; // ensure only called once, either by onload, or by setTimeout
          callback(resources);
        }
      }

      var onload = function() {
        if (--count == 0)
          loaded();
      };

      for(var n = 0 ; n < images.length ; n++) {
        var image = images[n];
        image = is.string(image) ? { id: image, url: image } : image;
        resources.images[image.id] = Game.createImage(image.url, { onload: onload });
      }

      for(var n = 0 ; n < sounds.length ; n++) {
        var sound  = sounds[n];
        sound = is.string(sound) ? { id: sound, name: sound } : sound;
        resources.sounds[sound.id] = AudioFX(sound.name, sound, onload);
      }

      setTimeout(loaded, 15000); // need a timeout because HTML5 audio canplay event is VERY VERY FLAKEY (especially on slow connections)

    }
  }

};

Game.PubSub = {

  enable: function(cfg, on) {

    var n, max;

    on.subscribe = function(event, callback) {
      this.subscribers = this.subscribers || {};
      this.subscribers[event] = this.subscribers[event] || [];
      this.subscribers[event].push(callback);
    },

    on.publish = function(event) {
      if (this.subscribers && this.subscribers[event]) {
        var subs = this.subscribers[event],
            args = [].slice.call(arguments, 1),
            n, max;
        for(n = 0, max = subs.length ; n < max ; n++)
          subs[n].apply(on, args);
      }
    }

    if (cfg) {
      for(n = 0, max = cfg.length ; n < max ; n++)
        on.subscribe(cfg[n].event, cfg[n].action);
    }

  }

}
//=============================================================================
// Minimal DOM Library ($)
//=============================================================================

Game.Element = function() {

  var query  = function(selector, context) {
    if (is.array(context))
      return Sizzle.matches(selector, context);
    else
      return Sizzle(selector, context);
  };

  var extend = function(obj)  {
    if (is.array(obj)) {
      for(var n = 0, l = obj.length ; n < l ; n++)
        obj[n] = extend(obj[n]);
    }
    else if (!obj._extended) {
      Object.extend(obj, Game.Element.instanceMethods);
    }
    return obj;
  };

  var on = function(ele, type, fn, capture) { ele.addEventListener(type, fn, capture);    };
  var un = function(ele, type, fn, capture) { ele.removeEventListener(type, fn, capture); };

  var create = function(attributes) {
    var ele = document.createElement(attributes.tag);
    for (var name in attributes) {
      if (attributes.hasOwnProperty(name) && is.valid(attributes[name])) {
        switch(name) {
          case 'tag'  : break;
          case 'html' : ele.innerHTML = attributes[name];  break;
          case 'text' : ele.appendChild(document.createTextNode(attributes[name])); break;
          case 'dom'  :
            attributes[name] = is.array(attributes[name]) ? attributes[name] : [attributes[name]];
            for (var n = 0 ; n < attributes[name].length ; n++)
              ele.appendChild(attributes[name][n]);
            break;
          case 'class':
          case 'klass':
          case 'className':
            ele.className = attributes[name];
            break;
          case 'on':
            for(var ename in attributes[name])
              on(ele, ename, attributes[name][ename]);
            break;
          default:
            ele.setAttribute(name, attributes[name]);
            break;
        }
      }
    }
    return ele;
  };

  return {
 
    all: function(selector, context) {
      return extend(query(selector, context));
    },

    get: function(obj, context) {
      if (is.string(obj))
        return extend(query("#" + obj, context)[0]);
      else if (is.element(obj) || is.window(obj) || is.document(obj))
        return extend(obj);
      else if (is.event(obj))
        return extend(obj.target || obj.srcElement);
      else if ((typeof obj == 'object') && obj.tag)
        return extend(create(obj));
      else
        throw "not an appropriate type for DOM wrapping: " + ele;
    },

    instanceMethods: {

      _extended: true,

      on: function(type, fn, capture) { on(this, type, fn, capture); return this; },
      un: function(type, fn, capture) { un(this, type, fn, capture); return this; },

      showIf:  function(on)      { if (on) this.show(); else this.hide(); },
      show:    function()        { this.style.display = ''       },
      hide:    function()        { this.style.display = 'none';  },
      visible: function()        { return (this.style.display != 'none') && !this.fading; },
      fade:    function(amount)  { this.style.opacity = amount;  },

      relations: function(property, includeSelf) {
        var result = includeSelf ? [this] : [], ele = this;
        while(ele = ele[property])
          if (ele.nodeType == 1)
            result.push(ele);
        return extend(result); 
      },

      parent:            function()            { return extend(this.parentNode); },
      ancestors:         function(includeSelf) { return this.relations('parentNode', includeSelf); },
      previousSiblings:  function()            { return this.relations('previousSibling');         },
      nextSiblings:      function()            { return this.relations('nextSibling');             },

      select: function(selector)            { return Game.Element.all(selector, this); },
      down: function(selector)              { return Game.Element.all(selector, this)[0]; },
      up:   function(selector, includeSelf) { return Game.Element.all(selector, this.ancestors(includeSelf))[0]; },
      prev: function(selector)              { return Game.Element.all(selector, this.previousSiblings())[0];     },
      next: function(selector)              { return Game.Element.all(selector, this.nextSiblings())[0];         },

      remove: function() {
        if (this.parentNode)
          this.parentNode.removeChild(this);
        return this;
      },

      removeChildren: function() { // NOTE: can't use :clear because its in DOM level-1 and IE bitches if we try to provide our own
        while (this.childNodes.length > 0)
          this.removeChild(this.childNodes[0]);
        return this;
      },

      update: function(content) {
        this.innerHTML = "";
        this.append(content);
        return this;
      },
          
      append: function(content) {
        if (is.string(content))
          this.innerHTML += content;
        else if (is.array(content))
          for(var n = 0 ; n < content.length ; n++)
            this.append(content[n]);
        else
          this.appendChild(Game.Element.get(content));
      },

      setClassName:    function(name)     { this.className = name; },
      hasClassName:    function(name)     { return (new RegExp("(^|\s*)" + name + "(\s*|$)")).test(this.className) },
      addClassName:    function(name)     { this.toggleClassName(name, true);  },
      removeClassName: function(name)     { this.toggleClassName(name, false); },
      toggleClassName: function(name, on) {
        var classes = this.className.split(' ');
        var n = classes.indexOf(name);
        on = (typeof on == 'undefined') ? (n < 0) : on;
        if (on && (n < 0))
          classes.push(name);
        else if (!on && (n >= 0))
          classes.splice(n, 1);
        this.className = classes.join(' ');
      },

      fadeout: function(options) {
        options = options || {};
        this.cancelFade();
        this.fading = Animator.apply(this, 'opacity: 0', { duration: options.duration, onComplete: function() {
          this.hide();
          this.fading = null;
          this.style.opacity = is.ie ? 1 : null; /* clear opacity after hiding, but IE doesn't allow clear so set to 1.0 for IE */
          if (options.onComplete)
            options.onComplete();
        }.bind(this) });
        this.fading.play();
      },

      fadein: function(options) {
        options = options || {};
        this.cancelFade();
        this.style.opacity = 0;
        this.show();
        this.fading = Animator.apply(this, 'opacity: 1', { duration: options.duration, onComplete: function() {
          this.fading = null;
          this.style.opacity = is.ie ? 1 : null; /* clear opacity after hiding, but IE doesn't allow clear so set to 1.0 for IE */
          if (options.onComplete)
            options.onComplete();
        }.bind(this) });
        this.fading.play();
      },

      cancelFade: function() {
        if (this.fading) {
          this.fading.stop();
          delete this.fading;
        }
      }

    }
  };

}();

$ = Game.Element.get;
$$ = Game.Element.all;

Game.Event = {

  stop: function(ev) {
    ev.preventDefault();
    ev.cancelBubble = true;
    ev.returnValue = false;
    return false;
  },

  canvasPos: function(ev, canvas) {
    var bbox = canvas.getBoundingClientRect(),
           x = (ev.clientX - bbox.left) * (canvas.width / bbox.width),
           y = (ev.clientY - bbox.top)  * (canvas.height / bbox.height);
    return { x: x, y: y };
  },

  mouseWheelDelta: function(ev) {
    if (is.valid(ev.wheelDelta))
      return ev.wheelDelta/120;
    else if (is.valid(ev.detail))
      return -ev.detail/3;
    else
      return 0;
  }

}

Game.Key = {
  BACKSPACE: 8,
  TAB:       9,
  RETURN:   13,
  ESC:      27,
  SPACE:    32,
  END:      35,
  HOME:     36,
  LEFT:     37,
  UP:       38,
  RIGHT:    39,
  DOWN:     40,
  PAGEUP:   33,
  PAGEDOWN: 34,
  INSERT:   45,
  DELETE:   46,
  ZERO:     48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
  A:        65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
  TILDA:    192,

  map: function(map, context, cfg) {
    cfg = cfg || {};
    var ele = $(cfg.ele || document);
    var onkey = function(ev, keyCode, mode) {
      var n, k, i;
      if ((ele === document) || ele.visible()) {
        for(n = 0 ; n < map.length ; ++n) {
          k = map[n];
          k.mode = k.mode || 'up';
          if (Game.Key.match(k, keyCode, mode, context)) {
            k.action.call(context, keyCode, ev.shiftKey);
            return Game.Event.stop(ev);
          }
        }
      }
    };
    ele.on('keydown', function(ev) { return onkey(ev, ev.keyCode, 'down'); });
    ele.on('keyup',   function(ev) { return onkey(ev, ev.keyCode, 'up');   });
  },

  match: function(map, keyCode, mode, context) {
    if (map.mode === mode) {
      if (!map.state || !context || (map.state === context.current) || (is.array(map.state) && map.state.indexOf(context.current) >= 0)) {
        if ((map.key === keyCode) || (map.keys && (map.keys.indexOf(keyCode) >= 0))) {
          return true;
        }
      }
    }
    return false;
  }

};


Game.Math = {

  minmax: function(x, min, max) {
    return Math.max(min, Math.min(max, x));
  },

  random: function(min, max) {
    return (min + (Math.random() * (max - min)));
  },

  randomInt: function(min, max) {
    return Math.round(Game.Math.random(min, max));
  },

  randomChoice: function(choices) {
    return choices[Math.round(Game.Math.random(0, choices.length-1))];
  },

  randomBool: function() {
    return Game.randomChoice([true, false]);
  },

  between: function(x, from, to) {
    return (is.valid(x) && (from <= x) && (x <= to));
  },

  overlap: function(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(((x1 + w1 - 1) < x2) ||
             ((x2 + w2 - 1) < x1) ||
             ((y1 + h1 - 1) < y2) ||
             ((y2 + h2 - 1) < y1))
  }

}

