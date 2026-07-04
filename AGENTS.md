# Ecogest — AGENTS.md

## Dev Commands

Backend (`Ecogest Backend/`):
```bash
cd Ecogest Backend && npm start  # API at http://localhost:4000
```

ERP (`src/`):
```bash
cd Ecogest Backend && npm start  # API at http://localhost:4000 (run first)
npm start      # Dev server at http://localhost:3000
npm run dev    # Alias for start
npm run build  # Build to build/ (not dist/)
npm run serve  # Preview build locally
npm run lint   # ESLint (Prettier included)
```

Portal ciudadano (`Ecogest Portal/`):
```bash
npm run backend         # Start backend from repo root
npm run portal          # Dev server at http://localhost:5173
npm run portal-build    # Build to build/portal/
npm run portal-preview  # Preview build locally
```

## Three-App Architecture

This repo contains three independent apps:

1. **Ecogest Backend** (`Ecogest Backend/`) — shared REST API
   - Port 4000, powered by `json-server` + `json-server-auth` (JWT)
   - Single source of truth for ERP + Portal
   - Auth endpoints: `POST /register`, `POST /login`
   - Passwords hashed with bcrypt

2. **Ecogest ERP** (`src/`) — backoffice/admin app
   - Port 3000, builds to `build/`
   - CoreUI 5, React Router HashRouter, Redux (sidebar/theme only)

3. **Ecogest Portal** (`Ecogest Portal/`) — citizen-facing portal
   - Port 5173, builds to `build/portal/`
   - Tailwind CDN + Material Symbols (no CoreUI dependency)
   - Manual hash router in `src/App.js`
   - ✅ Services now consume `http://localhost:4000` independently (no ERP imports)

## Tech Stack

- Vite 7.x + React 19.x
- Plain JS (no TypeScript — esbuild treats `.js` as JSX)
- Main ERP: CoreUI 5.x, Redux, React Router HashRouter, Leaflet, Chart.js
- Portal: Tailwind CDN, vanilla JS + React (minimal deps)

## Project Structure

```
Ecogest/
├── Ecogest Backend/               # Shared REST API
│   ├── db.json                    # Seed data: tramites, denuncias, usuarios
│   ├── package.json
│   └── README.md
├── src/                           # Ecogest ERP — backoffice/admin app
│   ├── services/                  # Global cross-module services
│   │   ├── api.js                 # Shared fetch helper (http://localhost:4000)
│   │   ├── integracionService.js  # All GA↔RRHH communication + auto-audit logging
│   │   └── AuditLogService.js     # Immutable audit log (auditLogMinisterio)
│   ├── views/
│   │   ├── GestionAdministrativa/ # Backoffice ERP — admin modules
│   │   │   ├── AdminPanel.js
│   │   │   ├── BandejaAdministrativa/
│   │   │   ├── Tramites/                 # ✅ Consumes http://localhost:4000/tramites
│   │   │   ├── GestionDenuncias/  # ✅ Consumes http://localhost:4000/denuncias
│   │   │   ├── GestionPermisos/   # ⚠️ Implemented but not routed in routes.js/_nav.js
│   │   │   ├── GestionLicencias/  # ⚠️ Implemented but not routed in routes.js/_nav.js
│   │   │   ├── cuadrillas/
│   │   │   ├── Inventario/
│   │   │   ├── Proveedores/
│   │   │   └── SolicitudActivos/  # ⚠️ Implemented but not routed in routes.js/_nav.js
│   │   ├── RRHH/                  # Backoffice ERP — HR modules
│   │   │   ├── PanelRRHH.js
│   │   │   ├── Empleados/
│   │   │   ├── Expedientes/       # Digital employee files with grid/table toggle
│   │   │   ├── Solicitudes/
│   │   │   └── EstructuraOrg/     # ⚠️ Routed but missing from _nav.js sidebar
│   │   ├── usuarios/              # Citizen portal views embedded in ERP
│   │   │   ├── denuncias/         # Citizen complaint form
│   │   │   ├── MisDenuncias/      # Lists complaints from backend /denuncias
│   │   │   ├── MisTramites/       # Permit/license applications → backend /tramites
│   │   │   ├── perfilUsers/       # Citizen profile (MOCK, no persistence)
│   │   │   └── _shared/           # useToast, useConfirmModal, validations, Venezuela geo data
│   │   ├── Inicio/                # ERP dashboard landing page
│   │   └── pages/                 # Login, Register, 404, 500
│   ├── components/                # Global reusable components
│   ├── layout/                    # DefaultLayout (sidebar, header, content)
│   ├── routes.js                  # Lazy-loaded route definitions
│   ├── _nav.js                    # Sidebar navigation (CoreUI CNavGroup/CNavItem)
│   ├── store.js                   # Redux store (sidebarShow + theme only)
│   ├── scss/                      # CoreUI + custom styles
│   ├── leafletSetup.js            # Leaflet default marker fix
│   └── index.js                   # React root + Redux Provider + Leaflet init + RRHH migration
├── Ecogest Portal/                # Citizen-facing portal
│   ├── src/
│   │   ├── App.js                 # Manual hash router
│   │   ├── services/
│   │   │   ├── api.js             # Shared fetch helper (http://localhost:4000)
│   │   │   ├── denunciasService.js  # ✅ Consumes http://localhost:4000/denuncias
│   │   │   └── tramitesService.js   # ✅ Consumes http://localhost:4000/tramites
│   │   ├── views/
│   │   │   ├── Landing/
│   │   │   ├── Login/
│   │   │   ├── Dashboard/
│   │   │   ├── Tramites/          # List citizen permits/licenses from backend
│   │   │   ├── Denuncias/         # List citizen complaints from backend
│   │   │   └── Perfil/            # Citizen profile (reads useAuth)
│   │   └── hooks/                 # useAuth, useTheme
│   ├── main.js                    # Portal entry point
│   └── vite.config.mjs
├── analysis_ga_rrhh.md            # Authoritative Spanish module-structure reference
├── opencode.json                  # MCP config (stitch-mcp)
├── package.json
└── vite.config.mjs
```

