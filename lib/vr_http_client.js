
module.exports = function VrHttpClient(API_KEY, ID) {

  var util = require("util");
  var querystring = require('querystring');

  if (typeof ID == 'undefined') ID = '';
  
  var API_DATA = require('url').parse("https://www.vr.org/vapi");
  var API_HOST = API_DATA.hostname;
  var API_PATH = API_DATA.pathname;
  var API_PROTOCOL = API_DATA.protocol.slice(0,-1);
  var API_PORT = (API_PROTOCOL == 'http') ? 80 : 443;
  
  var http = require(API_PROTOCOL);
  
  function apiRequest(path, method, data, callback) {

    var instance = this.context;  // VrCloud instance

    path = util.format('%s/%s?key=%s', API_PATH, path.replace(/\{id\}/g, ID), API_KEY).replace('/?', '?');

    var requestBody;
    
    if (data) {
     switch (method) {
       case 'GET':
         path += (path.indexOf('?') > 0) ? '&' : '?';
         path += querystring.stringify(data);
         break;
       case 'POST':
       case 'PUT':
         requestBody = JSON.stringify(data);
         break;
     }
    }
    
    var options = {
      host: API_HOST,
      path: path,
      method: method,
      port: API_PORT
    }

    var req = http.request(options, function(res) {
      
      var json = '';
      
      res.on('data', function(chunk) {
        json += chunk.toString('utf8');
      });
      
      res.on('error', function(err) {
        callback.call(instance, err);
      });
      
      res.on('end', function() {
        try {
          callback.call(instance, null, JSON.parse(json));
        } catch(err) {
          callback.call(instance, new Error("Error parsing JSON response"));
        }
      });

    });

    req.on('error', function(err) {
      callback.call(instance, new Error("Error processing request"));
    });

    if (requestBody) req.write(requestBody);
    
    req.end();
  }
  
  return {
    
    get: function(path, data, callback) {
      if (typeof callback == 'undefined') {
        callback = data;
        this.get(path, null, callback);
      } else {
        apiRequest.apply(this, [path, 'GET', data, callback]);
      }
    },

    post: function(path, data, callback) {
      apiRequest.apply(this, [path, 'POST', data, callback]);
    },

    put: function(path, data, callback) {
      apiRequest.apply(this, [path, 'PUT', data, callback]);
    },

  }

}
