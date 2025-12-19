import type { Section } from './types';

export const section01: Section = {
  id: 1,
  title: 'Welcome to the Journey',
  content: 'Explore the data-driven story of communities across the UK.',
  textPosition: 'center',
  cameraPosition: {
    center: [-3, 55],
    zoom: 6.9,
    pitch: 60,
    bearing: 0,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 1,
  mapPosition: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
};
