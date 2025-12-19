import type { StoryMode } from './sections/story-mode';

export class Navbar {
  private container: HTMLElement;
  private storyMode: StoryMode | null = null;

  constructor() {
    this.container = this.createNavbar();
    document.body.appendChild(this.container);
  }

  public setStoryMode(storyMode: StoryMode): void {
    this.storyMode = storyMode;
  }

  private createNavbar(): HTMLElement {
    const nav = document.createElement('nav');
    nav.id = 'main-navbar';
    nav.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 9999;
    `;

    // Left side - Title
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: opacity 0.2s;
    `;
    titleContainer.addEventListener('mouseenter', () => {
      titleContainer.style.opacity = '0.8';
    });
    titleContainer.addEventListener('mouseleave', () => {
      titleContainer.style.opacity = '1';
    });
    titleContainer.addEventListener('click', () => this.handleStoryClick());

    const title = document.createElement('h1');
    title.textContent = 'Your UK in the Future';
    title.style.cssText = `
      font-size: 20px;
      font-weight: 700;
      color: #60a5fa;
      margin: 0;
      letter-spacing: 0.5px;
    `;

    titleContainer.appendChild(title);

    // Right side - Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
    `;

    // Story Button
    const storyButton = this.createButton('Story', () => this.handleStoryClick());
    
    // Demo Button
    const demoButton = this.createButton('Demo', () => this.handleDemoClick());

    buttonContainer.appendChild(storyButton);
    buttonContainer.appendChild(demoButton);

    nav.appendChild(titleContainer);
    nav.appendChild(buttonContainer);

    return nav;
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
    });

    button.addEventListener('click', onClick);

    return button;
  }

  private handleStoryClick(): void {
    if (this.storyMode) {
      // Close all dialogs
      this.closeAllDialogs();
      
      // Switch to story mode and reset to section 0
      this.storyMode.setMode('story');
      this.storyMode.resetToFirstSection();
      
      // Scroll to first section
      const scrollContainer = document.getElementById('scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  private closeAllDialogs(): void {
    // Close all persistent dialogs
    const dialogs = document.querySelectorAll('[style*="z-index: 2000"]');
    dialogs.forEach(dialog => {
      if (dialog.parentElement) {
        dialog.remove();
      }
    });
  }

  private handleDemoClick(): void {
    if (this.storyMode) {
      // Switch to free mode
      this.storyMode.setMode('free');
    }
  }
}
