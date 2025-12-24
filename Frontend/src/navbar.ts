import type { StoryMode } from './sections/story-mode';

export class Navbar {
  private container: HTMLElement;
  private storyMode: StoryMode | null = null;
  private chapterTabsContainer: HTMLElement | null = null;

  constructor() {
    this.container = this.createNavbar();
    document.body.appendChild(this.container);
    
    // Listen for section changes
    window.addEventListener('sectionChange', ((e: CustomEvent) => {
      this.updateActiveChapter(e.detail.index);
    }) as EventListener);
  }

  public setStoryMode(storyMode: StoryMode): void {
    this.storyMode = storyMode;
    this.updateChapterTabs();
  }
  
  /**
   * Update chapter tabs based on current story sections
   */
  private updateChapterTabs(): void {
    if (!this.storyMode || !this.chapterTabsContainer) return;
    
    // Clear existing tabs
    this.chapterTabsContainer.innerHTML = '';
    
    // Get chapters from CO_BENEFITS_SECTIONS
    const chapters = [
      { label: 'Intro', index: 1 },
      { label: 'Homes', index: 2 },
      { label: 'Streets', index: 3 },
      { label: 'Noise', index: 4 },
      { label: 'Trade-offs', index: 5 }
    ];
    
    chapters.forEach(chapter => {
      const tab = this.createChapterTab(chapter.label, chapter.index);
      this.chapterTabsContainer!.appendChild(tab);
    });
  }
  
  /**
   * Create a chapter navigation tab
   */
  private createChapterTab(label: string, sectionIndex: number): HTMLElement {
    const tab = document.createElement('button');
    tab.textContent = label;
    tab.dataset.section = sectionIndex.toString();
    tab.style.cssText = `
      color: var(--text-muted);
      background: transparent;
      border: none;
      padding: 6px 12px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;
    `;
    
    tab.addEventListener('mouseenter', () => {
      if (this.storyMode?.getCurrentSection() !== sectionIndex) {
        tab.style.color = 'var(--text-secondary)';
        tab.style.background = 'rgba(59, 130, 246, 0.1)';
      }
    });
    
    tab.addEventListener('mouseleave', () => {
      if (this.storyMode?.getCurrentSection() !== sectionIndex) {
        tab.style.color = 'var(--text-muted)';
        tab.style.background = 'transparent';
      }
    });
    
    tab.addEventListener('click', () => {
      if (this.storyMode) {
        this.storyMode.goToSectionIndex(sectionIndex);
      }
    });
    
    return tab;
  }
  
  /**
   * Update active chapter tab
   */
  public updateActiveChapter(sectionIndex: number): void {
    if (!this.chapterTabsContainer) return;
    
    const tabs = this.chapterTabsContainer.querySelectorAll('button');
    tabs.forEach(tab => {
      const tabSection = parseInt(tab.dataset.section || '-1');
      if (tabSection === sectionIndex) {
        tab.style.color = 'white';
        tab.style.background = 'var(--primary-500)';
      } else {
        tab.style.color = 'var(--text-muted)';
        tab.style.background = 'transparent';
      }
    });
  }

  private createNavbar(): HTMLElement {
    const nav = document.createElement('nav');
    nav.id = 'main-navbar';
    nav.className = 'glass';
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
      background: var(--bg-glass);
      backdrop-filter: blur(12px);
      border-bottom: var(--border-subtle);
    `;

    // Left side - Title
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: opacity var(--transition-fast);
    `;
    titleContainer.addEventListener('mouseenter', () => {
      titleContainer.style.opacity = '0.8';
    });
    titleContainer.addEventListener('mouseleave', () => {
      titleContainer.style.opacity = '1';
    });
    titleContainer.addEventListener('click', () => this.handleStoryClick());

    const title = document.createElement('h1');
    title.textContent = 'Net-zero Co-Benefits';
    title.style.cssText = `
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary-400), var(--growth-400));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      letter-spacing: 0.5px;
    `;

    const subtitle = document.createElement('span');
    subtitle.textContent = 'UK 2025–2050';
    subtitle.style.cssText = `
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
    `;

    titleContainer.appendChild(title);
    titleContainer.appendChild(subtitle);

    // Center - Chapter tabs
    this.chapterTabsContainer = document.createElement('div');
    this.chapterTabsContainer.id = 'chapter-tabs';
    this.chapterTabsContainer.style.cssText = `
      display: flex;
      gap: 4px;
      align-items: center;
    `;

    // Right side - Mode buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
    `;

    // Story Button
    const storyButton = this.createButton('Story', () => this.handleStoryClick());
    
    // Demo Button
    const demoButton = this.createButton('Explore', () => this.handleDemoClick());

    buttonContainer.appendChild(storyButton);
    buttonContainer.appendChild(demoButton);

    nav.appendChild(titleContainer);
    nav.appendChild(this.chapterTabsContainer);
    nav.appendChild(buttonContainer);

    return nav;
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      color: white;
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      border: none;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-smooth);
      box-shadow: var(--shadow-sm);
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = 'var(--shadow-glow-primary)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = 'var(--shadow-sm)';
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
