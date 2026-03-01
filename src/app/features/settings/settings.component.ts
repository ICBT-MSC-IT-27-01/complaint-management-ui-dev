import { Component, signal } from '@angular/core';
import { NgClass, NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgClass, NgSwitch, NgSwitchCase],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Account Settings</h2>
        <p class="page-sub">Manage profile, notifications, security protocols, and system preferences.</p>
      </div>
      <button class="btn btn-primary">Save Changes</button>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><button class="nav-link" [ngClass]="{active: tab()==='profile'}" (click)="tab.set('profile')">Profile</button></li>
      <li class="nav-item"><button class="nav-link" [ngClass]="{active: tab()==='notifications'}" (click)="tab.set('notifications')">Notifications</button></li>
      <li class="nav-item"><button class="nav-link" [ngClass]="{active: tab()==='security'}" (click)="tab.set('security')">Security</button></li>
      <li class="nav-item"><button class="nav-link" [ngClass]="{active: tab()==='preferences'}" (click)="tab.set('preferences')">System Preferences</button></li>
    </ul>

    <div class="card cms-card">
      <div class="card-body" [ngSwitch]="tab()">
        <div *ngSwitchCase="'profile'">
          <h6 class="fw-bold">Profile Information</h6>
          <p class="text-muted">Update your photo and personal details.</p>
          <div class="row g-3 mt-1">
            <div class="col-md-6"><label class="form-label">Full Name</label><input class="form-control" value="Alex Rivera"></div>
            <div class="col-md-6"><label class="form-label">Email</label><input class="form-control" value="alex@complimate.com"></div>
          </div>
        </div>
        <div *ngSwitchCase="'notifications'">
          <h6 class="fw-bold">Notification Rules</h6>
          <div class="form-check form-switch mt-3"><input class="form-check-input" type="checkbox" checked><label class="form-check-label">SLA breach alerts</label></div>
          <div class="form-check form-switch mt-2"><input class="form-check-input" type="checkbox" checked><label class="form-check-label">Daily summary email</label></div>
        </div>
        <div *ngSwitchCase="'security'">
          <h6 class="fw-bold">Security Controls</h6>
          <div class="row g-3 mt-1">
            <div class="col-md-6"><label class="form-label">Session Timeout</label><select class="form-select"><option>30 minutes</option><option>1 hour</option></select></div>
            <div class="col-md-6"><label class="form-label">MFA</label><select class="form-select"><option>Required</option><option>Optional</option></select></div>
          </div>
        </div>
        <div *ngSwitchCase="'preferences'">
          <h6 class="fw-bold">System Preferences</h6>
          <div class="row g-3 mt-1">
            <div class="col-md-6"><label class="form-label">Timezone</label><select class="form-select"><option>UTC-08:00 Pacific</option></select></div>
            <div class="col-md-6"><label class="form-label">Date Format</label><select class="form-select"><option>MMM dd, yyyy</option></select></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  tab = signal<'profile' | 'notifications' | 'security' | 'preferences'>('profile');
}
