
var HttpClient = require('./vr_http_client.js');

module.exports = {

  createClient: function(apiKey, id) {

    var util = require('util');
    var client = new HttpClient(apiKey, id);
    
    if (typeof apiKey == 'undefined') apiKey = '';
    if (typeof id == 'undefined') id = '';

    return client.context = {
      
      summary: function(callback) {
        client.get("cloud/serversummary/{id}", callback);
      },
      
      bandwidthReport: function(callback) {
        client.get("cloud/servermonthlybw/{id}", callback);
      },

      networkIps: function(callback) {
        client.get("cloud/networkips/{id}", callback);
      },

      ipv4: function(callback) {
        client.get("cloud/ipv4/{id}", callback);
      },

      ipv6: function(callback) {
        client.get("cloud/ipv6/{id}", callback);
      },

      osList: function(callback) {
        client.get("cloud/images", callback);
      },

      locations: function(callback) {
        client.get("cloud/locations", callback);
      },

      buy: function(plan, callback) {
        client.get(util.format("cloud/buy/%s", plan), callback);
      },

      buyBuild: function(options, callback) {
        // @spec options: {plan: string(), location: int(), image: int(), fqdn: string(), password: string()}
        client.post("cloud/buy_build", options, callback);
      },

      plans: function(location, callback) {
        // @spec location: Location ID (integer, can be obtained using the `locations` method)
        if (typeof callback == 'undefined') {
          callback = location;
          client.get("cloud/sizes", callback);
        } else {
          client.get("cloud/sizes", {location: location}, callback);
        }
      },

      build: function(options, callback) {
        // @spec options: {location: int(), image: int(), fqdn: string(), password: string()}
        options.mbpkgid = id;
        client.post("cloud/server/build/{id}", options, callback);
      },

      status: function(callback) {
        client.get("cloud/status/{id}", callback);
      },

      rescueStart: function(password, callback) {
        var options = {
          mbpkgid: id,
          rescue_pass: password
        }
        client.post("cloud/server/start_rescue/{id}", options, callback);
      },

      rescueStop: function(callback) {
        var options = {
          mbpkgid: id
        }
        client.post("cloud/server/stop_rescue/{id}", options, callback);
      },

      server: function(callback) {
        client.get("cloud/server/{id}", callback);
      },

      servers: function(callback) {
        client.get("cloud/servers", callback);
      },

      package: function(callback) {
        client.get("cloud/package/{id}", callback);
      },

      packages: function(callback) {
        client.get("cloud/packages", callback);
      },

      shutdown: function(force, callback) {
        if (typeof callback == 'undefined') {
          this.shutdown(false, callback);
        } else {
          var options = {mbpkgid: id}
          if (force) options.force = 1;
          client.post("cloud/server/shutdown/{id}", options, callback);
        }
      },

      reboot: function(force, callback) {
        if (typeof callback == 'undefined') {
          this.reboot(false, callback);
        } else {
          var options = {mbpkgid: id};
          if (force) options.force = 1;
          client.post("cloud/server/reboot/{id}", options, callback);
        }
      },

      start: function(callback) {
        var options = {mbpkgid: id};
        client.post("cloud/server/start/{id}", options, callback);
      },

      delete: function(callback) {
        var options = {mbpkgid: id};
        client.post("cloud/server/delete/{id}", options, callback);
      },

      cancel: function(callback) {
        var options = {mbpkgid: id};
        client.post("cloud/cancel", options, callback);
      },

      unlink: function(callback) {
        client.get("cloud/unlink/{id}", callback);
      },

      rootPassword: function(options, callback) {
        // @spec options: {email: string(), rootpass: string(), password: string()}
        client.post("cloud/server/password/{id}", options, callback);
      },

      suspend: function(callback) {
        
        this.server(function(err, server) {
          
          if (err) {
            
            callback.call(this, err);

          } else {

            var options = {
              kernel_id: server.kernel_id,
              disk_type: server.disk_type,
              boot: server.boot,
              fqdn: server.fqdn,
              vcpus: server.vcpus,
              autorescue: 0  // Prevent the server from booting automatically
            }

            // Set server options
            this.options(options, function(err, response) {

              if (err) {
                
                callback.call(this, err);
                
              } else {
                
                // Shutdown server
                this.shutdown(true, callback);

              }

            });
            
          }

        });

      },

      unsuspend: function(callback) {

        this.server(function(err, server) {

          if (err) {

            callback.call(this, err);

          } else {

            var options = {
              kernel_id: server.kernel_id,
              disk_type: server.disk_type,
              boot: server.boot,
              fqdn: server.fqdn,
              vcpus: server.vcpus,
              autorescue: 1  // Make the server boot automatically
            }

            // Set server options
            this.options(options, function(err, response) {

              if (err) {

                callback.call(this, err);

              } else {
                
                // Start server
                this.start(callback);

              }
              
            });
            
          }
          
        });
        
      },

      ipv4Rdns: function(options, callback) {
        // @spec options: {id: int(), reverse: string()}
        client.put(util.format("cloud/ipv4/%d", options.id), options, callback);
      },

      ipv6Rdns: function(options, callback) {
        // @spec options: {id: int(), reverse: string()}
        client.put(util.format("cloud/ipv6/%d", options.id), options, callback);
      },

      options: function(options, callback) {
        // @spec options: any server property. Obtain with `vr.server()`
        options.mbpkgid = id;
        client.put("cloud/server/{id}", options, callback);
      }

    }
    
  }
  
}
