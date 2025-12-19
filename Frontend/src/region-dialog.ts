import type { Map as MapLibreMap, LngLat } from 'maplibre-gl';
import { getTemperatureColor, formatValue, type Level1Data } from './data-loader';
import { API_SERVER_URL } from './config';

export interface RegionDialogData {
  id: string;
  name: string;
  type: 'nation' | 'local-authority' | 'small-area';
  color: string;
  properties: any;
  smallArea?: string; // The small_area ID for data lookup
}

export class RegionDialog {
  private element: HTMLDivElement;
  private data: RegionDialogData;
  private isComparing = false;
  private linkedDialog?: RegionDialog;
  private onClose?: () => void;
  private onCompare?: (dialog: RegionDialog) => void;
  private map?: MapLibreMap;
  private lngLat?: LngLat;
  private updateHandler?: () => void;
  private isPersistentMode = false; // Track if dialog should be persistent
  private isClosed = false; // Track if close() was called
  private onReady?: () => void; // Callback when dialog is fully created

  constructor(data: RegionDialogData, x: number, y: number, map?: MapLibreMap, lngLat?: LngLat) {
    this.data = data;
    this.map = map;
    this.lngLat = lngLat;
    this.element = document.createElement('div'); // Create placeholder
    
    // Create dialog asynchronously
    this.createDialog(x, y).then(dialog => {
      // If close() was called before dialog was created, don't append it
      if (this.isClosed) {
        dialog.remove();
        this.onClose?.();
        return;
      }
      
      this.element = dialog;
      document.body.appendChild(this.element);
      
      // Apply persistent mode if it was set before dialog was ready
      if (this.isPersistentMode) {
        this.applyPersistentStyles();
      }
      
      // Call ready callback
      this.onReady?.();
    });

    // If map and lngLat provided, track map movement
    if (this.map && this.lngLat) {
      this.updateHandler = () => this.updatePosition();
      this.map.on('move', this.updateHandler);
      this.map.on('zoom', this.updateHandler);
    }
  }

