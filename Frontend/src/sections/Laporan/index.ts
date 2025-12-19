import type { LaporanSection } from './types';
import { laporanSection01 } from './section-01-title';
import { laporanSection02 } from './section-02-description';
import { laporanSection03 } from './section-03-latar-belakang';
import { laporanSection04 } from './section-04-tujuan';
import { laporanSection05 } from './section-05-dataset-overview';
import { laporanSection06 } from './section-06-column-overview';
import { laporanSection07 } from './section-07-strategy';
import { laporanSection08 } from './section-08-techstack-intro';
import { laporanSection09 } from './section-09-techstack-frontend';
import { laporanSection10 } from './section-10-techstack-backend';
import { laporanSection11 } from './section-11-techstack-postgis';
import { laporanSection12 } from './section-12-techstack-timescale';
import { laporanSection13 } from './section-13-techstack-tools';
import { laporanSection14 } from './section-14-next-progress';
import { laporanSection16 } from './section-16-thanks';

export const LAPORAN_SECTIONS: LaporanSection[] = [
  laporanSection01,
  laporanSection02,
  laporanSection03,
  laporanSection04,
  laporanSection05,
  laporanSection06,
  laporanSection07,
  laporanSection08,
  laporanSection09,
  laporanSection10,
  laporanSection13,
  laporanSection11,
  laporanSection12,
  laporanSection14,
  laporanSection16,
];

export type { LaporanSection, LaporanContent, LaporanContentType } from './types';
