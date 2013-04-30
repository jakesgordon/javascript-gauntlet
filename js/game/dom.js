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

