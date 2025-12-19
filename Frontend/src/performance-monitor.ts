import type { Map as MapLibreMap } from 'maplibre-gl';
import { getCacheStats } from './service-worker-register';

export class PerformanceMonitor {
  private map: MapLibreMap;
  private container: HTMLDivElement;
  private isVisible: boolean = false;
  private updateInterval: number | null = null;
  private frameCount: number = 0;
  private lastFrameTime: number = performance.now();
  private fps: number = 0;
  private gridEnabled: boolean = false; // Grid is on by default
  private labelsEnabled: boolean = false; // Debug labels off by default
  
  // Network tracking
  private totalBytesDownloaded: number = 0;
  private totalRequests: number = 0;
  private tileBytesDownloaded: number = 0;
  private tileRequests: number = 0;
  private originalFetch: typeof fetch;

  constructor(map: MapLibreMap) {
    this.map = map;
    this.originalFetch = window.fetch;
    this.interceptFetch();
    this.container = this.createMonitorPanel();
    document.body.appendChild(this.container);
    
    // Enable grid by default
    this.map.showTileBoundaries = this.gridEnabled;
    
    // Start tracking FPS
    this.trackFPS();
    
    // Listen for 'P' key to toggle
    window.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P') {
        this.toggle();
      }
    });
    
    
  }

  private createMonitorPanel(): HTMLDivElement {
    const panel = document.createElement('div');
    panel.id = 'performance-monitor';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(15, 23, 42, 0.95);
      border: 2px solid #3b82f6;
      border-radius: 12px;
      padding: 16px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #e2e8f0;
      z-index: 10000;
      min-width: 320px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
      display: none;
      backdrop-filter: blur(10px);
    `;

    // Title
    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 16px;
      font-weight: bold;
      color: #60a5fa;
      margin-bottom: 12px;
      border-bottom: 2px solid #475569;
      padding-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    `;
    title.textContent = 'Debug Window';
    panel.appendChild(title);

    // Stats container
    const stats = document.createElement('div');
    stats.id = 'perf-stats';
    stats.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 6px;
    `;
    panel.appendChild(stats);

    // Grid toggle button
    const gridButton = document.createElement('button');
    gridButton.id = 'grid-toggle-btn';
    gridButton.style.cssText = `
      width: 100%;
      margin-top: 12px;
      padding: 8px 12px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border: 1px solid #60a5fa;
      border-radius: 6px;
      color: white;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;
    gridButton.textContent = 'Grid: ON';
    gridButton.addEventListener('click', () => this.toggleGrid());
    gridButton.addEventListener('mouseenter', () => {
      gridButton.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
      gridButton.style.transform = 'scale(1.02)';
    });
    gridButton.addEventListener('mouseleave', () => {
      gridButton.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
      gridButton.style.transform = 'scale(1)';
    });
    panel.appendChild(gridButton);

    // Debug labels toggle button
    const labelsButton = document.createElement('button');
    labelsButton.id = 'labels-toggle-btn';
    labelsButton.style.cssText = `
      width: 100%;
      margin-top: 8px;
      padding: 8px 12px;
      background: linear-gradient(135deg, #64748b, #475569);
      border: 1px solid #94a3b8;
      border-radius: 6px;
      color: white;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;
    labelsButton.textContent = 'Labels: OFF';
    labelsButton.addEventListener('click', () => this.toggleLabels());
    labelsButton.addEventListener('mouseenter', () => {
      labelsButton.style.transform = 'scale(1.02)';
    });
    labelsButton.addEventListener('mouseleave', () => {
      labelsButton.style.transform = 'scale(1)';
    });
    panel.appendChild(labelsButton);

    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #475569;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    `;
    footer.textContent = 'Press P to toggle';
    panel.appendChild(footer);

    return panel;
  }

  private interceptFetch(): void {
    const self = this;
    
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      // Call original fetch with proper binding
      const response = await self.originalFetch.call(window, input, init);
      
      // Track request immediately
      self.totalRequests++;
      
      // Check if it's a tile request
      const isTileRequest = url.includes('pmtiles') || url.includes('.pbf') || url.includes('/tiles/');
      
      if (isTileRequest) {
        self.tileRequests++;
      }
      
      // Try to get size from headers (don't consume the body)
      const contentLength = response.headers.get('content-length');
      
      if (contentLength) {
        const bytes = parseInt(contentLength, 10);
        self.totalBytesDownloaded += bytes;
        if (isTileRequest) {
          self.tileBytesDownloaded += bytes;
        }
      }
      // Note: If no content-length header, we skip size tracking to avoid consuming the body
      // Service worker needs an unconsumed response to clone
      
      return response;
    };
  }

  private createStatRow(label: string, value: string, color: string = '#e2e8f0'): string {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
        <span style="color: #94a3b8;">${label}:</span>
        <span style="color: ${color}; font-weight: bold; font-size: 14px;">${value}</span>
      </div>
    `;
  }

  private createCategoryHeader(title: string): string {
    return `
      <div style="
        margin-top: 10px;
        margin-bottom: 4px;
        font-size: 12px;
        font-weight: bold;
        color: #60a5fa;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">${title}</div>
    `;
  }

  private trackFPS(): void {
    const updateFPS = () => {
      this.frameCount++;
      const currentTime = performance.now();
      const delta = currentTime - this.lastFrameTime;
      
      if (delta >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / delta);
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    requestAnimationFrame(updateFPS);
  }

  private getMemoryInfo(): { used: string; total: string; percent: number } | null {
    const memory = (performance as any).memory;
    if (memory) {
      const used = memory.usedJSHeapSize;
      const total = memory.jsHeapSizeLimit;
      const percent = Math.round((used / total) * 100);
      
      return {
        used: this.formatBytes(used),
        total: this.formatBytes(total),
        percent
      };
    }
    return null;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  private getMapStats() {
    const sources = this.map.getStyle()?.sources || {};
    const layers = this.map.getStyle()?.layers || [];
    
    const loadedTiles = (this.map as any)._sourceCaches 
      ? Object.values((this.map as any)._sourceCaches)
          .reduce((sum: number, cache: any) => sum + Object.keys(cache._tiles || {}).length, 0)
      : 0;

    const center = this.map.getCenter();

    return {
      sources: Object.keys(sources).length,
      layers: layers.length,
      tiles: loadedTiles,
      zoom: this.map.getZoom().toFixed(2),
      pitch: this.map.getPitch().toFixed(1),
      bearing: this.map.getBearing().toFixed(1),
      center: `${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}`,
    };
  }

  private getNetworkStats() {
    return {
      totalRequests: this.totalRequests,
      totalSize: this.formatBytes(this.totalBytesDownloaded),
      pmtilesRequests: this.tileRequests,
      pmtilesSize: this.formatBytes(this.tileBytesDownloaded),
    };
  }

  private getFPSColor(fps: number): string {
    if (fps >= 55) return '#10b981'; // Green
    if (fps >= 30) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  private getMemoryColor(percent: number): string {
    if (percent < 60) return '#10b981'; // Green
    if (percent < 80) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  private async updateStats(): Promise<void> {
    const statsContainer = document.getElementById('perf-stats');
    if (!statsContainer) return;

    const mapStats = this.getMapStats();
    const networkStats = this.getNetworkStats();
    const memoryInfo = this.getMemoryInfo();
    const cacheStats = await getCacheStats();

    let html = '';

    // FPS
    html += this.createCategoryHeader('🎮 Performance');
    html += this.createStatRow('FPS', `${this.fps}`, this.getFPSColor(this.fps));

    // Memory
    if (memoryInfo) {
      html += this.createStatRow(
        'Memory',
        `${memoryInfo.used} / ${memoryInfo.total}`,
        this.getMemoryColor(memoryInfo.percent)
      );
      html += this.createStatRow(
        'Heap Usage',
        `${memoryInfo.percent}%`,
        this.getMemoryColor(memoryInfo.percent)
      );
    }

    // Map Stats
    html += this.createCategoryHeader('Map');
    html += this.createStatRow('Center', mapStats.center, '#94a3b8');
    html += this.createStatRow('Zoom', mapStats.zoom);
    html += this.createStatRow('Pitch', `${mapStats.pitch}°`);
    html += this.createStatRow('Bearing', `${mapStats.bearing}°`);
    html += this.createStatRow('Sources', `${mapStats.sources}`);
    html += this.createStatRow('Layers', `${mapStats.layers}`);
    html += this.createStatRow('Tiles Loaded', `${mapStats.tiles}`, '#60a5fa');

    // Network Stats
    html += this.createCategoryHeader('🌐 Network');
    html += this.createStatRow('Total Requests', `${networkStats.totalRequests}`);
    html += this.createStatRow('Total Downloaded', networkStats.totalSize, '#60a5fa');
    html += this.createStatRow('Tile Requests', `${networkStats.pmtilesRequests}`);
    html += this.createStatRow('Tiles Downloaded', networkStats.pmtilesSize, '#60a5fa');

    // Cache Stats
    if (cacheStats) {
      html += this.createCategoryHeader('💾 Cache');
      html += this.createStatRow('Cached Tiles', `${cacheStats.tileCount}`, '#10b981');
    }

    statsContainer.innerHTML = html;
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';

    if (this.isVisible) {
      // Start updating every second
      this.updateStats();
      this.updateInterval = window.setInterval(() => this.updateStats(), 1000);
    } else {
      // Stop updating
      if (this.updateInterval !== null) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    }
  }

  public show(): void {
    if (!this.isVisible) {
      this.toggle();
    }
  }

  public hide(): void {
    if (this.isVisible) {
      this.toggle();
    }
  }

  private toggleGrid(): void {
    this.gridEnabled = !this.gridEnabled;
    this.map.showTileBoundaries = this.gridEnabled;
    
    const button = document.getElementById('grid-toggle-btn');
    if (button) {
      button.textContent = this.gridEnabled ? 'Grid: ON' : 'Grid: OFF';
      button.style.background = this.gridEnabled 
        ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
        : 'linear-gradient(135deg, #64748b, #475569)';
    }
  }

  public toggleLabels(): void {
    this.labelsEnabled = !this.labelsEnabled;
    if (this.map.getLayer('heatmap-debug-labels')) {
      this.map.setLayoutProperty(
        'heatmap-debug-labels',
        'visibility',
        this.labelsEnabled ? 'visible' : 'none'
      );
    }
    
    const button = document.getElementById('labels-toggle-btn');
    if (button) {
      button.textContent = this.labelsEnabled ? 'Labels: ON' : 'Labels: OFF';
      button.style.background = this.labelsEnabled 
        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
        : 'linear-gradient(135deg, #64748b, #475569)';
    }
  }

  public isLabelsEnabled(): boolean {
    return this.labelsEnabled;
  }

  public cleanup(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
    }
    // Restore original fetch
    window.fetch = this.originalFetch;
    this.container.remove();
  }
}
