import type { Map as MapLibreMap } from 'maplibre-gl';

export type LODLevel = 'nation' | 'region' | 'area';

export class SimpleLODControl {
  private map: MapLibreMap;
  private container: HTMLDivElement;
  private currentLevel: LODLevel = 'nation';

  constructor(map: MapLibreMap) {
    this.map = map;
    this.container = this.createControl();
  }

  // Compatibility method with old LODControl
  public isManualMode(): boolean {
    // Simple LOD control is always in "manual" mode (user chooses explicitly)
    return true;
  }

  onAdd(map: MapLibreMap): HTMLElement {
    this.map = map;
    return this.container;
  }

  onRemove(): void {
    this.container.parentNode?.removeChild(this.container);
  }

  getDefaultPosition(): string {
    return 'bottom-left';
  }

  private createControl(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    container.style.cssText = `
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 8px;
      padding: 8px 12px;
      opacity: 0;
      pointer-events: none;
      margin-top: 8px;
    `;

    // Toggle switch container (no title)
    const toggleContainer = document.createElement('div');
    toggleContainer.style.cssText = `
      display: flex;
      background: #0f172a;
      border-radius: 6px;
      padding: 2px;
      position: relative;
      min-width: 200px;
    `;

    const levels: LODLevel[] = ['nation', 'region', 'area'];
    const labels = {
      nation: 'Nations',
      region: 'Regions',
      area: 'Areas'
    };

    levels.forEach((level) => {
      const btn = document.createElement('button');
      btn.textContent = labels[level];
      btn.style.cssText = `
        flex: 1;
        padding: 6px 12px;
        border: none;
        background: ${level === this.currentLevel ? '#3b82f6' : 'transparent'};
        color: #f1f5f9;
        font-size: 11px;
        font-weight: ${level === this.currentLevel ? '600' : '400'};
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      `;

      btn.addEventListener('click', () => {
        this.setLevel(level);
        // Update all buttons
        Array.from(toggleContainer.children).forEach((child, idx) => {
          const childBtn = child as HTMLButtonElement;
          const isActive = levels[idx] === level;
          childBtn.style.background = isActive ? '#3b82f6' : 'transparent';
          childBtn.style.fontWeight = isActive ? '600' : '400';
        });
      });

      btn.addEventListener('mouseenter', () => {
        if (level !== this.currentLevel) {
          btn.style.background = '#1e293b';
        }
      });

      btn.addEventListener('mouseleave', () => {
        if (level !== this.currentLevel) {
          btn.style.background = 'transparent';
        }
      });

      toggleContainer.appendChild(btn);
    });

    container.appendChild(toggleContainer);
    return container;
  }

  private setLevel(level: LODLevel): void {
    this.currentLevel = level;
    console.log('LOD level changed to:', level);

    // Update layer visibility based on level
    const visibilityMap = {
      nation: {
        nations: 'visible',
        'nation-labels': 'visible',
        las: 'none',
        'la-labels': 'none',
        sa: 'none',
        'sa-fill': 'none',
        'sa-outline': 'none',
      },
      region: {
        nations: 'none',
        'nation-labels': 'none',
        las: 'visible',
        'la-labels': 'visible',
        sa: 'none',
        'sa-fill': 'none',
        'sa-outline': 'none',
      },
      area: {
        nations: 'none',
        'nation-labels': 'none',
        las: 'none',
        'la-labels': 'none',
        sa: 'visible',
        'sa-fill': 'visible',
        'sa-outline': 'visible',
      },
    };

    const visibility = visibilityMap[level];
    Object.entries(visibility).forEach(([layerId, vis]) => {
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, 'visibility', vis);
      }
    });
  }

  public getCurrentLevel(): LODLevel {
    return this.currentLevel;
  }
}
