# PageTurn — Angular Bookshop

An online bookshop built with Angular 17 (standalone components) and Firebase.

## Features

- Browse and search a book catalog, with a detail page per book
- Cart shared across devices/accounts for signed-in users
- Email/password authentication with route guards for protected and admin-only areas
- Admin panel for managing the catalog
- Static content pages: About, Contact, Shipping & Returns, Privacy Policy

## Tech stack

- [Angular 17](https://angular.dev/) — standalone components, lazy-loaded routes
- [Firebase](https://firebase.google.com/) via `@angular/fire` — auth and data storage
- SCSS for styling

## Getting started

### Prerequisites

- Node.js and npm
- Angular CLI (`npm install -g @angular/cli`)
- A Firebase project (for auth/storage config — see `src/app/app.config.ts`)

### Install dependencies

```bash
npm install
```

### Run the dev server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on source changes.

### Build for production

```bash
npm run build
```

Build artifacts are output to `dist/pageturn-angular`.

## Project structure

```
src/app/
├── core/            # Guards, models, and services (auth, books, cart, storage, toast)
├── pages/           # Route-level standalone components (home, shop, cart, auth, admin, ...)
├── shared/          # Shared UI components (header, footer)
├── app.routes.ts     # Route definitions
└── app.config.ts     # App-wide providers (Firebase, router, etc.)
```
