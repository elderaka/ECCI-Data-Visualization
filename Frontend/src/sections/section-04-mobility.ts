import type { Section, SelectedArea } from './types';
import { UK_DEFAULT_CAMERA } from './types';

export const section04: Section = {
  id: 4,
  title: (area?: SelectedArea) => area
    ? `Road Mobility in ${area.localAuthority}`
    : 'Road Mobility & Safety',
  content: (area?: SelectedArea) => [
    {
      type: 'text',
      props: {
        text: area
          ? `In ${area.areaTypeDisplay} areas, reducing car dependency cuts congestion and improves road safety. See how ${area.localAuthority} could benefit.`
          : 'Congestion costs billions annually. Active travel and public transport investments save money and lives.',
      },
    },
    {
      type: 'chart',
      props: {
        chartType: 'line',
        dataEndpoint: area
          ? `/api/timeseries/area/area/${area.id}`
          : '/api/timeseries/nation/area/England',
        fields: ['congestion', 'road_safety'],
        title: area
          ? `Road Mobility: ${area.name} (2025-2050)`
          : 'Road Mobility Trends: England (2025-2050)',
      },
    },
  ],
  textPosition: 'right',
  cameraPosition: (area?: SelectedArea) => area
    ? {
        center: area.center,
        zoom: 11,
        pitch: 0,
        bearing: 0,
        timestamp: new Date().toISOString(),
      }
    : UK_DEFAULT_CAMERA,
  mapOpacity: 0.6,
  mapPosition: 'left',
};
