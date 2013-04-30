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


