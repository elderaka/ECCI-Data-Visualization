import type { Map as MapLibreMap } from 'maplibre-gl';
import { House3D } from './visualizations/three-d-house';

/**
 * Debug Housing 3D Overlay
 * Positions a Three.js 3D house on the map at a specific location.
 * 
 * DEBUG MODE: Toggle with window.debugHouse3D()
 */
export class DebugHousing3D {
  private map: MapLibreMap;
  private house3d: House3D | null = null;
  private container: HTMLElement | null = null;
  private isActive: boolean = false;

  constructor(map: MapLibreMap) {
    this.map = map;
    this.setupDebugToggle();
  }

  /**
   * Expose debug toggle to window for easy access
   */
  private setupDebugToggle(): void {
    (window as any).debugHouse3D = () => {
      if (this.isActive) {
        this.disable();
      } else {
        this.enable();
      }
    };
    console.log('💡 Debug tip: Type debugHouse3D() in console to toggle 3D house overlay');
  }

  /**
   * Enable 3D house at debug location
   */
  public enable(): void {
    if (this.isActive) return;
    this.isActive = true;

    // Create container for Three.js
    this.container = document.createElement('div');
    this.container.id = 'three-d-house-container';
    this.container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      height: 400px;
      border-radius: 12px;
      border: 2px solid var(--primary-500);
      background: var(--dark-800);
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
      z-index: 1000;
      overflow: hidden;
    `;
    document.body.appendChild(this.container);

    // Create 3D house
    this.house3d = new House3D({
      containerId: 'three-d-house-container',
      animateRotation: true
    });

    // Fly to debug location
    this.map.flyTo({
      center: [-2.5281, 54.3994],
      zoom: 9.45,
      pitch: 50,
      bearing: 51.6,
      duration: 2000,
      essential: true
    });

    // Add label
    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute;
      top: 8px;
      left: 12px;
      background: var(--primary-500);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      z-index: 10;
      pointer-events: none;
    `;
    label.textContent = '3D Housing Prototype';
    this.container.appendChild(label);

    console.log('✅ 3D house enabled at center: -2.5281, 54.3994');
    console.log('📍 Zoom: 9.45, Pitch: 50°, Bearing: 51.6°');
  }

  /**
   * Disable 3D house overlay
   */
  public disable(): void {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.house3d) {
      this.house3d.destroy();
      this.house3d = null;
    }

    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
      this.container = null;
    }

    console.log('❌ 3D house disabled');
  }

  public isEnabled(): boolean {
    return this.isActive;
  }
}
