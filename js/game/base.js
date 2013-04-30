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

