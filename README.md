# turf-shape-segment




### `turf.shape-segment(line, segmenter)`

Takes a LineString and a Feature to segment it by. 

Any time the line intersects the feature, it will be segmented.

### Parameters

| parameter   | type                    | description                  |
| ----------- | ----------------------- | ---------------------------- |
| `line`      | Feature\.\<LineString\> | line to segment              |
| `segmenter` | Feature                 | feature to segment `line` by |



**Returns** `FeatureCollection.<LineString>`, segmented lines

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install turf-shape-segment
```

## Tests

```sh
$ npm test
```


