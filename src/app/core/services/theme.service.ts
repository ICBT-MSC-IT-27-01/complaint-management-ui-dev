import { Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark' | 'blue';

const THEME_STORAGE_KEY = 'cms-theme';
const DEFAULT_THEME: AppTheme = 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themes: ReadonlyArray<AppTheme> = ['light', 'dark', 'blue'];
  readonly currentTheme = signal<AppTheme>(this.resolveInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  setTheme(theme: AppTheme): void {
    if (!this.themes.includes(theme)) {
      return;
    }

    this.currentTheme.set(theme);
    this.applyTheme(theme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }

  private resolveInitialTheme(): AppTheme {
    if (typeof localStorage === 'undefined') {
      return DEFAULT_THEME;
    }

    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme && this.themes.includes(storedTheme as AppTheme)) {
      return storedTheme as AppTheme;
    }

    return DEFAULT_THEME;
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}
