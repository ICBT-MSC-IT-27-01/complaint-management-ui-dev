# UI-API Alignment Pre-Change Plan

Date: 2026-03-05  
UI Repo: `complaint-management-ui-dev` (branch `main`, commit `ef7b1730`)  
Target API Repo: `https://github.com/ICBT-MSC-IT-27-01/complaint-management-api-dev.git` (commit `bb997196`)

## Purpose
Define all required UI changes before implementation so the Angular UI fully aligns with the latest API contract.

## Current State (Before Changes)
- Core CRUD integrations exist for `auth`, `users`, `clients`, `categories`, `complaints`, `cases`, `attachments`, and basic `reports`.
- `teams` and `access-control` pages are currently static/demo UI and not connected to backend APIs.
- Client portal pages currently reuse `/complaints` endpoints and do client-side filtering.
- Report page is only partially wired (`/reports/complaints-summary`) and ignores additional report/export endpoints.
- Auth UI is missing forgot/reset password flows exposed by the API.
- Export endpoints in API are not connected in UI (`users`, `complaints`, summary PDF).

## API Endpoints Newly Relevant to UI
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/users/export/csv`
- `GET /api/v1/complaints/{id}/sla-timer`
- `GET /api/v1/complaints/export/csv`
- `GET /api/v1/reports/high-priority-overdue`
- `GET /api/v1/reports/complaints-summary/export/pdf`
- `GET /api/v1/teams`, `POST /api/v1/teams`, `PATCH /api/v1/teams/{id}/archive`
- `GET /api/v1/role-permissions/{role}`, `POST /api/v1/role-permissions/save`, `POST /api/v1/role-permissions/{role}/duplicate/{newRole}`, `GET /api/v1/role-permissions/audit-trail`
- `POST /api/v1/client-portal/complaints`
- `GET /api/v1/client-portal/complaints`
- `POST /api/v1/client-portal/complaints/{id}/reply`
- Account/security APIs (for profile/settings expansion):
  - `GET /api/v1/account/sessions`
  - `DELETE /api/v1/account/sessions/{sessionId}`
  - `POST /api/v1/account/2fa/setup`
  - `POST /api/v1/account/2fa/enable`
  - `DELETE /api/v1/account/deactivate`

## Planned UI Change Set

### 1. Auth and Account Recovery
- Add forgot password request flow and reset password screen.
- Extend auth models/services for new DTO fields (`sessionId`, `twoFactorEnabled`) and recovery APIs.

Target files:
- `src/app/core/models/auth.model.ts`
- `src/app/core/services/auth.service.ts`
- `src/app/features/auth/login/login.component.ts`
- `src/app/features/auth/login/login.component.html`
- `src/app/features/auth/auth.routes.ts`
- New components for forgot/reset password

### 2. Client Portal Contract Alignment
- Replace client-side filtering logic with server-side client portal endpoints.
- Use `POST /client-portal/complaints` for client complaint creation flow.
- Add reply capability from complaint detail for clients.

Target files:
- `src/app/core/services/complaint.service.ts` (or split with new `client-portal.service.ts`)
- `src/app/features/client-portal/list/client-complaints-list.component.ts`
- `src/app/features/client-portal/detail/client-complaint-detail.component.ts`
- `src/app/features/complaints/form/complaint-form.component.ts`
- `src/app/core/models/complaint.model.ts`

### 3. Reports and Exports
- Add UI actions for:
  - high-priority overdue list
  - complaints summary PDF export
  - complaints CSV export
  - users CSV export
- Expand report models to include missing dashboard fields (`slaCompliancePercent`, `avgResolutionHours`).

Target files:
- `src/app/core/services/report.service.ts`
- `src/app/core/services/complaint.service.ts`
- `src/app/core/services/user.service.ts`
- `src/app/core/models/report.model.ts`
- `src/app/features/reports/reports.component.ts`
- `src/app/features/complaints/list/complaints-list.component.ts`
- `src/app/features/users/list/users-list.component.ts`

### 4. Teams Module Backend Integration
- Replace static teams data with API-driven list/create/archive actions.

Target files:
- `src/app/features/teams/teams.component.ts`
- New `src/app/core/services/team.service.ts`
- New `src/app/core/models/team.model.ts`

### 5. Access Control Module Backend Integration
- Connect permissions matrix to role-permissions API (load/save/duplicate/audit trail).

Target files:
- `src/app/features/access-control/access-control.component.ts`
- New `src/app/core/services/role-permission.service.ts`
- New `src/app/core/models/role-permission.model.ts`

### 6. Complaint SLA Visibility
- Add SLA timer UI data source using `/complaints/{id}/sla-timer`.

Target files:
- `src/app/core/services/complaint.service.ts`
- `src/app/features/complaints/detail/complaint-detail.component.ts`

### 7. Profile & Security Enhancements (Optional but Recommended)
- Integrate account sessions + 2FA setup/enable + account deactivation flows.

Target files:
- `src/app/features/users/profile/profile.component.ts`
- `src/app/features/settings/settings.component.ts`
- New `src/app/core/services/account.service.ts`
- New `src/app/core/models/account.model.ts`

## Cross-Cutting Refactor Notes
- Standardize DTO mapping strategy for API responses (prefer camelCase native fields; keep temporary fallback for PascalCase where needed).
- Ensure role-based UI visibility mirrors API authorization rules to prevent dead actions in UI.
- Add download handling utilities for CSV/PDF binary responses.

## Implementation Order
1. Auth recovery + model/service contract updates
2. Client portal endpoint migration
3. Teams + access-control API wiring
4. Reports/export integrations
5. SLA timer + profile/security enhancements
6. Regression test pass and role-based validation

## Acceptance Criteria
- No static/mock data remains on Teams and Access Control pages.
- Client users do not call restricted admin/agent complaint create endpoints.
- Export actions trigger real file downloads from backend endpoints.
- Report dashboard renders all available backend metrics.
- Existing complaint/user/client/category CRUD flows still function.
