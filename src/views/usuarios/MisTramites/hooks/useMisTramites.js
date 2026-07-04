import { useState, useCallback, useEffect } from 'react';
import { tramitesService } from '../../../GestionAdministrativa/Tramites/services/tramitesService';
import { ESTADOS_TRAMITE, TIPOS_TRAMITE } from '../../../GestionAdministrativa/Tramites/constants/tramitesConstants';

const SOLICITANTE_ID = 'CIUDADANO-001';

export const useMisTramites = () => {
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({});

  const cargarTramites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tramitesService.obtenerTramites();
      if (res.success) {
        const misTramites = res.data.filter(t => t.solicitanteId === SOLICITANTE_ID);
        setTramites(misTramites);

        setEstadisticas({
          total: misTramites.length,
          aprobados: misTramites.filter(t => t.estado === 'APROBADO').length,
          pendientes: misTramites.filter(t => ['REVISION', 'INSPECCION'].includes(t.estado)).length,
          rechazados: misTramites.filter(t => t.estado === 'RECHAZADO').length,
        });
      } else {
        setError(res.error || 'Error cargando trámites');
      }
    } catch (err) {
      setError('Error de conexión al cargar trámites');
      console.error('Error en useMisTramites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarTramites();
  }, [cargarTramites]);

  const crearTramite = useCallback(async (formData) => {
    try {
      const tipoPrefix = formData.tipo === TIPOS_TRAMITE.PERMISO ? 'PER' : 'LIC';
      const tramiteConId = {
        ...formData,
        id: `${tipoPrefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
        solicitanteId: SOLICITANTE_ID,
        estado: 'REVISION',
        fechaSolicitud: new Date().toISOString().split('T')[0],
        historial: [
          {
            estado: 'REVISION',
            fecha: new Date().toISOString(),
            usuario: 'Ciudadano',
            nota: 'Solicitud recibida desde Portal Ciudadano',
          },
        ],
      };
      const res = await tramitesService.crearTramite(tramiteConId);
      if (res.success) {
        await cargarTramites();
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: 'Error creando trámite' };
    }
  }, [cargarTramites]);

  const cancelarTramite = useCallback(async (id) => {
    try {
      const tramite = tramites.find(t => t.id === id);
      if (!tramite) return { success: false, error: 'Trámite no encontrado' };
      if (!['BORRADOR', 'REVISION'].includes(tramite.estado)) {
        return { success: false, error: 'Solo se pueden cancelar trámites en Borrador o Revisión' };
      }
      const res = await tramitesService.cambiarEstado(id, 'RECHAZADO', 'Ciudadano', 'Cancelado por el solicitante');
      if (res.success) {
        await cargarTramites();
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: 'Error cancelando trámite' };
    }
  }, [tramites, cargarTramites]);

  const recargar = useCallback(() => {
    cargarTramites();
  }, [cargarTramites]);

  return {
    tramites,
    loading,
    error,
    estadisticas,
    crearTramite,
    cancelarTramite,
    recargar,
  };
};
