# turf-line-slice-at-intersection

Slice a line whenever it intersects other features


### `turf.line-slice-at-intersection(line, segmenter)`

Takes a LineString and a Feature to segment it by. 

Any time the line intersects the feature, it will be segmented.

### Parameters

| parameter   | type                    | description                  |
| ----------- | ----------------------- | ---------------------------- |
| `line`      | Feature\.\<LineString\> | line to segment              |
| `segmenter` | Feature                 | feature to segment `line` by |


### Example

```js
var line = {
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [
        -24.78515625,
        2.7235830833483856
      ],
      [
        -22.8515625,
        2.1967272417616712
      ],
      [
        -20.390625,
        5.003394345022162
      ],
      [
        -18.984375,
        2.6357885741666065
      ],
      [
        -14.94140625,
        4.8282597468669755
      ],
      [
        -11.337890625,
        7.536764322084078
      ],
      [
        -9.052734375,
        3.601142320158722
      ],
      [
        -6.328125,
        0.3515602939922709
      ]
    ]
  }
};

var poly = {
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [
          -20.91796875,
          9.882275493429953
        ],
        [
          -22.67578125,
          6.926426847059551
        ],
        [
          -21.005859375,
          1.6696855009865839
        ],
        [
          -18.45703125,
          5.090944175033399
        ],
        [
          -16.083984375,
          1.845383988573187
        ],
        [
          -13.798828125,
          8.928487062665504
        ],
        [
          -20.91796875,
          9.882275493429953
        ]
      ]
    ]
  }
};

var features = turf.featurecollection([line,poly])
//=features

var result = turf.lineSliceAtIntersection(line, poly);

result.features.forEach(function(ft, ind) {
  ft.properties.stroke = (ind % 2 === 0) ? '#f40' : '#389979';
});

//=result
```


**Returns** `FeatureCollection.<LineString>`, segmented lines

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install turf-line-slice-at-intersection
```

## Tests

```sh
$ npm test
```


