import type { Map as MapLibreMap } from 'maplibre-gl';

export interface CameraPosition {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number; // Yaw
  timestamp: string;
}

export class CameraRecorder {
  private map: MapLibreMap;
  private container!: HTMLElement;
  private positions: CameraPosition[] = [];

  constructor(map: MapLibreMap) {
    this.map = map;
  }

  // MapLibre control interface
  onAdd(map: MapLibreMap): HTMLElement {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    this.container.style.cssText = `
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 10px;
      opacity: 0;
      pointer-events: none;
      z-index: 10;
    `;

    // Record button
    const recordButton = document.createElement('button');
    recordButton.className = 'camera-record-btn';
    recordButton.innerHTML = '📷 Record Position';
    recordButton.title = 'Record current camera position';
    recordButton.style.cssText = `
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 8px;
      width: 100%;
    `;
    recordButton.addEventListener('click', () => this.recordPosition());

    // Export button
    const exportButton = document.createElement('button');
    exportButton.className = 'camera-export-btn';
    exportButton.innerHTML = '💾 Export JSON';
    exportButton.title = 'Export recorded positions as JSON';
    exportButton.style.cssText = `
      background: #10b981;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 8px;
      width: 100%;
    `;
    exportButton.addEventListener('click', () => this.exportPositions());

    // Clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'camera-clear-btn';
    clearButton.innerHTML = '🗑️ Clear';
    clearButton.title = 'Clear all recorded positions';
    clearButton.style.cssText = `
      background: #ef4444;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 8px;
      width: 100%;
    `;
    clearButton.addEventListener('click', () => this.clearPositions());

    // Counter display
    const counterDisplay = document.createElement('div');
    counterDisplay.className = 'camera-counter';
    counterDisplay.style.cssText = `
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    `;
    this.updateCounter(counterDisplay);

    this.container.appendChild(recordButton);
    this.container.appendChild(exportButton);
    this.container.appendChild(clearButton);
    this.container.appendChild(counterDisplay);

    return this.container;
  }

  onRemove(): void {
    this.container.parentNode?.removeChild(this.container);
  }

  private recordPosition(): void {
    const center = this.map.getCenter();
    const position: CameraPosition = {
      center: [center.lng, center.lat],
      zoom: this.map.getZoom(),
      pitch: this.map.getPitch(),
      bearing: this.map.getBearing(),
      timestamp: new Date().toISOString(),
    };

    this.positions.push(position);
    console.log('📷 Recorded position:', position);
    
    // Update counter
    const counterDisplay = this.container.querySelector('.camera-counter');
    if (counterDisplay) {
      this.updateCounter(counterDisplay as HTMLElement);
    }

    // Visual feedback
    this.showFeedback('Position recorded!', '#10b981');
  }

  private exportPositions(): void {
    if (this.positions.length === 0) {
      this.showFeedback('No positions recorded yet!', '#ef4444');
      return;
    }

    const json = JSON.stringify(this.positions, null, 2);
    
    // Create downloadable file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camera-positions-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also log to console
    console.log('📸 Camera Positions:', this.positions);
    console.log('JSON:', json);

    this.showFeedback('Exported to file!', '#10b981');
  }

  private clearPositions(): void {
    if (this.positions.length === 0) {
      this.showFeedback('Nothing to clear!', '#ef4444');
      return;
    }

    const count = this.positions.length;
    this.positions = [];
    
    // Update counter
    const counterDisplay = this.container.querySelector('.camera-counter');
    if (counterDisplay) {
      this.updateCounter(counterDisplay as HTMLElement);
    }

    console.log(`🗑️ Cleared ${count} position(s)`);
    this.showFeedback(`Cleared ${count} position(s)!`, '#f59e0b');
  }

  private updateCounter(element: HTMLElement): void {
    element.textContent = `Recorded: ${this.positions.length}`;
  }

  private showFeedback(message: string, color: string): void {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color};
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideDown 0.3s ease-out;
    `;

    // Add animation keyframes if not already added
    if (!document.querySelector('#camera-feedback-styles')) {
      const style = document.createElement('style');
      style.id = 'camera-feedback-styles';
      style.textContent = `
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(feedback);
    setTimeout(() => {
      feedback.style.transition = 'opacity 0.3s';
      feedback.style.opacity = '0';
      setTimeout(() => document.body.removeChild(feedback), 300);
    }, 2000);
  }

  // Public API for programmatic access
  getPositions(): CameraPosition[] {
    return [...this.positions];
  }

  loadPositions(positions: CameraPosition[]): void {
    this.positions = [...positions];
    const counterDisplay = this.container?.querySelector('.camera-counter');
    if (counterDisplay) {
      this.updateCounter(counterDisplay as HTMLElement);
    }
  }
}