## Entry Point & Router

- ERP: `src/index.js` → React root + Redux Provider → `src/App.js` → HashRouter + `DefaultLayout`
- Routes in `src/routes.js`, sidebar in `src/_nav.js`
- HashRouter means URLs look like `/#/Inicio`, `/#/listEmpleados`
- `migradorDatos.js` no longer runs at startup; RRHH data lives in the backend

## ⚠️ Routing Gotchas

- `GestionPermisos`, `GestionLicencias`, and `SolicitudActivos` are fully implemented but **not wired into `src/routes.js` or `src/_nav.js`**.
- `EstructuraOrg` has a route in `src/routes.js` but is **missing from `src/_nav.js`**.
- The citizen portal (`Ecogest Portal/`) routes `/inicio`, `/login`, `/dashboard`, `/tramites`, `/denuncias`, and `/perfil`.

## Service Layer ⚠️ CRITICAL

**Components and hooks MUST NEVER access localStorage directly.** All data access goes through services.

### Rules
- Every service is an **object literal** (no classes, no `_delay` simulation)
- Service filenames are **singular, camelCase**: `cuadrillaService.js`, NOT `cuadrillaServices.js`
- All service methods are **async** and return `{ success, data, error?, message? }`
- All service methods consume `http://localhost:4000` via the shared `api()` helper
- Each module has a `services/` directory importing its service, and a `hooks/` directory with custom hooks
- **Consumers MUST use `await`** when calling any service method

### Cross-Module Communication
- **GA ↔ RRHH**: all cross-module reads/writes go through `integracionService`
- `integracionService` auto-logs every cross-module write via `AuditLogService`
- `integracionService.crearEmpleadoDesdeBandeja()` creates employee + expediente atomically and transfers uploaded document `dataUrl`/`tamaño` into the expediente.

### Service Template
```js
import { api } from '../../../../services/api'

const PATH = '/collectionName'

async function obtenerTodos() {
  try {
    const data = await api(PATH)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e.message, data: [] }
  }
}

async function crear(datos) {
  try {
    const data = await api(PATH, { method: 'POST', body: JSON.stringify(datos) })
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

export const somethingService = { obtenerTodos, crear }
```

### All Services & Their Backend Endpoints

