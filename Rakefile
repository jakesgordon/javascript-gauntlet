require 'bundler/setup'
require 'unified_assets/tasks'

UnifiedAssets::Tasks.new do |t|
  t.minify = false
  t.assets = {

    "js/vendor.js"  => [
      'js/game/vendor/stats.js',            # https://github.com/mrdoob/stats.js
      'js/game/vendor/sizzle.js',           # http://sizzlejs.com/
      'js/game/vendor/animator.js',         # http://berniesumption.com/software/animator/
      'js/game/vendor/audio-fx.js',         # https://github.com/jakesgordon/javascript-audio-fx
      'js/game/vendor/state-machine.js',    # https://github.com/jakesgordon/javascript-state-machine
    ],

    "js/game.js" => [
      'js/game/base.js',
      'js/game/game.js',
      'js/game/pubsub.js',
      'js/game/dom.js',
      'js/game/key.js',
      'js/game/math.js',
    ]

  }
end

