import type { Map as MapLibreMap } from 'maplibre-gl';

export class ZoomControl {
  private map: MapLibreMap;
  private container: HTMLDivElement;

  constructor(map: MapLibreMap) {
    this.map = map;
    this.container = this.createControl();
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
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      opacity: 0;
      pointer-events: none;
      margin-bottom: 12px;
      margin-left: 12px;
    `;

    // Zoom in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.innerHTML = '+';
    zoomInBtn.title = 'Zoom in';
    zoomInBtn.style.cssText = `
      background: transparent;
      border: none;
      color: #f1f5f9;
      font-size: 20px;
      font-weight: bold;
      width: 32px;
      height: 32px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s, transform 0.15s;
    `;
    
    zoomInBtn.addEventListener('mouseenter', () => {
      zoomInBtn.style.background = '#334155';
    });
    zoomInBtn.addEventListener('mouseleave', () => {
      zoomInBtn.style.background = 'transparent';
    });
    zoomInBtn.addEventListener('click', () => {
      const currentZoom = this.map.getZoom();
      if (currentZoom < 12) {
        zoomInBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
          zoomInBtn.style.transform = 'scale(1)';
        }, 150);
        this.map.flyTo({
          zoom: currentZoom + 1,
          duration: 1000,
          essential: true
        });
      }
    });

    // Zoom out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.innerHTML = '−';
    zoomOutBtn.title = 'Zoom out';
    zoomOutBtn.style.cssText = `
      background: transparent;
      border: none;
      color: #f1f5f9;
      font-size: 20px;
      font-weight: bold;
      width: 32px;
      height: 32px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s, transform 0.15s;
    `;
    
    zoomOutBtn.addEventListener('mouseenter', () => {
      zoomOutBtn.style.background = '#334155';
    });
    zoomOutBtn.addEventListener('mouseleave', () => {
      zoomOutBtn.style.background = 'transparent';
    });
    zoomOutBtn.addEventListener('click', () => {
      const currentZoom = this.map.getZoom();
      if (currentZoom > 5) {
        zoomOutBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
          zoomOutBtn.style.transform = 'scale(1)';
        }, 150);
        this.map.flyTo({
          zoom: currentZoom - 1,
          duration: 1000,
          essential: true
        });
      }
    });

    container.appendChild(zoomInBtn);
    container.appendChild(zoomOutBtn);

    return container;
  }
}
