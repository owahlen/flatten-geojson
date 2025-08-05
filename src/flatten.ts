import { difference, union, polygon, feature, featureCollection } from '@turf/turf';
import { Feature, FeatureCollection, Polygon, MultiPolygon, Geometry } from 'geojson';

// Define a custom type for typed polygons
type TypedPolygon = Feature<Polygon, { type: string }>;

/**
 * Flattens overlapping GeoJSON polygons so that the resulting polygons do not overlap,
 * preserving the 'type' attribute from topmost to bottommost.
 */
export function flattenPolygons(
  input: FeatureCollection<Polygon, { type: string }>
): FeatureCollection<Polygon, { type: string }> {
  const result: TypedPolygon[] = [];
  let covered: Feature<Polygon | MultiPolygon> | null = null;

  for (let i = input.features.length - 1; i >= 0; i--) {
    const current = input.features[i];

    // Step 1: Calculate difference geometry
    let diffGeometry: Geometry | null;
    if (covered) {
      const diff = difference(featureCollection([current, covered]));
      diffGeometry = diff ? diff.geometry : null;
    } else {
      diffGeometry = current.geometry;
    }

    if (!diffGeometry) continue;

    // Step 2: Handle geometry result
    if (diffGeometry.type === 'Polygon') {
      result.push(feature(diffGeometry, current.properties));
    } else if (diffGeometry.type === 'MultiPolygon') {
      for (const coords of diffGeometry.coordinates) {
        result.push(polygon(coords, current.properties));
      }
    }

    // Step 3: Update covered area
    const diffFeature = feature(diffGeometry, current.properties);
    covered = covered
      ? union(featureCollection([covered, diffFeature])) as Feature<Polygon | MultiPolygon>
      : diffFeature;
  }

  return featureCollection(result);
}
