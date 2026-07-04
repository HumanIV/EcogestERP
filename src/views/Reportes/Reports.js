    /** PANEL DE REPORTES — DISEÑO CORPORATIVO **/

    import React, { useState, useEffect, useRef } from 'react'
    import {
    CButton,
    CCard,
    CCardBody,
    CCardFooter,
    CContainer,
    CCol,
    CRow,
    CWidgetStatsA,
    CDropdown,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CForm,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CTable,
    CTableBody,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CTableDataCell,
    } from '@coreui/react'

    import { CChartBar, CChartLine } from '@coreui/react-chartjs'
    import CIcon from '@coreui/icons-react'
    import { cilArrowTop, cilOptions, cilMagnifyingGlass, cilCloudDownload } from '@coreui/icons'
    import { getStyle } from '@coreui/utils'

    export const ReportesPanel = () => {
    const [search, setSearch] = useState('')
    const [tipoReporte, setTipoReporte] = useState('')
    const lineChartRef = useRef(null)

    const tablaReportes = [
        { id: 1, nombre: 'Reporte de Asistencia', fecha: '2025-01-12', tipo: 'RRHH' },
        { id: 2, nombre: 'Gastos Mensuales', fecha: '2025-01-20', tipo: 'Administrativo' },
        { id: 3, nombre: 'Solicitudes Procesadas', fecha: '2025-01-25', tipo: 'Administrativo' },
    ]

    useEffect(() => {
        const chart = lineChartRef.current
        if (!chart) return

        chart.options.plugins.legend.labels.color = getStyle('--cui-body-color')
        chart.options.scales.x.ticks.color = getStyle('--cui-body-color')
        chart.options.scales.y.ticks.color = getStyle('--cui-body-color')
        chart.update()
    }, [])

    const lineChartData = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
        {
            label: 'Reportes Generados',
            borderColor: 'rgba(16, 255, 124, 1)',
            backgroundColor: 'rgba(16,255,124,0.20)',
            data: [12, 18, 15, 20, 17, 22],
            fill: true,
            tension: 0.4,
        },
        ],
    }

    const barChartData = {
        labels: ['RRHH', 'Administrativos', 'Financieros', 'Académicos'],
        datasets: [
        {
            label: 'Cantidad',
            backgroundColor: [
            'rgba(54,162,235,0.7)',
            'rgba(255,159,64,0.7)',
            'rgba(75,192,192,0.7)',
            'rgba(255,99,132,0.7)',
            ],
            data: [14, 9, 7, 5],
        },
        ],
    }

    return (
        <>
        <h1 className="mb-4 fw-bold" style={{ letterSpacing: '1px' }}>
            Panel de Reportes
        </h1>

        <CContainer>

            {/* WIDGETS SUPERIORES */}
            <CRow className="mb-4 gy-4">
            <CCol sm={6} md={4}>
                <CWidgetStatsA
                color="primary"
                value={
                    <>
                    45{' '}
                    <span className="fs-6 fw-normal">
                        (+8% <CIcon icon={cilArrowTop} />)
                    </span>
                    </>
                }
                title="Reportes Generados Este Mes"
                className="shadow-sm"
                />
            </CCol>

            <CCol sm={6} md={4}>
                <CWidgetStatsA
                color="info"
                value="12"
                title="Reportes de RRHH"
                className="shadow-sm"
                />
            </CCol>

            <CCol sm={6} md={4}>
                <CWidgetStatsA
                color="warning"
                value="9"
                title="Reportes Administrativos"
                className="shadow-sm"
                />
            </CCol>
            </CRow>

            {/* GRÁFICOS */}
            <CRow className="gy-4">

            {/* Línea */}
            <CCol md={7}>
                <CCard className="shadow-sm" style={{ borderRadius: '16px' }}>
                <CCardBody>
                    <h5 className="fw-bold mb-3">Evolución de Reportes Mensuales</h5>
                    <CChartLine
                    data={lineChartData}
                    ref={lineChartRef}
                    style={{ height: '300px' }}
                    />
                </CCardBody>
                </CCard>
            </CCol>

            {/* Barras */}
            <CCol md={5}>
                <CCard className="shadow-sm" style={{ borderRadius: '16px' }}>
                <CCardBody>
                    <h5 className="fw-bold mb-3">Reportes por Categoría</h5>
                    <CChartBar data={barChartData} style={{ height: '300px' }} />
                </CCardBody>
                </CCard>
            </CCol>
            </CRow>

            {/* FILTROS Y TABLA */}
            <CCard className="mt-4 shadow-sm" style={{ borderRadius: '16px' }}>
            <CCardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold">Listado de Reportes</h4>

                <CDropdown>
                    <CDropdownToggle color="primary" className="px-4">
                    Descargar Reporte
                    </CDropdownToggle>
                    <CDropdownMenu>
                    <CDropdownItem>Exportar PDF</CDropdownItem>
                    <CDropdownItem>Exportar Excel</CDropdownItem>
                    </CDropdownMenu>
                </CDropdown>
                </div>

                <CForm className="mb-4">
                <CRow className="g-3">
                    <CCol xs={12} md={4}>
                    <CFormLabel>Buscar reporte</CFormLabel>
                    <CFormInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar..."
                        className="shadow-sm"
                    />
                    </CCol>

                    <CCol xs={12} md={4}>
                    <CFormLabel>Tipo de Reporte</CFormLabel>
                    <CFormSelect
                        value={tipoReporte}
                        onChange={(e) => setTipoReporte(e.target.value)}
                        className="shadow-sm"
                    >
                        <option value="">Todos</option>
                        <option value="RRHH">RRHH</option>
                        <option value="Administrativo">Administrativo</option>
                    </CFormSelect>
                    </CCol>

                    <CCol xs={12} md={4}>
                    <CButton
                        color="secondary"
                        className="w-100 mt-4 shadow-sm"
                    >
                        Filtrar <CIcon icon={cilMagnifyingGlass} className="ms-2" />
                    </CButton>
                    </CCol>
                </CRow>
                </CForm>

                {/* TABLA */}
                <CTable hover responsive className="shadow-sm">
                <CTableHead>
                    <CTableRow style={{ background: 'rgba(0,0,0,0.05)' }}>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Nombre del Reporte</CTableHeaderCell>
                    <CTableHeaderCell>Fecha</CTableHeaderCell>
                    <CTableHeaderCell>Tipo</CTableHeaderCell>
                    <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>

                <CTableBody>
                    {tablaReportes.map((r) => (
                    <CTableRow key={r.id}>
                        <CTableDataCell>{r.id}</CTableDataCell>
                        <CTableDataCell>{r.nombre}</CTableDataCell>
                        <CTableDataCell>{r.fecha}</CTableDataCell>
                        <CTableDataCell>
                        <span className="badge bg-primary">{r.tipo}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                        <CButton color="primary" size="sm" className="me-2">
                            Descargar <CIcon icon={cilCloudDownload} className="ms-2" />
                        </CButton>

                        <CButton color="info" size="sm">
                            Opciones <CIcon icon={cilOptions} className="ms-2" />
                        </CButton>
                        </CTableDataCell>
                    </CTableRow>
                    ))}
                </CTableBody>
                </CTable>
            </CCardBody>

            <CCardFooter className="text-center fw-semibold py-3">
                Mostrando {tablaReportes.length} reportes
            </CCardFooter>
            </CCard>
        </CContainer>
        </>
    )
    }

    export default ReportesPanel
