var linestring = require('turf-linestring'),
  featurecollection = require('turf-featurecollection');

/**
 * Takes a {@link LineString} and a Feature to segment it by. 
 *
 * Any time the line intersects the feature, it will be segmented.
 *
 * @module turf/shape-segment
 * @category misc
 * @param {Feature<LineString>} line line to segment
 * @param {Feature} segmenter feature to segment `line` by
 * @return {FeatureCollection<LineString>} segmented lines
 *
 */
module.exports = function (line, segmenter) {
  var coordRings = [];  
  var segmenterFeatures = (segmenter.type === 'FeatureCollection') ?
    segmenter.features :
    [segmenter]

  var segments = [line.geometry.coordinates.slice()];

  for (var i = 0; i < segmenterFeatures.length; i++) {
    switch (segmenterFeatures[i].geometry.type) {
      case 'LineString':
        coordRings = [segmenterFeatures[i].geometry.coordinates];
        break;
      case 'MultiLineString':
      case 'Polygon':
        coordRings = segmenterFeatures[i].geometry.coordinates;
        break;
      case 'MultiPolygon':
        segmenterFeatures[i].geometry.coordinates.forEach(function (polygon) {
          coordRings = coordRings.concat(polygon);
        });
        break;
    }

    coordRings.forEach(function (ring) {
      // for each segment of the segmenter and each segment of the line,
      // find intersections and insert them.
      var tempSegments = [];

      for (var s = 0; s < segments.length; s++) {
        var curr = [];
        for (var i = 0; i < segments[s].length - 1; i++) {
          curr.push(segments[s][i]);

          for (var j = 0; j < ring.length - 1; j++) {

            if (equal(segments[s][i], ring[j])) {
              tempSegments.push(curr.slice());
              curr = [segments[s][i]];
              continue;
            }


            var is = linesIntersect(
              segments[s][i],
              segments[s][i + 1],
              ring[j],
              ring[j + 1]
            );

            if (is) {
              curr.push(is);
              tempSegments.push(curr.slice());
              curr = [is];
            }
          }
        }
        curr.push(segments[s][segments[s].length - 1]);
        tempSegments.push(curr.slice());
      }
      segments = tempSegments;
    });
  }

  return featurecollection(segments.map(function (segment) {
    return linestring(segment, line.properties);
  }));
};


function equal(pt1, pt2) {
  return (pt1[0] === pt2[0] && pt1[1] === pt2[1]);
}

function linesIntersect(a1, a2, b1, b2) {
  var uaT = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0]),
    ubT = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0]),
    uB = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1]);

  if (uB !== 0) {
    var ua = uaT / uB,
      ub = ubT / uB;
    if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
      return [a1[0] + ua * (a2[0] - a1[0]), a1[1] + ua * (a2[1] - a1[1])];
    }
  }
}
