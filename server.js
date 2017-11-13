/*
 The MIT License (MIT)

 Copyright (c) 2013 Piotr Raczynski, pio[dot]raczynski[at]gmail[dot]com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

var inherits= require('super');
var fs = require('fs');
var SqueezeRequest = require('./squeezerequest');
var SqueezePlayer = require('./squeezeplayer');

function SqueezeServer(address, port, username, password) {

    SqueezeServer.super_.apply(this, arguments);
    var defaultPlayer = "00:00:00:00:00:00";
    var self = this;
    this.players = [];
    this.apps = [];
    var subs = {};
    this.on = function(channel, sub) {
        subs[channel] = subs[channel] || [];
        subs[channel].push(sub);
    };

    this.emit = function (channel) {
        var args = [].slice.call(arguments, 1);
        for (var sub in subs[channel]) {
            subs[channel][sub].apply(void 0, args);
        }
    };

    this.playerUpdateInterval = 2000;

    this.getPlayerCount = function (callback) {
        return this.request(defaultPlayer, ["player", "count", "?"], callback);
    };

    this.getPlayerId = function (id, callback) {
        return this.request(defaultPlayer, ["player", "id", id, "?"], callback);
    };

    this.getPlayerIp = function (playerId, callback) {
        return this.request(defaultPlayer, ["player", "ip", playerId, "?"], callback);
    };

    this.getPlayerName = function (playerId, callback) {
        return this.request(defaultPlayer, ["player", "name", playerId, "?"], callback);
    };

    this.getSyncGroups = function (callback) {
        return this.request(defaultPlayer, ["syncgroups", "?"], callback);
    };

    this.getApps = function (callback) {
        return this.request(defaultPlayer, ["apps", 0, 100], callback);
    };

    this.getPlayers = function (callback) {
      if (typeof callback === 'undefined') { // Promise style

        return self.request(defaultPlayer, ["players", 0, 100])
          .then( function (reply) {
                reply.result = reply.result.players_loop;
                return reply;
          } );

      } else { // Callback style

        self.request(defaultPlayer, ["players", 0, 100], function (reply) {
            if (reply.ok)
                reply.result = reply.result.players_loop;
            callback(reply);
        });

      }
    };

    function register() {

        self.getPlayers(function (reply) { //TODO refactor this
            var players = reply.result;
            for (var pl in players) {
                if (!self.players[players[pl].playerid]) { // player not on the list
                    self.players[players[pl].playerid] = new SqueezePlayer(players[pl].playerid, players[pl].name, self.address, self.port, self.username, self.password);
                }
            }
            self.emit('registerPlayers');
        });

        self.on('registerPlayers', function () {
            self.getApps(function (reply) { //TODO refactor this
                if (reply.ok) {
                    var apps = reply.result.appss_loop;
                    var dir = __dirname + '/';
                    fs.readdir(dir, function (err, files) {
                        files.forEach(function (file) {
                            var fil = file.substr(0, file.lastIndexOf("."));
                            for (var pl in apps) {
                                if (fil === apps[pl].cmd) {
                                    // MVG: this will be a problem for webpack if we use this
                                    var app = require(dir + file);
                                    self.apps[apps[pl].cmd] = new app(defaultPlayer, apps[pl].name, apps[pl].cmd, self.address, self.port, self.username, self.password);
                                    /* workaround, app needs existing player id so first is used here */
                                }
                            }
                        });
                        self.emit('register');
                    });
                } else
                    self.emit('register');
            });
        });
    }

    register();
}

inherits(SqueezeServer, SqueezeRequest);

module.exports = SqueezeServer;
