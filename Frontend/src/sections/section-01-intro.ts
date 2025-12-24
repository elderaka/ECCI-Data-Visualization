import type { Section, SelectedArea } from './types';
import { UK_DEFAULT_CAMERA } from './types';

export const section01: Section = {
  id: 1,
  title: 'UK Net-Zero Advocate',
  content: (area?: SelectedArea) => area
    ? `Welcome! You're exploring **${area.name}** in ${area.localAuthority}, ${area.nation}.\n\n*${area.areaTypeDisplay}*\n\nDiscover how climate action creates real benefits for your community.`
    : `Welcome to the UK Net-Zero Advocate.\n\nExplore how climate action creates real, tangible benefits for communities across the UK — from cleaner air to warmer homes to safer roads.\n\n**Choose your area below, or explore the UK as a whole.**`,
  textPosition: 'center',
  cameraPosition: (area?: SelectedArea) => area
    ? {
        center: area.center,
        zoom: 12,
        pitch: 0,
        bearing: 0,
        timestamp: new Date().toISOString(),
      }
    : UK_DEFAULT_CAMERA,
  mapOpacity: 1,
  mapPosition: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  showAreaPicker: true,  // Show the area picker in intro
};
