import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container-fluid py-4">
      <h2 class="mb-2">{{ title }}</h2>
      <p class="text-muted mb-0">This module navigation is enabled and ready for API-aligned UI implementation.</p>
    </section>
  `
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] ?? 'Module';
}
