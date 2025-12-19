// Map configuration
export const MAP_CONFIG = {
  center: [-3, 55] as [number, number],
  zoom: 5, // Start at zoom 5 (story mode zoom) to avoid unnecessary tile loading
  minZoom: 4, // Minimum zoom set to level 4
  maxZoom: 14, // No effective maximum zoom for story scrolling
  minPitch: 0,
  maxPitch: 85, // Allow full pitch rotation for cinematic views
};

// Backend API URL - now unified on port 3000!
export const API_SERVER_URL = import.meta.env.PROD 
  ? 'http://54.206.53.146:3000' 
  : 'http://localhost:3000';

// For backward compatibility
export const TILE_SERVER_URL = API_SERVER_URL;

// PMTiles filenames
export const PMTILES_FILES = {
  nations: 'nation_wgs84.pmtiles',
  nationLabels: 'nation_wgs84_labels.pmtiles',
  localAuthorities: 'local_authorities_wgs84.pmtiles',
  localAuthoritiesLabels: 'local_authorities_wgs84_labels.pmtiles',
  smallAreas: 'small_areas_wgs84.pmtiles',
};

// Layer configuration (Dark Mode)
export const LAYERS_CONFIG = {
  nations: {
    minzoom: 0,
    maxzoom: 7,
    fillColor: '#1e40af', // Dark blue
    fillOpacity: 0.5,
    lineColor: '#3b82f6', // Bright blue
    lineWidth: 2,
  },
  localAuthorities: {
    minzoom: 7,
    maxzoom: 10,
    fillColor: '#047857', // Dark green
    fillOpacity: 0.5,
    lineColor: '#10b981', // Bright green
    lineWidth: 1.5,
  },
  smallAreas: {
    minzoom: 10,
    fillColor: '#b45309', // Dark amber
    fillOpacity: 0.2,
    lineColor: '#f59e0b', // Bright amber
    lineWidth: 0.2,
  },
};
