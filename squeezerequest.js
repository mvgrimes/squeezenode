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

var jayson = require('jayson');
var inherits = require('super');

function SqueezeRequest(address, port, username, password) {
  
    this.address = (address !== undefined) ? address : "localhost";
    this.port = (port !== undefined) ? port : 9000;
    this.username = username;
    this.password = password;
    var jsonrpc = this.address + ':' + this.port + '/jsonrpc.js';
    var client;
    if (this.address.substr(0,5) === 'https') {
      client = jayson.client.https(jsonrpc);
    } else {
      client = jayson.client.http(jsonrpc);
    }
    client.options.version = 1;

    // Add a header for basic authentication if a username and password are given

    if (username && password) {
        if (! client.options.headers)
            client.options.headers = {};
        client.options.headers['Authorization'] = formatBasicHeader(username, password);
    }

    function handle(err, reply, callback) {
        var result = {};
        if (err) {
            result = err;
            result.ok = false;
        }
        else {
            result = reply;
            result.ok = true;
        }
        if (callback)
            callback(result);
    }

    function handleWithPromise(err, reply, resolve, reject) {
        var result = {};
        if (err) {
            result = err;
            result.ok = false;
            reject(result);
        }
        else {
            result = reply;
            result.ok = true;
            resolve(result);
        }
    }

    this.request = function (player, params, callback) {
        var finalParams = [];
        finalParams.push(player);
        finalParams.push(params);

        if( typeof callback === 'undefined' ){ // Promise style

          return new Promise( function(resolve, reject) {
            client.request('slim.request', finalParams, null, function (err, reply) {
                return handleWithPromise(err, reply, resolve, reject);
            });
          });

        } else { // Callback style

          client.request('slim.request', finalParams, null, function (err, reply) {
              handle(err, reply, callback);
          });

        }
    };
}

/**
 * Function to format the header for basic authentication.
 */

function formatBasicHeader(username, password) {
  var tok = username + ':' + password;
  var hash = new Buffer(tok).toString('base64');
  return "Basic " + hash;
}

module.exports = SqueezeRequest;