  private async populateContent(content: HTMLDivElement): Promise<void> {
    if (!this.data.smallArea) {
      content.innerHTML = '<div style="opacity: 0.7;">No data available</div>';
      return;
    }

    // Show skeleton loader
    content.innerHTML = this.createSkeletonLoader();

    try {
      const response = await fetch(`${API_SERVER_URL}/api/area-data/${this.data.smallArea}`);
      
      if (!response.ok) {
        content.innerHTML = `<div style="opacity: 0.7;">No data found for ${this.data.smallArea}</div>`;
        return;
      }

      const areaData = await response.json();

      // Use isPersistentMode flag to determine what to show
      if (this.isPersistentMode) {
        // Show all data for clicked/persistent dialogs
        content.innerHTML = this.createFullDataView(areaData);
      } else {
        // Show only top 3 for hover dialogs
        content.innerHTML = this.createSummaryDataView(areaData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      content.innerHTML = '<div style="color: #ef4444;">Error loading data</div>';
    }
  }

  private createSkeletonLoader(): string {
    const skeletonRow = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; animation: pulse 1.5s ease-in-out infinite;">
        <div style="width: 60%; height: 16px; background: #334155; border-radius: 4px;"></div>
        <div style="width: 35%; height: 16px; background: #334155; border-radius: 4px;"></div>
      </div>
    `;
    
    const rows = this.isPersistentMode 
      ? Array(12).fill(skeletonRow).join('') // 12 rows for full view
      : Array(3).fill(skeletonRow).join(''); // 3 rows for summary
    
    return `
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>
      ${rows}
    `;
  }

  private createSummaryDataView(data: Level1Data): string {
    // Show top 3 items: excess_heat (temperature), sum, and highest positive value
    const items = [
      { label: 'Temperature', value: data.excess_heat, key: 'excess_heat' },
      { label: 'Total', value: data.sum, key: 'sum' },
      { label: 'Physical Activity', value: data.physical_activity, key: 'physical_activity' },
    ];

    return items.map(item => {
      const color = item.key === 'excess_heat' 
        ? getTemperatureColor(item.value)
        : (item.value >= 0 ? '#10b981' : '#ef4444');
      
      return `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="opacity: 0.8;">${item.label}:</span>
          <span style="color: ${color}; font-weight: 600;">${formatValue(item.value)}</span>
        </div>
      `;
    }).join('');
  }

  private createFullDataView(data: Level1Data): string {
    const fields = [
      { label: 'Air Quality', value: data.air_quality },
      { label: 'Congestion', value: data.congestion },
      { label: 'Dampness', value: data.dampness },
      { label: 'Diet Change', value: data.diet_change },
      { label: 'Excess Cold', value: data.excess_cold },
      { label: 'Excess Heat (Temp)', value: data.excess_heat, isTemp: true },
      { label: 'Hassle Costs', value: data.hassle_costs },
      { label: 'Noise', value: data.noise },
      { label: 'Physical Activity', value: data.physical_activity },
      { label: 'Road Repairs', value: data.road_repairs },
      { label: 'Road Safety', value: data.road_safety },
    ];

    const rows = fields.map(field => {
      const color = field.isTemp 
        ? getTemperatureColor(field.value)
        : (field.value >= 0 ? '#10b981' : '#ef4444');
      
      return `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; padding: 4px 0; border-bottom: 1px solid #334155;">
          <span style="opacity: 0.8; font-size: 11px;">${field.label}:</span>
          <span style="color: ${color}; font-weight: 600; font-size: 11px;">${formatValue(field.value)}</span>
        </div>
      `;
    }).join('');

    const totalColor = data.sum >= 0 ? '#10b981' : '#ef4444';
    
    return `
      ${rows}
      <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 8px; border-top: 2px solid #475569;">
        <span style="font-weight: 700;">Total Sum:</span>
        <span style="color: ${totalColor}; font-weight: 700;">${formatValue(data.sum)}</span>
      </div>
    `;
  }

  private async createDialog(x: number, y: number): Promise<HTMLDivElement> {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      min-width: 280px;
      max-width: 350px;
      background: #1e293b;
      border: 2px solid ${this.data.color};
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      z-index: 2000;
      pointer-events: auto;
      transition: opacity 0.2s;
    `;

    // Header with colored background
    const header = document.createElement('div');
    header.style.cssText = `
      background: ${this.data.color};
      color: #f1f5f9;
      padding: 12px 16px;
      font-weight: 600;
      font-size: 14px;
      border-radius: 6px 6px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.textContent = this.data.name;

    // Close button (hidden for hover-only dialogs)
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: #f1f5f9;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: none;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
    `;
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.7');
    closeBtn.addEventListener('click', () => this.close());
    header.appendChild(closeBtn);

    // Content
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 16px;
      color: #e2e8f0;
      font-size: 12px;
      line-height: 1.5;
      max-height: 400px;
      overflow-y: auto;
    `;
    
    // Load and display data
    await this.populateContent(content);

    // Compare button (hidden initially)
    const compareBtn = document.createElement('button');
    compareBtn.textContent = 'Compare';
    compareBtn.style.cssText = `
      width: calc(100% - 32px);
      margin: 0 16px 16px;
      padding: 8px 12px;
      background: #475569;
      border: 1px solid #64748b;
      border-radius: 4px;
      color: #e2e8f0;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: none;
      transition: background 0.2s;
    `;
    compareBtn.addEventListener('mouseenter', () => compareBtn.style.background = '#334155');
    compareBtn.addEventListener('mouseleave', () => compareBtn.style.background = '#475569');
    compareBtn.addEventListener('click', () => this.toggleCompare());

    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(compareBtn);

    // Store references for later access
    (dialog as any)._closeBtn = closeBtn;
    (dialog as any)._compareBtn = compareBtn;
    (dialog as any)._content = content;

    return dialog;
  }

  public makePersistent(): void {
    this.isPersistentMode = true;
    this.applyPersistentStyles();
  }

  private applyPersistentStyles(): void {
    const closeBtn = (this.element as any)._closeBtn;
    const compareBtn = (this.element as any)._compareBtn;
    if (closeBtn) closeBtn.style.display = 'flex';
    if (compareBtn) compareBtn.style.display = 'block';
    
    // Refresh content to show all data instead of summary
    const content = (this.element as any)._content;
    if (content && this.data.smallArea) {
      this.populateContent(content);
    }
  }

  public makeTemporary(): void {
    this.isPersistentMode = false;
    const closeBtn = (this.element as any)._closeBtn;
    const compareBtn = (this.element as any)._compareBtn;
    if (closeBtn) closeBtn.style.display = 'none';
    if (compareBtn) compareBtn.style.display = 'none';
  }

  /** Update the dialog position (for hover tooltips or map movement) */
  public setPosition(x: number, y: number): void {
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  /** Update position based on map coordinates */
  private updatePosition(): void {
    if (this.map && this.lngLat) {
      const point = this.map.project(this.lngLat);
      this.setPosition(point.x + 10, point.y - this.element.offsetHeight / 2);
    }
  }

  public close(): void {
    // Mark as closed
    this.isClosed = true;
    
    // Remove map event listeners
    if (this.map && this.updateHandler) {
      this.map.off('move', this.updateHandler);
      this.map.off('zoom', this.updateHandler);
    }

    // If comparing, close linked dialog too
    if (this.isComparing && this.linkedDialog) {
      this.linkedDialog.unlinkCompare();
      this.linkedDialog.close();
    }
    
    // Only try to animate/remove if element is actually in DOM
    if (this.element && this.element.parentElement) {
      this.element.style.opacity = '0';
      setTimeout(() => {
        if (this.element && this.element.parentElement) {
          this.element.remove();
        }
        this.onClose?.();
      }, 200);
    } else {
      // Element not in DOM yet, just call onClose
      this.onClose?.();
    }
  }

  public toggleCompare(): void {
    this.isComparing = !this.isComparing;
    
    console.log('toggleCompare called, isComparing:', this.isComparing);
    
    // Update button if element is ready
    const compareBtn = (this.element as any)._compareBtn;
    if (compareBtn) {
      if (this.isComparing) {
        // Check if we have a linked dialog (from the prompt state)
        if (this.linkedDialog) {
          // Activate compare mode on both dialogs
          console.log('Activating compare mode for both linked dialogs');
          compareBtn.style.background = '#10b981';
          compareBtn.style.borderColor = '#34d399';
          compareBtn.textContent = `Comparing with ${this.linkedDialog.data.name}`;
          
          // Update the other dialog too
          this.linkedDialog.isComparing = true;
          const otherBtn = (this.linkedDialog.element as any)._compareBtn;
          if (otherBtn) {
            otherBtn.style.background = '#10b981';
            otherBtn.style.borderColor = '#34d399';
            otherBtn.textContent = `Comparing with ${this.data.name}`;
          }
        } else {
          // No linked dialog yet, waiting for second click
          compareBtn.style.background = '#3b82f6';
          compareBtn.style.borderColor = '#60a5fa';
          compareBtn.textContent = 'Comparing...';
          console.log('Compare mode activated - waiting for second region');
        }
      } else {
        compareBtn.style.background = '#475569';
        compareBtn.style.borderColor = '#64748b';
        compareBtn.textContent = 'Compare';
        if (this.linkedDialog) {
          this.linkedDialog.unlinkCompare();
          this.linkedDialog = undefined;
        }
        console.log('Compare mode deactivated');
      }
    } else {
      console.warn('Compare button not ready yet');
    }
    
    // Call callback
    this.onCompare?.(this);
  }

  public linkCompare(otherDialog: RegionDialog): void {
    this.linkedDialog = otherDialog;
    const compareBtn = (this.element as any)._compareBtn;
    if (compareBtn) {
      // If this dialog is not yet in compare mode, show "Compare with X?" prompt
      if (!this.isComparing) {
        compareBtn.textContent = `Compare with ${otherDialog.data.name}?`;
        compareBtn.style.background = '#f59e0b'; // Orange to indicate prompt
        compareBtn.style.borderColor = '#fbbf24';
      } else {
        // Both are in compare mode, show green confirmation
        compareBtn.textContent = `Comparing with ${otherDialog.data.name}`;
        compareBtn.style.background = '#10b981';
        compareBtn.style.borderColor = '#34d399';
      }
    }
  }

  public unlinkCompare(): void {
    this.isComparing = false;
    this.linkedDialog = undefined;
    const compareBtn = (this.element as any)._compareBtn;
    if (compareBtn) {
      compareBtn.textContent = 'Compare';
      compareBtn.style.background = '#475569';
      compareBtn.style.borderColor = '#64748b';
    }
  }

  public setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  public setOnCompare(callback: (dialog: RegionDialog) => void): void {
    this.onCompare = callback;
  }

  public setOnReady(callback: () => void): void {
    this.onReady = callback;
  }

  public getData(): RegionDialogData {
    return this.data;
  }

  public isInCompareMode(): boolean {
    return this.isComparing;
  }

  public getLinkedDialog(): RegionDialog | undefined {
    return this.linkedDialog;
  }
}
