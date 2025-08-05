import { featureCollection, polygon } from '@turf/turf';
import { FeatureCollection, Polygon } from 'geojson';
import { flattenPolygons } from '../src/flatten';
import * as fs from 'fs';
import * as path from 'path';

type ColorMap = { [type: string]: string };

/**
 * Decorates each feature with style properties based on its "type".
 * This is for visualization purposes (e.g., geojson.io).
 */
function decorateWithColors(
  geojson: FeatureCollection<Polygon, { type: string }>
): FeatureCollection<Polygon, any> {
  const colorMap: ColorMap = {
    A: '#ff0000', // red
    B: '#00ff00', // green
    C: '#0000ff', // blue
  };

  return {
    ...geojson,
    features: geojson.features.map(feature => {
      const type = feature.properties.type;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          fill: colorMap[type] ?? '#cccccc',
          'fill-opacity': 0.5,
          stroke: '#000000',
          'stroke-width': 1,
        },
      };
    }),
  };
}

describe('flattenPolygons with overlaps', () => {
  const coordsA = [
    [9.95, 53.55],
    [10.05, 53.55],
    [10.05, 53.65],
    [9.95, 53.65],
    [9.95, 53.55],
  ];

  const coordsB = [
    [10.0, 53.6],
    [10.1, 53.6],
    [10.1, 53.7],
    [10.0, 53.7],
    [10.0, 53.6],
  ];

  const coordsC = [
    [9.98, 53.58],
    [10.08, 53.58],
    [10.08, 53.68],
    [9.98, 53.68],
    [9.98, 53.58],
  ];

  const input: FeatureCollection<Polygon, { type: string }> = featureCollection([
    polygon([coordsA], { type: 'A' }),
    polygon([coordsB], { type: 'B' }),
    polygon([coordsC], { type: 'C' }),
  ]);

  it('preserves type order in flattened output', () => {
    const result = flattenPolygons(input);

    const decoratedInput = decorateWithColors(input);
    const decoratedOutput = decorateWithColors(result);

    // Output GeoJSONs for inspection in geojson.io
    const outputDir = path.resolve(__dirname, '../geojson');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    fs.writeFileSync(path.join(outputDir, 'input.geojson'), JSON.stringify(decoratedInput, null, 2));
    fs.writeFileSync(path.join(outputDir, 'output.geojson'), JSON.stringify(decoratedOutput, null, 2));

    // Basic check: all expected types are present
    const types = decoratedOutput.features.map(f => f.properties.type);
    expect(types).toEqual(expect.arrayContaining(['A', 'B', 'C']));
  });
});
