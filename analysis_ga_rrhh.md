# Análisis de Módulos: Gestión Administrativa y Recursos Humanos

Este documento presenta un análisis de la estructura y organización de los dos módulos principales del ERP (Backoffice): **Gestión Administrativa (GA)** y **Recursos Humanos (RRHH)**. El sistema utiliza React (sin TypeScript), CoreUI, y mantiene un flujo de datos centralizado a través de servicios y `localStorage`.

---

## 1. Gestión Administrativa (`src/views/GestionAdministrativa`)

Este módulo funciona como el núcleo del ERP administrativo, gestionando los procesos operativos, inventario y solicitudes. Consta de 9 submódulos principales y un panel de control agregado.

### Componentes Principales:
*   **`AdminPanel.js`**: El Dashboard principal que consolida y lee información de todos los servicios administrativos y de RRHH para presentar una vista general.
*   **`BandejaAdministrativa/`**: Bandeja de entrada unificada para gestionar flujos de trabajo (Trámites, Solicitud de Activos y Solicitudes de RRHH).
*   **`Tramites/`**: Seguimiento unificado de procedimientos de permisos y licencias. Comparte el almacenamiento `tramitesMinisterio` con el portal ciudadano.
*   **`GestionDenuncias/`**, **`GestionPermisos/`**, **`GestionLicencias/`**: Módulos para la gestión del lado del administrador de quejas ambientales, permisos y licencias respectivamente.
*   **`cuadrillas/`**: Gestión de equipos/cuadrillas de trabajo en campo (Servicio: `cuadrillasMinisterio`).
*   **`Inventario/`**: Seguimiento de activos e inventario general (Servicio: `inventarioMinisterio`).
*   **`Proveedores/`**: Gestión de información de proveedores (Servicio: `proveedoresMinisterio`).
*   **`SolicitudActivos/`**: Centro de solicitudes de recursos/activos (Servicio: `solicitudesActivos`).

---

## 2. Recursos Humanos (`src/views/RRHH`)

Este módulo se encarga de todo el ciclo de vida del personal, su estructura organizativa y las solicitudes internas de los empleados.

### Componentes Principales:
*   **`PanelRRHH.js`**: El Dashboard específico para los indicadores y accesos directos de Recursos Humanos.
*   **`Empleados/`**: Operaciones CRUD y perfiles detallados de los empleados (Servicio: `empleadosMinisterio`).
*   **`Expedientes/`**: Gestión documental y de expedientes de cada empleado (Servicio: `expedientesMinisterio`).
*   **`Solicitudes/`**: Gestión de requerimientos del personal como vacaciones, permisos, y certificados (Servicio: `solicitudesRRHHMinisterio`).
*   **`EstructuraOrg/`**: Gestión del organigrama institucional y las plazas de trabajo (Servicio: `estructuraOrgMinisterio`).
*   **`_shared/`**: Contiene utilidades compartidas, destacando el script de migración (`migradorDatos.js`) que normaliza la información de RRHH (vacaciones, correos, salarios) al iniciar el sistema.

---

## 3. Integración y Flujo de Datos (GA ↔ RRHH)

La comunicación entre estos dos módulos es crítica y se rige por las siguientes reglas arquitectónicas:

1.  **Cero Acceso Directo**: Los componentes no pueden acceder directamente a `localStorage`. Todo el acceso a datos debe pasar por la capa de servicios (`src/services/`).
2.  **`integracionService.js`**: Toda lectura o escritura que cruce las fronteras entre Gestión Administrativa y RRHH (ej. asignar un empleado de RRHH a una cuadrilla en GA) *debe* realizarse a través del `integracionService`.
3.  **Auditoría Automática**: El `integracionService` registra automáticamente cualquier operación de escritura inter-módulo utilizando el `AuditLogService` (`auditLogMinisterio`), asegurando la trazabilidad de las acciones.
