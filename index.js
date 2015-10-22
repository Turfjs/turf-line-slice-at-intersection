var linestring = require('turf-linestring'),
  featurecollection = require('turf-featurecollection');

/**
 * Takes a {@link LineString} and a Feature to segment it by.
 *
 * Any time the line intersects the feature, it will be segmented.
 *
 * @module turf/line-slice-at-intersection
 * @category misc
 * @param {Feature<LineString>} line line to segment
 * @param {Feature} segmenter feature to segment `line` by
 * @return {FeatureCollection<LineString>} segmented lines
 * @example
 * var line = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "LineString",
 *     "coordinates": [
 *       [
 *         -24.78515625,
 *         2.7235830833483856
 *       ],
 *       [
 *         -22.8515625,
 *         2.1967272417616712
 *       ],
 *       [
 *         -20.390625,
 *         5.003394345022162
 *       ],
 *       [
 *         -18.984375,
 *         2.6357885741666065
 *       ],
 *       [
 *         -14.94140625,
 *         4.8282597468669755
 *       ],
 *       [
 *         -11.337890625,
 *         7.536764322084078
 *       ],
 *       [
 *         -9.052734375,
 *         3.601142320158722
 *       ],
 *       [
 *         -6.328125,
 *         0.3515602939922709
 *       ]
 *     ]
 *   }
 * };
 *
 * var poly = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Polygon",
 *     "coordinates": [
 *       [
 *         [
 *           -20.91796875,
 *           9.882275493429953
 *         ],
 *         [
 *           -22.67578125,
 *           6.926426847059551
 *         ],
 *         [
 *           -21.005859375,
 *           1.6696855009865839
 *         ],
 *         [
 *           -18.45703125,
 *           5.090944175033399
 *         ],
 *         [
 *           -16.083984375,
 *           1.845383988573187
 *         ],
 *         [
 *           -13.798828125,
 *           8.928487062665504
 *         ],
 *         [
 *           -20.91796875,
 *           9.882275493429953
 *         ]
 *       ]
 *     ]
 *   }
 * };
 *
 * var features = turf.featurecollection([line,poly])
 * //=features
 *
 * var result = turf.lineSliceAtIntersection(line, poly);
 *
 * result.features.forEach(function(ft, ind) {
 *   ft.properties.stroke = (ind % 2 === 0) ? '#f40' : '#389979';
 * });
 *
 * //=result
 */
module.exports = function (line, segmenter) {
  var coordRings = [];
  var segmenterFeatures = (segmenter.type === 'FeatureCollection') ?
    segmenter.features :
    [segmenter];

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
        for (var p = 0; p < segmenterFeatures[i].geometry.coordinates.length; p++) {
          coordRings = coordRings.concat(segmenterFeatures[i].geometry.coordinates[p]);
        }
        break;
    }

    for (var j = 0; j < coordRings.length; j++) {
      segments = testLineAndRing(segments, coordRings[j]);
    }
  }

  return featurecollection(segments.map(function (segment) {
    return linestring(segment, line.properties);
  }));
};

// Tests the list of segments against a single polygon ring / line. Returns new segments
function testLineAndRing(segments, ring) {
  var tempSegments = [];

  for (var k = 0; k < segments.length; k++) {
    var curr = [];
    for (var l = 0; l < segments[k].length - 1; l++) {
      curr.push(segments[k][l]);

      for (var m = 0; m < ring.length - 1; m++) {

        if (equal(segments[k][l], ring[m])) {
          tempSegments.push(curr.slice());
          curr = [segments[k][l]];
          continue;
        }

        var is = linesIntersect(
          segments[k][l],
          segments[k][l + 1],
          ring[m],
          ring[m + 1]
        );

        if (is) {
          curr.push(is);
          tempSegments.push(curr.slice());
          curr = [is];
        }
      }
    }
    curr.push(segments[k][segments[k].length - 1]);
    tempSegments.push(curr.slice());
  }

  return tempSegments;
}


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
