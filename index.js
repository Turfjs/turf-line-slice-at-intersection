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

  switch (segmenter.geometry.type) {
    case 'LineString':
      coordRings = [segmenter.geometry.coordinates];
      break;
    case 'MultiLineString':
    case 'Polygon':
      coordRings = segmenter.geometry.coordinates;
      break;
    case 'MultiPolygon':
      segmenter.geometry.coordinates.forEach(function (polygon) {
        coordRings = coordRings.concat(polygon);
      });
      break;
  }

  var segments = [line.geometry.coordinates.slice()];

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
            console.log("EOUAL")
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

  return featurecollection(segments.map(function (segment) {
    return linestring(segment, line.properties);
  }));
};


function equal(pt1, pt2) {
  return (pt1[0] === pt2[0] && pt1[1] === pt2[1]);
}

function linesIntersect(l1Start, l1End, l2Start, l2End) {
  var a1 = {
      x: l1Start[0],
      y: l1Start[1]
    },
    a2 = {
      x: l1End[0],
      y: l1End[1]
    },
    b1 = {
      x: l2Start[0],
      y: l2Start[1]
    },
    b2 = {
      x: l2End[0],
      y: l2End[1]
    },
    uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
    ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
    uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

  if (uB !== 0) {
    var ua = uaT / uB,
      ub = ubT / uB;
    if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
      return [a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)];
    }
  }
}
