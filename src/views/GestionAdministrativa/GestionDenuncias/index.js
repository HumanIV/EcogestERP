// Exportación principal del módulo de gestión
import GestionDenuncias from './gestionDenuncias';

// Components
export { default as MapaCalor } from './components/mapaCalor';
export { default as DashboardEstadisticas } from './components/dashBoardEstadisticas';
export { default as ListaGestion } from './components/listaGestion';
export { default as DetalleGestionModal } from './components/detallesGestionModal';

// Hooks
export { default as useGestionDenuncias } from './hooks/useGestionDenuncias';
export { default as useEstadisticas } from './hooks/useEstadisticas';
export { default as useMapaCalor } from './hooks/useMapaCalor';

// Utils
export * from './utils/gestionUtils';
export * from './utils/mapaUtils';
export * from './utils/analiticasUtils';

// Constants
export * from './constants/gestionConstants';

// Services
export * from './services/denunciasService';

// Componente principal
export default GestionDenuncias;