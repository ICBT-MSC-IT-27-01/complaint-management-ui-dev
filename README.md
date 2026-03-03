# Complaint Management System - UI (Angular 21)

Angular frontend for the Complaint Management System with role-based access and complaint lifecycle management.

## Stack
- Angular 21 (standalone)
- TypeScript
- Bootstrap 5.3 + Bootstrap Icons
- Custom SCSS design tokens and module styles
- JWT auth + role guards + HTTP interceptor
- REST API integration

## Features
- User authentication and authorization
- Role-based shell (sidebar/topbar)
- Dashboard with complaint statistics
- Complaints: list, detail timeline, create
- Client portal: my complaints, complaint detail/reply layout
- Responsive UI design

## Prerequisites
- Node.js (v18 or later recommended)
- Angular CLI

## Run
```bash
cd apps/cms-angular21
npm install
npm start
```

## API
- `src/environments/environment.ts` points to `https://localhost:7000/api/v1`.
- Response envelope: `ApiEnvelope<T>`.
