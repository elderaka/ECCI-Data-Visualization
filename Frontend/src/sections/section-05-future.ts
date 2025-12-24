import type { Section, SelectedArea } from './types';
import { UK_DEFAULT_CAMERA } from './types';

export const section05: Section = {
  id: 5,
  title: (area?: SelectedArea) => area
    ? `The Future of ${area.name}`
    : 'The Future: 2025-2050',
  content: (area?: SelectedArea) => [
    {
      type: 'text',
      props: {
        text: area
          ? `By 2050, ${area.localAuthority} could see dramatic improvements. Acting now means compounding benefits for decades.`
          : 'Climate change will reshape our communities. But action today creates compounding benefits through 2050.',
      },
    },
    {
      type: 'mixed',
      props: {
        layout: 'grid',
        components: [
          {
            type: 'chart',
            chartType: 'area',
            dataEndpoint: area
              ? `/api/timeseries/area/area/${area.id}`
              : '/api/timeseries/nation/category/excess_heat?startYear=2025&endYear=2050',
            field: 'excess_heat',
            title: 'Rising Heat Stress',
          },
          {
            type: 'chart',
            chartType: 'area',
            dataEndpoint: area
              ? `/api/timeseries/area/area/${area.id}`
              : '/api/timeseries/nation/category/excess_cold?startYear=2025&endYear=2050',
            field: 'excess_cold',
            title: 'Declining Cold Stress',
          },
        ],
      },
    },
  ],
  textPosition: 'center',
  cameraPosition: (area?: SelectedArea) => area
    ? {
        center: area.center,
        zoom: 10,
        pitch: 0,
        bearing: 0,
        timestamp: new Date().toISOString(),
      }
    : UK_DEFAULT_CAMERA,
  mapOpacity: 0.3,
  mapPosition: 'center',
  backgroundColor: 'rgba(20, 20, 40, 0.9)',
};
