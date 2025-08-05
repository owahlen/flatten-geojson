import { FeatureCollection, Polygon } from 'geojson';
import { featureCollection, polygon } from '@turf/turf';
import { flattenPolygons } from '../flatten';

describe('flattenPolygons', () => {
  const coordsA = [[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]];
  const coordsB = [[2, 2], [6, 2], [6, 6], [2, 6], [2, 2]];
  const coordsC = [[1, 1], [5, 1], [5, 5], [1, 5], [1, 1]];

  const input: FeatureCollection<Polygon, { type: string }> = featureCollection([
    polygon([coordsA], { type: 'A' }),
    polygon([coordsB], { type: 'B' }),
    polygon([coordsC], { type: 'C' }),
  ]);

  it('preserves type order in flattened output', () => {
    const result = flattenPolygons(input);
    expect(result.features.map(f => f.properties.type)).toEqual(['C', 'B', 'A']);
  });
});
