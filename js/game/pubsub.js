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
