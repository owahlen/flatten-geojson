# flatten-geojson

This repository is an **illustration** of how overlapping GeoJSON polygons 
on a map that contain attributes can be **flattened** 
(i.e., processed so that resulting polygon layers no longer overlap, 
preserving the original attributes).

## Overview

The script in `flatten.ts` demonstrates:
- Defining sample overlapping polygons with attribute `type`
- Processing from topmost to bottom layers
- Subtracting already covered areas to avoid overlaps
- Generating a flattened GeoJSON FeatureCollection

## Usage

```bash
npm install
npm run start
```

This outputs the flattened GeoJSON to stdout.

## Requirements

- Node.js (>=12)
- npm or yarn
- TypeScript

## License
This example is provided for illustrative purposes.
