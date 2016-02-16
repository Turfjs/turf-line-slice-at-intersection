var test = require('tap').test,
  glob = require('glob'),
  fs = require('fs'),
  seg = require('../');

var REGEN = process.env.REGEN || false;

glob(__dirname + '/fixtures/in/**.json', function (err, files) {
  files.forEach(function (file) {
    test(function (t) {
      var json = JSON.parse(fs.readFileSync(file, 'utf8'));
      var segmented = seg(json[0], json[1]);

      if (REGEN) fs.writeFileSync(file.replace(/in/, 'out'), JSON.stringify(segmented));

      t.deepEqual(segmented, JSON.parse(fs.readFileSync(file.replace(/in/, 'out'))));
      if (segmented.features.length > 1) {
        t.notEqual(
          segmented.features[0].properties,
          segmented.features[1].properties,
          'properties should be unique'
        );
      }
      t.end();
    });
  });
});
