Javascript Gauntlet
===================

An HTML5 Gauntlet-style Game

 * [play the game](http://codeincomplete.com/projects/gauntlet/index.html)
 * read a [blog article](http://codeincomplete.com/posts/2013/4/30/javascript_gauntlet/)
 * view the [source](https://github.com/jakesgordon/javascript-gauntlet)

>> NOTE: single player only at this time, multiplayer coming later

SUPPORTED BROWSERS
==================

 - Chrome 24+
 - Firefox 18+
 - IE 9+

KNOWN ISSUES
============

 - No support for touch/mobile devices
 - Startup (and level transition) can be slow over a slow network connection (duh)

TODO
====

 * POLISH - better scoreboard fonts
 * POLISH - let doors have corners (and choose more wisely between horz/vert when up against odd walls)
 * POLISH - render monsters top down with slight overlap  for pseudo-3d

DEVELOPMENT
===========

The game is 100% client side javascript and css. It should run when served up by any web server.

Any changes to the following files will be reflected immediately on refresh of the browser

  - js/gauntlet.js
  - css/gauntlet.css
  - images/
  - sounds/
  - levels/

However, if you modify the js/game/ or js/vendor/ javascript files, the unified versions need to be regenerated:

    js/vendor.js        # the unified 3rd party vendor scripts (sizzle, animator, audio-fx, stats, state-machine)
    js/game.js          # the unified general purpose game engine

If you have the Ruby language available, Rake tasks can be used to auto generate these unified files:

    rake assets:create   # re-create unified javascript/css asset files on demand
    rake assets:server   # run a simple rack server that automatically regenerates the unified files when the underlying source is modified

Attributions
=============

All music is licensed, royalty-free, from [Lucky Lion Studios](http://luckylionstudios.com/) for this project only. If you re-use this
project for your own purposes you must license your own music please.

All sound effects are licensed, royalty-free from [Premium Beat](http://www.premiumbeat.com/sfx) for this project only. If you re-use this
project for your own purposes you must license your own sound effects please.

Background tilesets (walls, floors, doors) are provided by

 - [Ricardo Chirino](ricardochirino.com)
 - [Open Game Art](http://opengameart.org/content/gauntlet-like-tiles)

Entity sprites (players, monsters, treasure, etc) are almost certainly ripped from an old (s)NES console ?

 - [Open Game Art](http://opengameart.org/forumtopic/request-for-tileset-spritesheet-similar-to-gauntlet-ii)

License
=======

[MIT](http://en.wikipedia.org/wiki/MIT_License) license.

