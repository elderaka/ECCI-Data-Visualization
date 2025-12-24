import type { Section, SelectedArea } from './types';
import { UK_DEFAULT_CAMERA } from './types';

export const section02: Section = {
  id: 2,
  title: (area?: SelectedArea) => area
    ? `Health & Wellbeing in ${area.localAuthority}`
    : 'Health & Wellbeing Across the UK',
  content: (area?: SelectedArea) => [
    {
      type: 'text',
      props: {
        text: area
          ? `In ${area.areaTypeDisplay} areas like ${area.name}, climate action directly improves air quality, encourages physical activity, and reduces noise pollution.`
          : 'Cleaner air, more active lifestyles, quieter streets. Climate action delivers health benefits worth billions.',
      },
    },
    {
      type: 'chart',
      props: {
        chartType: 'bar',
        dataEndpoint: area 
          ? `/api/area-data/${area.id}`
          : '/api/category-data/nation',
        field: 'health_wellbeing',
        title: area 
          ? `Health Benefits: ${area.name}`
          : 'Health & Wellbeing by Nation',
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
  mapOpacity: 0.7,
  mapPosition: 'right',
};
