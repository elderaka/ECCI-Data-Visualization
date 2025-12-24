import type { Section, SelectedArea } from './types';
import { UK_DEFAULT_CAMERA } from './types';

export const section06: Section = {
  id: 6,
  title: (area?: SelectedArea) => area
    ? `Take Action for ${area.localAuthority}`
    : 'Take Action',
  content: (area?: SelectedArea) => area
    ? `You've seen how climate action benefits ${area.name}.\n\n**What's next?**\n- Download a report for your council\n- Find your local councillors\n- Share this story with your community\n\nSwitch to **Free Explore** mode to dig deeper into the data.`
    : `You've seen the UK-wide picture.\n\n**Want to see your local area?**\nGo back and enter your postcode, or switch to **Free Explore** mode to discover patterns across the country.`,
  textPosition: 'center',
  cameraPosition: (area?: SelectedArea) => area
    ? {
        center: area.center,
        zoom: 9,
        pitch: 0,
        bearing: 0,
        timestamp: new Date().toISOString(),
      }
    : UK_DEFAULT_CAMERA,
  mapOpacity: 0.8,
  mapPosition: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
};
