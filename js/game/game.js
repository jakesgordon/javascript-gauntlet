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

