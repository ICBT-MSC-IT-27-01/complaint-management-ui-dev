import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-pill',
  standalone: true,
  template: '<span class="status-pill" [class]="cssClass">{{ text }}</span>',
  styleUrl: './status-pill.component.scss'
})
export class StatusPillComponent {
  @Input({ required: true }) text = '';

  get cssClass(): string {
    const value = this.text.toLowerCase();
    if (value.includes('new')) return 'pill-new';
    if (value.includes('progress') || value.includes('waiting')) return 'pill-progress';
    if (value.includes('resolved') || value.includes('closed')) return 'pill-resolved';
    if (value.includes('escalated')) return 'pill-escalated';
    return 'pill-default';
  }
}

