Game.Menu = Class.create({

  initialize: function(element, game, cfg) {
    this.parent = $(element);
    this.game = game;
    this.cfg  = cfg;
    this.construct(cfg.id, cfg.items, to.bool(cfg.visible, true));
    Game.Key.map([
      { keys: [Game.Key.UP,    Game.Key.W],      mode: 'down', action: function() { this.prev();           } },
      { keys: [Game.Key.DOWN,  Game.Key.S],      mode: 'down', action: function() { this.next();           } },
      { keys: [Game.Key.LEFT,  Game.Key.A],      mode: 'down', action: function() { this.prevChoice();     } },
      { keys: [Game.Key.RIGHT, Game.Key.D],      mode: 'down', action: function() { this.nextChoice();     } },
      { keys: [Game.Key.SPACE, Game.Key.RETURN], mode: 'down', action: function() { this.click();          } }
    ], this, { ele: this.dom });
  },

  destruct: function() {
    if (this.dom) {
      this.dom.remove();
      this.dom = null;
      this.items = null;
    }
  },

  construct: function(id, items, visible) {
    var style = visible ? "" : "display: none;";
    this.destruct();
    this.dom = $({tag: 'div', id: id, klass: 'menu', style: style, on: {
      mousemove: this.onmousemove.bind(this),
      click:     this.onclick.bind(this)
    }});
    this.tabindex = 10;
    this.items = [];
    for(var n = 0 ; n < items.length ; n++)
      this.items.push(this.constructItem(n, items[n]));
    this.parent.append(this.dom);
    this.select(0);
  },

  constructItem: function(n, cfg) {
    var item = $({tag: "span", klass: "item", style: "cursor: pointer;",
      text:     cfg.text,
      title:    cfg.title,
      tabindex: cfg.tabindex || this.tabindex++,
      on: {
        focus: this.onfocusitem.bind(this)
      }
    });
    item.cfg = cfg;
    item.index = n;
    item.action = cfg.choice ? this.nextChoice.bind(this, item, true) : cfg.action;
    this.setChoice(item, cfg.chosen);
    this.dom.append({tag: "div", dom: item});
    return item;
  },

  prevChoice: function(item, wrap) {
    item = item || this.selectedItem();
    if (item.cfg.choice) {
      if (item.cfg.chosen > 0)
        this.setChoice(item, item.cfg.chosen - 1);
      else if (wrap)
        this.setChoice(item, item.cfg.choice.length - 1);
    }
  },

  nextChoice: function(item, wrap) {
    item = item || this.selectedItem();
    if (item.cfg.choice) {
      if (item.cfg.chosen < (item.cfg.choice.length - 1))
        this.setChoice(item, item.cfg.chosen + 1);
      else if (wrap)
        this.setChoice(item, 0);
    }
  },

  setChoice: function(item, n) {
    if (item.cfg.choice) {
      var choice = item.cfg.choice;
      var chosen = item.cfg.chosen = to.number(n, 0);

      var label = $({tag: 'span', klass: 'choice', text: item.cfg.choice[chosen]});
      var prev  = $({tag: 'span', klass: 'prev',   text: (chosen==0               ? "" : "<")});
      var next  = $({tag: 'span', klass: 'next',   text: (chosen==choice.length-1 ? "" : ">")});

      if (chosen > 0)
        prev.on('click',  function(e) { this.prevChoice(item, false); Game.Event.stop(e); }.bind(this));
      if (chosen < choice.length-1)
        next.on('click', function(e) { this.nextChoice(item, false); Game.Event.stop(e); }.bind(this));

      item.update([prev, label, next]);
      item.cfg.action.call(this.game, item.cfg.chosen);
    }
  },

  item:          function(ev) { return $(ev).up('.item', true);      },
  selectedItem:  function()   { return this.dom.down('.selected');   },
  selectedIndex: function()   { return this.selectedItem().index;    },
  firstItem:     function()   { return this.dom.down('.item:first'); },
  lastItem:      function()   { return this.dom.down('.item:last');  },

  onfocusitem: function(ev) { this.select(this.item(ev)); },
  onmousemove: function(ev) { this.select(this.item(ev)); },

  prev: function()  { this.select(this.selectedIndex() - 1); },
  next: function()  { this.select(this.selectedIndex() + 1); },

  click: function() {  
    var item = this.selectedItem();
    if (item && item.action) {
      if (this.cfg.onclick)
        this.cfg.onclick.call(this.game, item);
      item.action.call(this.game);
    }
  },

  onclick: function(ev) {
    if (this.dom.visible())
      this.click(this.item(ev));
    return Game.Event.stop(ev);
  },

  select: function(obj) {
    if (is.valid(obj)) {
      var selected = this.selectedItem();
      var item     = is.number(obj) ? this.items[Math.min(Math.max(obj, 0), this.items.length-1)] : obj;
      if (selected != item) {
        if (selected)
          selected.removeClassName('selected');
        if (item) {
          item.addClassName('selected');
          item.focus();
        }
        if (this.dom.visible() && this.cfg.onselect)
          this.cfg.onselect.call(this.game, selected);
      }
    }
  },

  focus: function() {
    this.selectedItem().focus();
  },

  hide: function() {
    this.dom.hide();
  },

  show: function() {
    this.dom.show();
    this.selectedItem().focus();
  },

  fadeout: function(options) {
    this.dom.fadeout(options);
  },

  fadein: function(options) {
    options = options || {};
    var cb = options.onComplete;
    options.onComplete = function() {
      this.selectedItem().focus();
      if (cb)
        cb();
    }.bind(this);
    this.dom.fadein(options);
  }

});


