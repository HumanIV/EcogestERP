import { useState, useCallback } from 'react';

const STORAGE_KEY = 'actividadCuadrillas';

const useActividadCuadrillas = () => {
  const [actividad, setActividad] = useState([]);

  const cargarActividad = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setActividad(raw ? JSON.parse(raw) : []);
    } catch {
      setActividad([]);
    }
  }, []);

  const agregarEvento = useCallback((cuadrillaId, tipo, detalle) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const logs = raw ? JSON.parse(raw) : [];
      const evento = {
        id: Date.now() + Math.random(),
        cuadrillaId,
        tipo,
        detalle,
        fecha: new Date().toISOString(),
      };
      logs.unshift(evento);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      setActividad(logs);
    } catch (e) {
      console.error('Error guardando actividad:', e);
    }
  }, []);

  const obtenerActividadPorCuadrilla = useCallback((cuadrillaId) => {
    return actividad.filter(a => a.cuadrillaId === cuadrillaId);
  }, [actividad]);

  return { actividad, cargarActividad, agregarEvento, obtenerActividadPorCuadrilla };
};

export default useActividadCuadrillas;