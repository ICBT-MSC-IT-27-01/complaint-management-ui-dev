import { Component, inject } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { ThemeService, AppTheme } from '@core/services/theme.service';

@Component({
  selector: 'app-theme-preview',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Theme Preview</h2>
        <p class="page-sub">Test curated modern palettes and component states before rollout.</p>
      </div>
    </div>

    <div class="theme-preview-grid">
      <article class="theme-preview-card cms-card" *ngFor="let option of options">
        <div
          class="card-body"
          [style.--preview-accent]="option.colors.accent"
          [style.--preview-surface]="option.colors.surface"
          [style.--preview-muted]="option.colors.muted"
          [style.--preview-border]="option.colors.border"
        >
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="card-title mb-0">{{ option.label }}</h6>
            <span class="badge" [ngClass]="isActive(option.value) ? 'bg-success' : 'bg-secondary'">
              {{ isActive(option.value) ? 'Active' : 'Preview' }}
            </span>
          </div>
          <p class="text-muted mb-3">{{ option.description }}</p>

          <div class="preview-swatches mb-3">
            <span class="swatch swatch-accent"></span>
            <span class="swatch swatch-surface"></span>
            <span class="swatch swatch-muted"></span>
            <span class="swatch swatch-border"></span>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-size-md" (click)="theme.setTheme(option.value)">Apply Theme</button>
            <button class="btn btn-outline-primary btn-size-md">Primary Action</button>
          </div>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .theme-preview-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .preview-swatches {
      display: flex;
      gap: 8px;
    }

    .swatch {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--border-default);
    }

    .swatch-accent { background: var(--preview-accent); }
    .swatch-surface { background: var(--preview-surface); }
    .swatch-muted { background: var(--preview-muted); }
    .swatch-border { background: var(--preview-border); }

    @media (max-width: 1023px) {
      .theme-preview-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ThemePreviewComponent {
  theme = inject(ThemeService);

  readonly options: Array<{
    value: AppTheme;
    label: string;
    description: string;
    colors: { accent: string; surface: string; muted: string; border: string };
  }> = [
    {
      value: 'calm-blue',
      label: 'Calm Blue',
      description: 'Balanced enterprise blue with clean neutral surfaces.',
      colors: { accent: '#3d7cff', surface: '#ffffff', muted: '#f7faff', border: '#dce4f1' }
    },
    {
      value: 'graphite',
      label: 'Graphite',
      description: 'Low-glare dark operations skin for long dashboard sessions.',
      colors: { accent: '#6fa8ff', surface: '#1d2635', muted: '#253146', border: '#31405a' }
    },
    {
      value: 'emerald-ops',
      label: 'Emerald Ops',
      description: 'Green-forward operational palette with compliance tone.',
      colors: { accent: '#0f9f7e', surface: '#ffffff', muted: '#f2fbf7', border: '#cfe4de' }
    }
  ];

  isActive(value: AppTheme): boolean {
    return this.theme.currentTheme() === value;
  }
}
