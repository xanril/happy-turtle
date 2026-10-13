import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '[class.dark-theme]': 'isDark()',
  },
})
export class App {
  private readonly document = inject(DOCUMENT);

  protected readonly theme = signal<Theme>('light');
  protected readonly isDark = computed(() => this.theme() === 'dark');

  private readonly updateThemeStylesheet = effect(() => {
    this.document.querySelector<HTMLLinkElement>('#theme-styles')?.setAttribute('href', `themes/${this.theme()}.css`);
  });

  protected toggleTheme(): void {
    this.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
  }
}
