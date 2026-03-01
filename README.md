# CMS Angular 21 (Bootstrap + Custom CSS)

New Angular 21 application for Complaint Management System phase-1 implementation.

## Stack
- Angular 21 standalone
- Bootstrap 5.3 + Bootstrap Icons
- Custom SCSS design tokens and module styles
- JWT auth + role guards + HTTP interceptor

## Run
```bash
cd apps/cms-angular21
npm install
npm start
```

## API
- `src/environments/environment.ts` points to `https://localhost:7000/api/v1`.
- Response envelope: `ApiEnvelope<T>`.

## Implemented modules
- Auth (login)
- Role-based shell (sidebar/topbar)
- Dashboard
- Complaints: list, detail timeline, create
- Client portal: my complaints, complaint detail/reply layout
