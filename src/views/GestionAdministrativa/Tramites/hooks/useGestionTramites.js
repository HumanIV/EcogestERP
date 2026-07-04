import { useState, useCallback, useEffect } from 'react';
import { tramitesService } from '../services/tramitesService';

const useGestionTramites = (filtros = {}) => {
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
        setTramites(res.data);
        const resStats = await tramitesService.obtenerEstadisticas();
        if (resStats.success) setEstadisticas(resStats.data);
      } else {
        setError(res.error || 'Error cargando trámites');
      }
    } catch (err) {
      setError('Error de conexión al cargar trámites');
      console.error('Error en useGestionTramites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarTramites();
  }, [cargarTramites]);

  const crearTramite = useCallback(async (tramiteData) => {
    try {
      const res = await tramitesService.crearTramite(tramiteData);
      if (res.success) {
        await cargarTramites();
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: 'Error creando trámite' };
    }
  }, [cargarTramites]);

  const actualizarTramite = useCallback(async (id, datosActualizados) => {
    try {
      const res = await tramitesService.actualizarTramite(id, datosActualizados);
      if (res.success) {
        await cargarTramites();
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: 'Error actualizando trámite' };
    }
  }, [cargarTramites]);

  const eliminarTramite = useCallback(async (id) => {
    try {
      const res = await tramitesService.eliminarTramite(id);
      if (res.success) {
        await cargarTramites();
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: 'Error eliminando trámite' };
    }
  }, [cargarTramites]);

  const cambiarEstado = useCallback(async (id, nuevoEstado, usuario = 'Sistema', nota = '') => {
    try {
      const res = await tramitesService.cambiarEstado(id, nuevoEstado, usuario, nota);
      if (res.success) {
        await cargarTramites();
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: 'Error cambiando estado' };
    }
  }, [cargarTramites]);

  const asignarInspector = useCallback(async (id, inspectorId, inspectorNombre) => {
    try {
      const res = await tramitesService.actualizarTramite(id, {
        inspectorId,
        inspectorNombre,
      });
      if (res.success) {
        await cambiarEstado(id, 'INSPECCION', 'Sistema', `Inspector ${inspectorNombre} asignado`);
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: 'Error asignando inspector' };
    }
  }, [cargarTramites, cambiarEstado]);

  const exportarReporte = useCallback((filtrosExport = {}) => {
    try {
      let data = [...tramites];
      if (filtrosExport.tipo && filtrosExport.tipo !== 'todos') {
        data = data.filter(t => t.tipo === filtrosExport.tipo);
      }
      if (filtrosExport.estado && filtrosExport.estado !== 'todos') {
        data = data.filter(t => t.estado === filtrosExport.estado);
      }

      const headers = ['ID', 'Tipo', 'Subtipo', 'Solicitante', 'Cédula/RIF', 'Estado', 'Fecha Solicitud', 'Inspector', 'Municipio'];
      const rows = data.map(t => [
        t.id, t.tipo, t.subtipo, t.solicitante, t.cedulaRif, t.estado, t.fechaSolicitud, t.inspectorNombre || 'Sin asignar', t.municipio
      ]);
      const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tramites_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error exportando reporte' };
    }
  }, [tramites]);

  const refreshData = useCallback(() => {
    cargarTramites();
  }, [cargarTramites]);

  const tramitesFiltrados = tramites.filter(t => {
    if (filtros.tipo && filtros.tipo !== 'todos' && t.tipo !== filtros.tipo) return false;
    if (filtros.estado && filtros.estado !== 'todos' && t.estado !== filtros.estado) return false;
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      const match = (
        t.solicitante?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.cedulaRif?.toLowerCase().includes(q) ||
        t.subtipo?.toLowerCase().includes(q)
      );
      if (!match) return false;
    }
    return true;
  });

  return {
    tramites: tramitesFiltrados,
    todosTramites: tramites,
    estadisticas,
    loading,
    error,
    crearTramite,
    actualizarTramite,
    eliminarTramite,
    cambiarEstado,
    asignarInspector,
    exportarReporte,
    refreshData,
  };
};

export default useGestionTramites;
