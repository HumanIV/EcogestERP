import React from 'react'
import { CRow, CCol } from '@coreui/react'
import SolicitudesCard from './SolicitudesCard'
import RrhhEmptyState from '../../_shared/RrhhEmptyState'
import { cilInbox } from '@coreui/icons'

const COLUMNS = [
  { id: 'Pendiente', label: 'Pendientes', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', borderTop: '#f59e0b' },
  { id: 'En revisión', label: 'En Revisión', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.05)', borderTop: '#8b5cf6' },
  { id: 'Aprobada', label: 'Aprobadas', color: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', borderTop: '#10b981' },
  { id: 'Rechazada', label: 'Rechazadas', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.05)', borderTop: '#ef4444' },
]

const SolicitudesBoard = ({ data, onView }) => {
  // Agrupar datos por estado
  const groupedData = COLUMNS.reduce((acc, col) => {
    acc[col.id] = data.filter((item) => item.estado === col.id)
    return acc
  }, {})

  if (data.length === 0) {
    return (
      <RrhhEmptyState
        icon={cilInbox}
        title="No hay solicitudes en el tablero"
        message="Ajusta los filtros o intenta con otra búsqueda."
      />
    )
  }

  return (
    <CRow className="g-4 align-items-stretch mb-4">
      {COLUMNS.map((col) => (
        <CCol xs={12} md={6} xl={3} key={col.id}>
          <div 
            className="h-100 d-flex flex-column" 
            style={{ 
              backgroundColor: col.bg,
              borderRadius: '16px',
              borderTop: `4px solid ${col.borderTop}`,
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
            }}
          >
            {/* Header de la columna */}
            <div className="p-4 pb-2 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bolder" style={{ color: col.color, fontSize: '1.1rem' }}>
                {col.label}
              </h6>
              <span 
                className="badge rounded-pill fw-bold" 
                style={{ 
                  backgroundColor: 'white', 
                  color: col.color, 
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  padding: '0.4em 0.8em',
                  fontSize: '0.85rem'
                }}
              >
                {groupedData[col.id].length}
              </span>
            </div>
            
            {/* Contenido de la columna (Tarjetas) */}
            <div 
              className="p-3 flex-grow-1" 
              style={{ 
                maxHeight: 'calc(100vh - 300px)', 
                minHeight: '400px',
                overflowY: 'auto',
                scrollbarWidth: 'thin'
              }}
            >
              {groupedData[col.id].length > 0 ? (
                groupedData[col.id].map((solicitud) => (
                  <SolicitudesCard key={solicitud.id} solicitud={solicitud} onView={onView} />
                ))
              ) : (
                <div 
                  className="text-center py-5 text-muted fw-medium d-flex flex-column align-items-center justify-content-center h-100" 
                  style={{ opacity: 0.6, border: '2px dashed rgba(0,0,0,0.05)', borderRadius: '12px' }}
                >
                  No hay solicitudes
                </div>
              )}
            </div>
          </div>
        </CCol>
      ))}
    </CRow>
  )
}

export default SolicitudesBoard
