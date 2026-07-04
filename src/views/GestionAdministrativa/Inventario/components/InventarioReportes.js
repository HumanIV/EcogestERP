import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilGraph, cilStorage, cilPeople, cilCalculator, cilPrint, 
  cilCloudDownload, cilCheckCircle, cilFile, cilList, cilCog 
} from '@coreui/icons';
import { formatearMoneda } from '../utils/inventarioUtils';
import { CATEGORIAS } from '../constants/inventarioConstants';

const InventarioReportes = ({ activos, movimientos, metricas }) => {
  const [reporteGenerado, setReporteGenerado] = useState(null);
  const [generandoId, setGenerandoId] = useState(null);
  const [error, setError] = useState(null);

  const reportesDisponibles = [
    {
      id: 'inventario_general',
      icon: cilStorage,
      color: 'success',
      titulo: 'Inventario General',
      descripcion: 'Estado actual de todos los activos',
      btnText: 'Generar Reporte'
    },
    {
      id: 'valuacion',
      icon: cilCalculator,
      color: 'warning',
      titulo: 'Valuación',
      descripcion: 'Valor económico del patrimonio',
      btnText: 'Generar Reporte'
    },
    {
      id: 'movimientos',
      icon: cilGraph,
      color: 'info',
      titulo: 'Reporte de Movimientos',
      descripcion: 'Historial completo de transacciones',
      btnText: 'Generar Reporte'
    }
  ];

  const generarReporteData = (tipo) => {
    switch (tipo) {
      case 'inventario_general':
        return {
          titulo: 'Inventario General',
          subtitulo: 'Estado actual de todos los activos registrados',
          headers: ['Código', 'Nombre', 'Categoría', 'Ubicación', 'Estado', 'Valor Actual'],
          data: activos.map(a => ({
            codigo: a.codigo,
            nombre: a.nombre,
            categoria: a.categoria,
            ubicacion: a.ubicacion,
            estado: a.estado,
            valor: `$${a.valorActual.toLocaleString()}`
          }))
        };
      case 'valuacion':
        return {
          titulo: 'Valuación de Activos',
          subtitulo: 'Análisis de valor y depreciación por categoría',
          headers: ['Categoría', 'Cantidad', 'Valor Compra', 'Valor Actual', 'Depreciación'],
          data: CATEGORIAS.map(cat => {
            const catActivos = activos.filter(a => a.categoria === cat.nombre);
            const valorCompra = catActivos.reduce((sum, a) => sum + a.valorCompra, 0);
            const valorActual = catActivos.reduce((sum, a) => sum + a.valorActual, 0);
            const depreciacion = valorCompra - valorActual;
            return {
              categoria: cat.nombre,
              cantidad: catActivos.length,
              compra: `$${valorCompra.toLocaleString()}`,
              actual: `$${valorActual.toLocaleString()}`,
              depreciacion: `$${depreciacion.toLocaleString()}`
            };
          }).filter(row => row.cantidad > 0)
        };
      case 'movimientos':
        return {
          titulo: 'Historial de Movimientos',
          subtitulo: 'Registro de todas las transacciones',
          headers: ['Fecha', 'Tipo', 'Activo', 'Usuario', 'Motivo'],
          data: movimientos.map(m => ({
            fecha: m.fecha.split(' ')[0],
            tipo: m.tipo,
            activo: m.activoNombre || m.activo,
            usuario: m.usuario,
            motivo: m.motivo
          }))
        };
      default:
        return { titulo: '', subtitulo: '', headers: [], data: [] };
    }
  };

  const handleGenerar = async (reporteId) => {
    setGenerandoId(reporteId);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generarReporteData(reporteId);
      setReporteGenerado({ id: reporteId, ...data });
    } catch (err) {
      setError('Error al generar el reporte');
    } finally {
      setGenerandoId(null);
    }
  };

  const handleExportarCSV = () => {
    if (!reporteGenerado || !reporteGenerado.data.length) return;

    let csvContent = '\uFEFF';
    csvContent += reporteGenerado.titulo + '\n';
    csvContent += reporteGenerado.subtitulo + '\n\n';
    csvContent += reporteGenerado.headers.join(';') + '\n';
    reporteGenerado.data.forEach(row => {
      csvContent += Object.values(row).join(';') + '\n';
    });

    const fecha = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
    link.download = `${reporteGenerado.id}_${fecha}.csv`;
    link.click();
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <>
      <CRow className="mb-4 align-items-center">
        <CCol xs={12} md={6}>
          <h5 className="mb-0 fw-bold">
            <CIcon icon={cilGraph} className="me-2 text-eco" />
            Reportes Institucionales
          </h5>
          <p className="text-muted mb-0">Seleccione un tipo de reporte y genere la consulta</p>
        </CCol>
      </CRow>

      <CRow className="g-4 mb-4">
        {reportesDisponibles.map((reporte) => {
          const isActive = reporteGenerado?.id === reporte.id;
          const isGenerating = generandoId === reporte.id;
          
          return (
            <CCol xs={12} sm={6} lg={3} key={reporte.id}>
              <CCard 
                className={`h-100 eco-card ${isActive ? 'border-success border-2' : ''}`}
                style={{ transition: 'all 0.3s ease' }}
              >
                <CCardBody className="d-flex flex-column text-center">
                  <div className={`bg-${reporte.color}-subtle rounded-circle d-inline-flex p-3 mb-3 mx-auto`}>
                    <CIcon icon={reporte.icon} size="2xl" className={`text-${reporte.color}`} />
                  </div>
                  <h6 className="fw-bold mb-1">{reporte.titulo}</h6>
                  <p className="text-muted small mb-3 flex-grow-1">{reporte.descripcion}</p>
                  
                  {isActive ? (
                    <CButton 
                      color={reporte.color} 
                      className="mt-auto"
                      disabled
                    >
                      <CIcon icon={cilCheckCircle} className="me-1" />
                      Generado
                    </CButton>
                  ) : (
                    <CButton 
                      color={reporte.color}
                      variant="outline"
                      className="mt-auto"
                      onClick={() => handleGenerar(reporte.id)}
                      disabled={generandoId !== null}
                    >
                      {isGenerating ? (
                        <>
                          <CSpinner size="sm" className="me-1" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilCog} className="me-1" />
                          {reporte.btnText}
                        </>
                      )}
                    </CButton>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          );
        })}
      </CRow>

      {error && (
        <CAlert color="danger" className="mb-4">
          <CIcon icon={cilFile} className="me-2" />
          {error}
        </CAlert>
      )}

      {reporteGenerado ? (
        <CCard className="eco-card">
          <CCardHeader className="eco-card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-bold">
                  <CIcon icon={reportesDisponibles.find(r => r.id === reporteGenerado.id)?.icon} className="me-2 text-eco" />
                  {reporteGenerado.titulo}
                </h5>
                <small className="text-muted">{reporteGenerado.subtitulo}</small>
              </div>
              <CBadge color="success" className="px-3 py-2">
                {reporteGenerado.data.length} registros
              </CBadge>
            </div>
          </CCardHeader>
          <CCardBody className="p-0">
            <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
              <CTable hover bordered className="mb-0">
                <CTableHead className="position-sticky top-0 bg-eco-soft">
                  <CTableRow>
                    {reporteGenerado.headers.map((header, i) => (
                      <CTableHeaderCell key={i} className="fw-bold text-center">{header}</CTableHeaderCell>
                    ))}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {reporteGenerado.data.map((row, rowIndex) => (
                    <CTableRow key={rowIndex} className={rowIndex % 2 === 0 ? '' : 'eco-surface'}>
                      {Object.values(row).map((cell, cellIndex) => {
                        const isLastCol = cellIndex === Object.keys(row).length - 1;
                        return (
                          <CTableDataCell 
                            key={cellIndex}
                            className={isLastCol ? 'text-end fw-semibold text-eco' : ''}
                          >
                            {cell}
                          </CTableDataCell>
                        );
                      })}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
            <div className="p-3 border-top eco-surface">
              <div className="d-flex justify-content-end gap-2">
                <CButton 
                  color="success" 
                  className="btn-eco-outline-success"
                  onClick={handleExportarCSV}
                >
                  <CIcon icon={cilCloudDownload} className="me-1" />
                  Exportar CSV
                </CButton>
                <CButton 
                  color="primary"
                  className="btn-eco-outline-primary"
                  onClick={handleImprimir}
                >
                  <CIcon icon={cilPrint} className="me-1" />
                  Imprimir
                </CButton>
              </div>
            </div>
          </CCardBody>
        </CCard>
      ) : (
        <CCard className="eco-card">
          <CCardBody className="text-center py-5">
            <CIcon icon={cilFile} size="4xl" className="text-muted mb-3" />
            <h6 className="text-muted">Seleccione un tipo de reporte</h6>
            <p className="text-muted small">Haga clic en "Generar Reporte" en una de las opciones anteriores</p>
          </CCardBody>
        </CCard>
      )}
    </>
  );
};

export default InventarioReportes;