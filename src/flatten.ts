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

  // covered represents the entire (multi-)polygon that has already been processed
  // while iterating deeper into the feature layers.
  let covered: Feature<Polygon | MultiPolygon> | null = null;

  for (let i = input.features.length - 1; i >= 0; i--) {
    const current = input.features[i];

    // Step 1: Calculate difference geometry of current (multi-)polygon and already covered polygon area
    // Afterward, diffGeometry represents the (multi-)polygon of the current feature
    // without the (multi-)polygon already covered.
    let diffGeometry: Geometry | null;
    if (covered) {
      // diff is a new polygon consisting of the current (multi-)polygon without the already covered (multi-)polygon
      // or null if the covered polygon completely overlaps the current one
      const diff = difference(featureCollection([current, covered]));
      diffGeometry = diff ? diff.geometry : null;
    } else {
      // if processing the first feature, use the current geometry as diffGeometry
      diffGeometry = current.geometry;
    }

    if (!diffGeometry) continue; // if the covered polygon overlaps the current polygon completely

    // Step 2: Push the diffGeometry with the current type to the result array of TypedPolygons.
    if (diffGeometry.type === 'Polygon') {
      // For polygons build a new feature from the diffGeometry
      // and the properties of the current feature and push it as a result
      result.push(feature(diffGeometry, current.properties));
    } else if (diffGeometry.type === 'MultiPolygon') {
      // For MultiPolygon iterate through their polygons and push each polygon as a new feature
      for (const coords of diffGeometry.coordinates) {
        // coords is an array of polygons, each represented by an array of positions.
        result.push(polygon(coords, current.properties));
      }
    }

    // Step 3: For the next loop iteration, update the covered area to become the union
    // of the currently covered area and the diffGeometry
    const diffFeature = feature(diffGeometry, current.properties);
    covered = covered
      ? union(featureCollection([covered, diffFeature])) as Feature<Polygon | MultiPolygon>
      : diffFeature;
  }

  return featureCollection(result);
}
