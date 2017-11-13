/*
 The MIT License (MIT)

 Copyright (c) 2013-2015 Piotr Raczynski, pio[dot]raczynski[at]gmail[dot]com

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

var inherits = require('super');
var SqueezeRequest = require('./squeezerequest');

function SqueezePlayer(playerId, name, address, port, username, password) {

    this.playerId = playerId;
    this.name = name;

    SqueezePlayer.super_.apply(this, [address, port, username, password]);

    this.clearPlayList = function (callback) {
        return this.request(playerId, ["playlist", "clear"], callback);
    };

    this.getMode = function (callback) {
        return this.request(playerId, ["mode", "?"], callback);
    };

    this.setName = function (name, callback) {
        return this.request(playerId, ["name", name], callback);
    };

    this.getName = function (callback) {
        return this.request(playerId, ["name", "?"], callback);
    };

    this.getCurrentTitle = function (callback) {
        if( typeof callback === 'undefined' ){ // Promise style
          return this.request(playerId, ["current_title", "?"]).then( function(reply) {
            reply.result = reply.result._current_title;
            return reply;
          });
        }

        this.request(playerId, ["current_title", "?"], function (reply) {
            if (reply.ok)
                reply.result = reply.result._current_title;
            callback(reply);
        });
    };

    this.getTitle = function (callback) {
        if( typeof callback === 'undefined' ){ // Promise style
          return this.request(playerId, ["title", "?"]).then( function(reply) {
            reply.result = reply.result._title;
            return reply;
          });
        }

        this.request(playerId, ["title", "?"], function (reply) {
            if (reply.ok)
                reply.result = reply.result._title;
            callback(reply);
        });
    };

    this.getArtist = function (callback) {
        if( typeof callback === 'undefined' ){ // Promise style
          return this.request(playerId, ["artist", "?"]).then( function (reply) {
            reply.result = reply.result._artist;
            return reply;
          });
        }

        this.request(playerId, ["artist", "?"], function (reply) {
            if (reply.ok)
                reply.result = reply.result._artist;
            callback(reply);
        });
    };

    this.getAlbum = function (callback) {
        if( typeof callback === 'undefined' ){ // Promise style
          return this.request(playerId, ["album", "?"]).then( function (reply) {
            reply.result = reply.result._album;
            return reply;
          });
        }

        this.request(playerId, ["album", "?"], function (reply) {
            if (reply.ok)
                reply.result = reply.result._album;
            callback(reply);
        });
    };

    this.getCurrentRemoteMeta = function (callback) {
        if( typeof callback === 'undefined' ){ // Promise style
          return this.request(playerId, ["status"]).then( function (reply) {
            reply.result = reply.result.remoteMeta;
            return reply;
          });
        }

        this.request(playerId, ["status"], function (reply) {
            if (reply.ok)
                reply.result = reply.result.remoteMeta;
            callback(reply);
        });
    };

    this.getStatus = function (callback) {
        return this.request(playerId, ["status"], callback);
    };

    this.getStatusWithPlaylist = function (from, to, callback) {
        if( typeof callback === 'undefined' ){ // Promise style
          return this.request(playerId, ["status", from, to]).then( function (reply) {
            reply.result = reply.result;
            return reply;
          });
        }

        this.request(playerId, ["status", from, to], function (reply) {
            if (reply.ok)
                reply.result = reply.result;
            callback(reply);
        });
    };

    this.getPlaylist = function (from, to, callback) {
        if( typeof callback === 'undefined' ){ // Promise style
          return this.request(playerId, ["status", from, to]).then( function (reply) {
            reply.result = reply.result.playlist_loop;
            return reply;
          });
        }

        this.request(playerId, ["status", from, to], function (reply) {
            if (reply.ok)
                reply.result = reply.result.playlist_loop;
            callback(reply);
        });
    };

    this.play = function (callback) {
        return this.request(playerId, ["play"], callback);
    };

    this.playIndex = function (index, callback) {
        console.log("index: " + index);
        return this.request(playerId, ["playlist", "index", index], callback);
    };

    this.setPlaylist = function (url, callback) {
        console.log("url: " + url);
        return this.request(playerId, ["playlist", "play", url], callback);
    };

    this.pause = function (callback) {
        return this.request(playerId, ["pause"], callback);
    };

    this.next = function (callback) {
        return this.request(playerId, ["button", "jump_rew"], callback);
    };

    this.previous = function (callback) {
        return this.request(playerId, ["button", "jump_rew"], callback);
    };

    this.next = function (callback) {
        return this.request(playerId, ["button", "jump_fwd"], callback);
    };

    this.playlistDelete = function(index, callback) {
        return this.request(playerId, ["playlist", "delete", index], callback);
    };

    this.playlistMove = function(fromIndex, toIndex, callback) {
        return this.request(playerId, ["playlist", "move", fromIndex, toIndex], callback);
    };

    this.playlistSave = function(playlistName, callback) {
        return this.request(playerId, ["playlist", "save", playlistName], callback);
    };

    this.sync = function(syncTo, callback) {
        return this.request(playerId, ["sync", syncTo], callback);
    };

    this.unSync = function(callback) {
        return this.request(playerId, ["sync", "-"], callback);
    };

    this.seek = function(seconds, callback) {
        return this.request(playerId, ["time", seconds], callback);
    };

    this.setVolume = function(volume, callback) {
        return this.request(playerId, ["mixer", "volume", volume], callback);
    };

    this.getVolume = function(callback) {
        if( typeof callback === 'undefined' ){ // Promise style
          return this.request(playerId, ["mixer", "volume", "?"]).then( function(reply) {
              reply.result = reply.result._volume;
            return reply;
          });
        }

        this.request(playerId, ["mixer", "volume", "?"], function(reply) {
          if (reply.ok)
              reply.result = reply.result._volume;
          callback(reply);
        });
    };

    this.randomPlay = function(target, callback) {
        return this.request(playerId, ["randomplay", target], callback);
    };
    this.power = function(state, callback) {
        return this.request(playerId, ["power", state], callback);
    };
}

inherits(SqueezePlayer, SqueezeRequest);

module.exports = SqueezePlayer;
