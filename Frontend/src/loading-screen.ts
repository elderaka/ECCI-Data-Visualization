export class LoadingScreen {
  private overlay: HTMLDivElement;
  private progressBar: HTMLDivElement;
  private progressText: HTMLSpanElement;
  private subtitleText: HTMLSpanElement;
  private currentProgress = 0;
  private subtitleInterval?: number;
  
  private subtitleOptions = [
    'Hiji',
    'Loro',
    'Tilu',
    'Opat',
    'Lima',
    'Genep',
    'Tujuh',
    'Dalapan',
  ];

  constructor() {
    this.overlay = this.createOverlay();
    this.progressBar = this.overlay.querySelector('.progress-bar') as HTMLDivElement;
    this.progressText = this.overlay.querySelector('.progress-text') as HTMLSpanElement;
    this.subtitleText = this.overlay.querySelector('.loading-subtitle') as HTMLSpanElement;
  }

  private createOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <h1 class="loading-title">Lorem ipsum dolor nanti diganti</h1>
        <div class="loading-subtitle">Hiji</div>
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
        <span class="progress-text">0%</span>
      </div>
    `;
    
    document.body.appendChild(overlay);
    return overlay;
  }

  private cycleSubtitle(): void {
    const randomIndex = Math.floor(Math.random() * this.subtitleOptions.length);
    this.subtitleText.textContent = this.subtitleOptions[randomIndex];
  }

  public setProgress(percent: number): void {
    this.currentProgress = Math.min(100, Math.max(0, percent));
    this.progressBar.style.width = `${this.currentProgress}%`;
    this.progressText.textContent = `${Math.round(this.currentProgress)}%`;
  }

  public show(): void {
    this.overlay.style.display = 'flex';
    this.overlay.style.opacity = '1';
    
    // Start cycling subtitle
    this.cycleSubtitle();
    this.subtitleInterval = window.setInterval(() => {
      this.cycleSubtitle();
    }, 400); // Change every 400ms
  }

  public hide(): void {
    // Stop cycling subtitle
    if (this.subtitleInterval) {
      clearInterval(this.subtitleInterval);
      this.subtitleInterval = undefined;
    }
    
    this.overlay.style.opacity = '0';
    setTimeout(() => {
      this.overlay.style.display = 'none';
    }, 300);
  }

  public remove(): void {
    if (this.subtitleInterval) {
      clearInterval(this.subtitleInterval);
    }
    this.overlay.remove();
  }
}
