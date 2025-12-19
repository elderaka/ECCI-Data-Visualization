// Central index to import all sections
import { section01 } from './section-01-intro';
import { section02 } from './section-02-health';
import { section03 } from './section-03-housing';
import { section04 } from './section-04-mobility';
import { section05 } from './section-05-future';
import { section06 } from './section-06-outro';
import type { Section } from './types';

// Export all sections in order
export const SECTIONS: Section[] = [
  section01,
  section02,
  section03,
  section04,
  section05,
  section06,
];

// Export individual sections for direct access
export {
  section01,
  section02,
  section03,
  section04,
  section05,
  section06,
};

// Export types
export type { Section, SectionContent, SectionContentType } from './types';