| Service | File | Backend Endpoint | Module |
|---|---|---|---|
| `empleadoService` | `RRHH/Empleados/services/` | `/empleados` | RRHH |
| `expedienteService` | `RRHH/Expedientes/services/` | `/expedientes` | RRHH |
| `solicitudService` | `RRHH/Solicitudes/services/` | `/solicitudes` | RRHH |
| `estructuraOrgService` | `RRHH/EstructuraOrg/services/` | `/estructuraOrg` | RRHH |
| `cuadrillaService` | `GestionAdministrativa/cuadrillas/services/` | `/cuadrillas` | GA |
| `tramitesService` | `GestionAdministrativa/Tramites/services/` | `/tramites` | GA + Portal |
| `denunciasService` | `GestionAdministrativa/GestionDenuncias/services/` | `/denuncias` | GA + Portal |
| `permisosService` | `GestionAdministrativa/GestionPermisos/services/` | `/permisos` | GA |
| `licenciasService` | `GestionAdministrativa/GestionLicencias/services/` | `/licencias` | GA |
| `inventarioService` | `GestionAdministrativa/Inventario/services/` | `/activos`, `/movimientos`, `/alertas` | GA |
| `proveedoresService` | `GestionAdministrativa/Proveedores/services/` | `/proveedores` | GA |
| `solicitudActivosService` | `GestionAdministrativa/SolicitudActivos/services/` | `/solicitudActivos`, `/bitacoraSolicitudes` | GA |
| `integracionService` | `src/services/` | (uses other services) | Global |
| `AuditLogService` | `src/services/` | `/auditLog` | Global |

### Citizen ↔ Admin Data Flow
- **Trámites**: ✅ **Fully integrated** — both ERP and Portal consume `http://localhost:4000/tramites`
- **Denuncias**: ✅ **Fully integrated** — both ERP and Portal consume `http://localhost:4000/denuncias` (single collection, `origen` field distinguishes source)

### API Client Convention
All services use a shared fetch helper. Example:
```js
const API_URL = 'http://localhost:4000'

async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}
```

## Visual Conventions

- **No `bg-light` / `bg-white` classes** — they corrupt the CoreUI theme.
- CoreUI `CBadge` pastel colors have poor contrast against the white `eco-card` background. In Expedientes, use solid inline-style badges instead.
- Use only the existing eco/minec color palette.

## Key Conventions

- **Components**: `export default` (PascalCase filenames)
- **Hooks**: Named exports (`export const useX = ...`), in `hooks/` directory per module
- **Services**: Named exports as object literal (`export const xService = { ... }`), in `services/` directory per module
- **Icons**: Import individually from `@coreui/icons`
- **No TypeScript** — plain `.js` with JSX (esbuild handles `.js` as JSX via `vite.config.mjs`)
- **Prettier** (`.prettierrc.js`): `semi: false`, `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100`

## Custom Shared Hooks

Always use these instead of native `alert`/`confirm`:
- `useToast()` — Toast notifications (`src/views/usuarios/_shared/useToast.js`)
- `useConfirmModal()` — Confirmation dialogs (`src/views/usuarios/_shared/useConfirmModal.js`)

## CoreUI Patterns

```jsx
import { CContainer, CCard, CCardBody, CButton, CModal } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
```

## Module-Specific Traps

- **Expedientes upload**: files must be converted to base64 `dataUrl` via `FileReader`; do not pass raw `File` objects into state or storage.
- **Expedientes sync**: `listExpedientes.js` auto-creates missing expediente folders per employee on mount.
- **`StepDocumentacion` onChange**: the parent only accepts a single array argument. Do not pass 3 arguments (e.g. `onChange={(e, fileList, docName) => ...}`). Receive the array and call `updateDocumentos(nuevoArray)`.
- **Perfil empleado → Expediente**: `perfilEmpleado.js` reads real expediente data via `expedienteService` and renders `ExpedienteVisorDigital.js`.

## Notes

- **No tests** — no test framework configured, no test scripts in `package.json`
- **HashRouter** — all ERP routes use hash-based routing (e.g., `/#/Inicio`, `/#/listEmpleados`)
- **Leaflet** — requires `src/leafletSetup.js` imported before app renders
- **Data migration** — `src/views/RRHH/_shared/migradorDatos.js` is disabled; data now lives in backend
- **Build output**: `build/` directory with relative base path `./` for static hosting
- **ESLint 9 flat config** — `eslint.config.mjs` with React + React Hooks + Prettier plugins
- **Dev server**: Vite at port 3000, `src/` path alias configured in `vite.config.mjs`
- **CI**: `.github/workflows/npm.yml` runs `npm install` + `npm run build` on Node 16/17/18
