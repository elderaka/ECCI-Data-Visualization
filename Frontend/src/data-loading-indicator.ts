export class DataLoadingIndicator {
  private container: HTMLDivElement;
  private spinner: HTMLDivElement;
  private text: HTMLSpanElement;
  private activeRequests = 0;

  constructor() {
    // Create container
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(30, 41, 59, 0.95);
      border: 1px solid #475569;
      border-radius: 6px;
      padding: 8px 12px;
      display: none;
      align-items: center;
      gap: 8px;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: opacity 0.2s;
    `;

    // Create spinner
    this.spinner = document.createElement('div');
    this.spinner.style.cssText = `
      width: 16px;
      height: 16px;
      border: 2px solid #475569;
      border-top-color: #60a5fa;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    `;

    // Create text
    this.text = document.createElement('span');
    this.text.textContent = 'Loading data...';
    this.text.style.cssText = `
      font-size: 13px;
      color: #e2e8f0;
      font-weight: 500;
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // Assemble
    this.container.appendChild(this.spinner);
    this.container.appendChild(this.text);
    document.body.appendChild(this.container);
  }

  public show(message?: string): void {
    this.activeRequests++;
    if (message) {
      this.text.textContent = message;
    } else {
      this.text.textContent = 'Loading data...';
    }
    this.container.style.display = 'flex';
  }

  public hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    
    // Only hide if no active requests
    if (this.activeRequests === 0) {
      this.container.style.opacity = '0';
      setTimeout(() => {
        this.container.style.display = 'none';
        this.container.style.opacity = '1';
      }, 200);
    }
  }

  public forceHide(): void {
    this.activeRequests = 0;
    this.container.style.display = 'none';
  }
}
