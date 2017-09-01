# Sunburst bar chart

A [D3](http://d3js.org) reusable sunburst bar chart This helps represent values as on/off boxes rather than a simple bar chart extending from 0 to value.

## Example
Refer [example.html](example.html) for a usage

## Implementation

The implementation follows the [reusable charts](http://bost.ocks.org/mike/chart/) convention proposed by Mike Bostock.

## Configuration

CSS configuration has been exposed to outside using style classes. Change the `svg` font depending on the `edge` you configure for the chart

**I recommend to use style classes as in [example.html](example.html) and to not change the font-sizes for labels but you are free to do the same too.**

Allowed configuration values are
* **edge** - Length of the enclosing square box, default `400px`
* **maxBarValue** - Maximum bar value, default `5`
* **rotation** - Rotation of the chart, default `-95 degrees`

# License

MIT license
