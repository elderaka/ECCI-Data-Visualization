import type { Map } from 'maplibre-gl';

export class LODControl {
  private map: Map;
  private controlDiv: HTMLDivElement;
  private activeLevel: 'nations' | 'las' | 'sa' | null = null; // null = automatic mode
  private isManual: boolean = false; // Start in automatic mode
  public onLevelChange: (() => void) | null = null; // Callback when LOD changes

  constructor(map: Map) {
    this.map = map;
    this.controlDiv = this.createControlPanel();
    // Start in automatic mode - no manual level needed
  }

  public isManualMode(): boolean {
    return this.isManual;
  }

  public getActiveLevel(): 'nations' | 'las' | 'sa' | null {
    return this.activeLevel;
  }

  // Restore automatic zoom-based behavior (for story mode)
  public setAutomaticMode(): void {
    this.isManual = false;
    this.activeLevel = null;
    
    const allLayers = ['nations-fill', 'nations-outline', 'las-fill', 'las-outline', 'sa-fill', 'sa-outline'];
    
    // Make all layers visible
    allLayers.forEach(id => {
      if (this.map.getLayer(id)) {
        this.map.setLayoutProperty(id, 'visibility', 'visible');
      }
    });

    // Restore zoom-based interpolation (Nations always visible)
    if (this.map.getLayer('nations-fill')) {
      this.map.setPaintProperty('nations-fill', 'fill-opacity', 0.5);
    }
    if (this.map.getLayer('nations-outline')) {
      this.map.setPaintProperty('nations-outline', 'line-opacity', 1);
    }

    // Local authorities - fade in from zoom 6.5 to 7.5
    if (this.map.getLayer('las-fill')) {
      this.map.setPaintProperty('las-fill', 'fill-opacity', [
        'interpolate', ['linear'], ['zoom'], 6.5, 0, 7.5, 0.5
      ]);
    }
    if (this.map.getLayer('las-outline')) {
      this.map.setPaintProperty('las-outline', 'line-opacity', [
        'interpolate', ['linear'], ['zoom'], 6.5, 0, 7.5, 1
      ]);
    }

    // Small areas - fade in from zoom 9.5 to 10.5
    if (this.map.getLayer('sa-fill')) {
      this.map.setPaintProperty('sa-fill', 'fill-opacity', [
        'interpolate', ['linear'], ['zoom'], 9.5, 0, 10.5, 0.4
      ]);
    }
    if (this.map.getLayer('sa-outline')) {
      this.map.setPaintProperty('sa-outline', 'line-opacity', [
        'interpolate', ['linear'], ['zoom'], 9.5, 0, 10.5, 1
      ]);
    }
  }

  // Apply manual mode (for free mode)
  public setManualMode(level?: 'nations' | 'las' | 'sa'): void {
    this.isManual = true;
    if (level) {
      this.activeLevel = level;
      this.applyManualLevel(level);
    } else if (this.activeLevel) {
      this.applyManualLevel(this.activeLevel);
    }
  }

  private createControlPanel(): HTMLDivElement {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    controlDiv.style.cssText = `
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 25px;
      padding: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      opacity: 0;
      pointer-events: none;
      margin-top: 8px;
      margin-bottom: 12px;
      margin-left: 12px;
      height: 8vh;
      width: 5vw;
      min-width: 280px;
    `;

    // Create sliding switch container
    const switchContainer = document.createElement('div');
    switchContainer.style.cssText = `
      position: relative;
      display: flex;
      background: #0f172a;
      border-radius: 25px;
      padding: 3px;
      height: calc(100% - 6px);
      width: 100%;
    `;

    const options = [
      { label: 'Nation', key: 'nations' as const },
      { label: 'Region', key: 'las' as const },
      { label: 'Area', key: 'sa' as const },
    ];

    // Create sliding indicator
    const slider = document.createElement('div');
    slider.style.cssText = `
      position: absolute;
      top: 3px;
      left: 3px;
      height: calc(100% - 6px);
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
      opacity: 0;
    `;

    // Create buttons
    const buttons: HTMLButtonElement[] = [];
    options.forEach(({ label, key }, index) => {
      const button = document.createElement('button');
      button.textContent = label;
      button.style.cssText = `
        flex: 1;
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        background: transparent;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        transition: color 0.3s;
        position: relative;
        z-index: 1;
        white-space: nowrap;
      `;

      button.addEventListener('click', () => {
        // Toggle: if clicking the active button, return to automatic mode
        if (this.isManual && this.activeLevel === key) {
          this.setAutomaticMode();
          
          // Hide slider and reset button colors
          slider.style.opacity = '0';
          buttons.forEach(btn => {
            btn.style.color = '#64748b';
          });
          
          // Notify heatmap control
          if (this.onLevelChange) {
            this.onLevelChange();
          }
        } else {
          // Switch to manual mode for this button
          this.isManual = true;
          this.activeLevel = key;
          this.applyManualLevel(key);
          
          // Update slider position
          const buttonWidth = button.offsetWidth;
          slider.style.width = `${buttonWidth}px`;
          slider.style.transform = `translateX(${index * buttonWidth}px)`;
          slider.style.opacity = '1'; // Show slider when in manual mode
          
          // Update button colors
          buttons.forEach((btn, i) => {
            btn.style.color = i === index ? '#ffffff' : '#64748b';
          });
          
          // Notify heatmap control
          if (this.onLevelChange) {
            this.onLevelChange();
          }
        }
      });

      buttons.push(button);
      switchContainer.appendChild(button);
    });

    switchContainer.insertBefore(slider, switchContainer.firstChild);
    controlDiv.appendChild(switchContainer);

    // No default positioning - slider is hidden in automatic mode

    return controlDiv;
  }

  // Applies manual LOD: show selected layer across zooms with smooth fade transitions
  private applyManualLevel(level: 'nations' | 'las' | 'sa') {
    const allLayers = ['nations-fill', 'nations-outline', 'las-fill', 'las-outline', 'sa-fill', 'sa-outline'];
    const visibilityMap: Record<string, string[]> = {
      nations: ['nations-fill', 'nations-outline'],
      las: ['las-fill', 'las-outline'],
      sa: ['sa-fill', 'sa-outline'],
    };

    // Make all layers visible (so they can fade)
    allLayers.forEach(id => {
      if (this.map.getLayer(id)) {
        this.map.setLayoutProperty(id, 'visibility', 'visible');
      }
    });

    // Fade out non-selected layers, fade in selected layers
    allLayers.forEach(id => {
      if (this.map.getLayer(id)) {
        const isSelected = visibilityMap[level].includes(id);
        const targetOpacity = isSelected ? (id.endsWith('-fill') ? 0.5 : 1) : 0;
        
        // Set paint opacity for smooth transitions (MapLibre handles the animation)
        if (id.endsWith('-fill')) {
          this.map.setPaintProperty(id, 'fill-opacity', targetOpacity);
        } else if (id.endsWith('-outline')) {
          this.map.setPaintProperty(id, 'line-opacity', targetOpacity);
        }
      }
    });
  }

  onAdd(): HTMLElement {
    return this.controlDiv;
  }

  onRemove(): void {
    this.controlDiv.parentNode?.removeChild(this.controlDiv);
  }
}
