import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { TILE_SERVER_URL } from './config';

// Helper to build pmtiles:// URLs with the tile server
export const PM = (filename: string) => {
  // PMTiles protocol expects: pmtiles://http://server:port/tiles/file.pmtiles
  const httpUrl = `${TILE_SERVER_URL}/tiles/${filename}`;
  const url = `pmtiles://${httpUrl}`;
  console.log(`PM URL for ${filename}:`, url);
  return url;
};

// Register PMTiles protocol
export function registerPMTilesProtocol() {
  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);
  console.log('PMTiles protocol registered');
  return protocol;
}
