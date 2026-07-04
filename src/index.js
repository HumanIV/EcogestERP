import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'
import 'bootstrap/dist/css/bootstrap.min.css'

// Inicialización global de Leaflet (iconos de marcadores)
import './leafletSetup'

// Migración de datos RRHH deshabilitada — datos ahora en backend
// import { ejecutarMigracionRRHH } from './views/RRHH/_shared/migradorDatos'
// ejecutarMigracionRRHH()

import App from './App'
import store from './store'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
