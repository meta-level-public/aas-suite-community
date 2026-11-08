// Separate entry point: the public viewer contains the complete AAS viewer (charts, maps, markdown) and is only
// loaded lazily. Exporting it from index.ts would put it into every bundle that imports the main barrel.
export * from './lib/public-viewer/public-viewer.component';
