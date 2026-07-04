import React, { useRef, useEffect } from 'react'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilGraph, cilReload } from '@coreui/icons'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

const PanelChart = ({ chartData, loading, onRefresh }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !chartData) return

    chart.options.plugins.legend.labels.color = getStyle('--cui-body-color')
    chart.options.scales.x.ticks.color = getStyle('--cui-body-color')
    chart.options.scales.y.ticks.color = getStyle('--cui-body-color')
    chart.update()
  }, [chartData])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#475569',
          padding: 20,
          usePointStyle: true,
          font: { family: "'Inter', sans-serif", weight: '500' }
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: "'Inter', sans-serif" } },
        grid: { color: 'rgba(0,0,0,0.03)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#64748b', stepSize: 1, font: { family: "'Inter', sans-serif" } },
        grid: { color: 'rgba(0,0,0,0.03)' },
      },
    },
  }

  return (
    <div 
      className="exp-card mb-4 bg-white" 
      style={{ 
        borderRadius: '24px', 
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        border: '1px solid #f1f5f9'
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h5 className="fw-bolder mb-0 d-flex align-items-center" style={{ color: '#1e293b' }}>
          <div 
            className="d-flex align-items-center justify-content-center rounded-circle me-3" 
            style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
          >
            <CIcon icon={cilGraph} size="sm" />
          </div>
          Estadísticas de RRHH
        </h5>
        <div className="d-flex gap-3 align-items-center">
          <span className="badge rounded-pill fw-medium" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.5em 1em' }}>
            {new Date().toLocaleDateString('es-VE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <CButton
            color="light"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="border text-secondary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px' }}
          >
            <CIcon icon={cilReload} />
          </CButton>
        </div>
      </div>

      <div className="rounded-4 p-3" style={{ height: '320px', background: '#f8fafc' }}>
        {loading ? (
          <div className="d-flex align-items-center justify-content-center h-100 text-muted fw-medium">
            <div
              className="spinner-border text-primary me-3"
              role="status"
              style={{ width: '1.5rem', height: '1.5rem' }}
            >
              <span className="visually-hidden">Cargando...</span>
            </div>
            Cargando estadísticas...
          </div>
        ) : chartData ? (
          <CChartLine type="line" data={chartData} options={chartOptions} ref={chartRef} />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100 text-muted fw-medium">
            Sin datos disponibles
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelChart
