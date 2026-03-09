import { Injectable, signal } from '@angular/core';

export type AppTheme = 'calm-blue' | 'graphite' | 'emerald-ops';

const THEME_STORAGE_KEY = 'cms-theme';
const DEFAULT_THEME: AppTheme = 'calm-blue';

const LEGACY_THEME_MAP: Record<string, AppTheme> = {
  light: 'calm-blue',
  blue: 'calm-blue',
  dark: 'graphite'
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themes: ReadonlyArray<AppTheme> = ['calm-blue', 'graphite', 'emerald-ops'];
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
    if (!storedTheme) {
      return DEFAULT_THEME;
    }

    const migratedTheme = LEGACY_THEME_MAP[storedTheme] ?? storedTheme;
    if (this.themes.includes(migratedTheme as AppTheme)) {
      return migratedTheme as AppTheme;
    }

    return DEFAULT_THEME;
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
  }
}
