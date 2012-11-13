
var MBPKGID = '';
var API_KEY = '';

var vrCloud = require('./lib/vr_cloud.js');

var vr = vrCloud.createClient(API_KEY, MBPKGID);

vr.summary(function(err, response) {
  console.log(err || response);
});
