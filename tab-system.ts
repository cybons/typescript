interface Page {
  name: string;
  handler: () => HTMLElement;
}

export class TabSystem {
  private pages: Page[];
  private mainContainer: HTMLElement;
  private tabContainer: HTMLElement;

  constructor(mainContainerId: string, tabContainerId: string) {
    this.pages = [];
    this.mainContainer = document.getElementById(mainContainerId)!;
    this.tabContainer = document.getElementById(tabContainerId)!;
  }

  public addPage(name: string, handler: () => HTMLElement) {
    this.pages.push({ name, handler });
    this.createTabElement(name);
  }

  private createTabElement(name: string) {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = name;
    tab.addEventListener('click', () => this.changeContent(name));
    this.tabContainer.appendChild(tab);
  }

  private changeContent(name: string) {
    const page = this.pages.find(page => page.name === name);
    if (page) {
      this.mainContainer.innerHTML = '';
      this.mainContainer.appendChild(page.handler());
    }
  }
}
