import type { Section, SelectedArea } from './types';
import { UK_DEFAULT_CAMERA } from './types';

export const section03: Section = {
  id: 3,
  title: (area?: SelectedArea) => area
    ? `Housing Comfort in ${area.localAuthority}`
    : 'Housing Comfort: A Growing Challenge',
  content: (area?: SelectedArea) => [
    {
      type: 'text',
      props: {
        text: area
          ? `Homes in ${area.name} face challenges from dampness, cold, and increasing heat. Retrofitting and insulation programs can transform housing quality.`
          : 'Dampness, excess cold, and rising heat affect millions of UK homes. Climate action means warmer winters and cooler summers.',
      },
    },
    {
      type: 'animation',
      props: {
        animationType: 'heatmap',
        dataEndpoint: area
          ? `/api/timeseries/area/area/${area.id}`
          : '/api/timeseries/nation/category/housing_comfort?startYear=2025&endYear=2050',
        yearRange: [2025, 2050],
        autoPlay: true,
      },
    },
  ],
  textPosition: 'left',
  cameraPosition: (area?: SelectedArea) => area
    ? {
        center: area.center,
        zoom: 11,
        pitch: 0,
        bearing: 0,
        timestamp: new Date().toISOString(),
      }
    : UK_DEFAULT_CAMERA,
  mapOpacity: 0.8,
  mapPosition: 'right',
  duration: 8000,
};
