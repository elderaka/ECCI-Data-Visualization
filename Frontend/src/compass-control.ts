import type { Map, LngLat } from 'maplibre-gl';

const DEFAULT_CENTER: [number, number] = [-3, 55];

export class CompassControl {
  private map: Map;
  private controlDiv: HTMLDivElement;
  private lastClickedCenter: [number, number] = DEFAULT_CENTER;

  constructor(map: Map) {
    this.map = map;
    this.controlDiv = this.createCompass();
  }

  // Update the remembered center when user clicks a region
  public setLastClickedCenter(center: LngLat | [number, number]): void {
    if (Array.isArray(center)) {
      this.lastClickedCenter = center;
    } else {
      this.lastClickedCenter = [center.lng, center.lat];
    }
    console.log('Compass: Updated last clicked center to', this.lastClickedCenter);
  }

  private createCompass(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group compass-control';
    container.style.cssText = 'opacity: 0; pointer-events: none;';

    const button = document.createElement('button');
    button.className = 'compass-button';
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', 'Reset to center');
    button.title = 'Reset to center';
    
    // Compass icon using SVG
    button.innerHTML = `
      <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14.5" cy="14.5" r="10" stroke="#333" stroke-width="1.5" fill="none"/>
        <path d="M14.5 4.5 L14.5 8.5" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <path d="M14.5 4.5 L17.5 7.5 L14.5 6.5 L11.5 7.5 Z" fill="#E53E3E" stroke="#E53E3E" stroke-width="0.5"/>
        <text x="14.5" y="23" text-anchor="middle" font-size="6" fill="#333" font-weight="bold">N</text>
        <circle cx="14.5" cy="14.5" r="1.5" fill="#333"/>
      </svg>
    `;

    button.addEventListener('click', () => this.resetToCenter());

    container.appendChild(button);
    return container;
  }

  private resetToCenter(): void {
    console.log('Resetting bearing and pitch only (no movement)');
    
    this.map.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 1000, // 1 second smooth animation
      easing: (t) => t * (2 - t), // ease-out quad
    });
  }

  onAdd(): HTMLElement {
    return this.controlDiv;
  }

  onRemove(): void {
    this.controlDiv.parentNode?.removeChild(this.controlDiv);
  }
}
