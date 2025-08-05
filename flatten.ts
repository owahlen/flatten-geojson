import { difference, union, polygon, featureCollection } from '@turf/turf';
import { Feature, FeatureCollection, Polygon } from 'geojson';

// Define a custom type for typed polygons
type TypedPolygon = Feature<Polygon, { type: string }>;

/**
 * Flattens overlapping GeoJSON polygons so that the resulting polygons do not overlap,
 * preserving the 'type' attribute.
 */
export function flattenPolygons(
  input: FeatureCollection<Polygon, { type: string }>
): FeatureCollection<Polygon, { type: string }> {
  const result: TypedPolygon[] = [];
  let covered: Feature<Polygon> | null = null;

  // Process features from topmost to bottommost
  for (let i = input.features.length - 1; i >= 0; i--) {
    const current = input.features[i];

    // Subtract already covered areas via a FeatureCollection of [current, covered]
    const diffFeature = covered
      ? difference(featureCollection([current, covered]))
      : current;
    if (!diffFeature) continue;

    // Handle Polygon and MultiPolygon results
    if (diffFeature.geometry.type === 'Polygon') {
      result.push(diffFeature as TypedPolygon);
    } else if (diffFeature.geometry.type === 'MultiPolygon') {
      for (const coords of diffFeature.geometry.coordinates) {
        result.push(polygon(coords, current.properties) as TypedPolygon);
      }
    }

    // Update the covered area by unioning covered and diffFeature
    covered = covered
      ? union(featureCollection([covered, diffFeature])) as Feature<Polygon>
      : diffFeature as Feature<Polygon>;
  }

  return featureCollection(result);
}
