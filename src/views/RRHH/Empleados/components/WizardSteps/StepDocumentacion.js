import React, { useRef } from 'react'
import { CCard, CCardBody, CButton, CListGroup, CListGroupItem, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilFile, cilTrash } from '@coreui/icons'

const StepDocumentacion = ({ data, onChange }) => {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const nuevoDoc = {
        docId: `doc_${Date.now()}`,
        nombreArchivo: file.name,
        tipo: 'Requisito Legal',
        fechaCarga: new Date().toISOString().split('T')[0],
        tamañoBytes: file.size,
        dataUrl: reader.result,
      }
      onChange([...data, nuevoDoc])
    }
    reader.onerror = () => {
      console.error('Error leyendo archivo en wizard')
    }
    reader.readAsDataURL(file)
  }

  const removeDoc = (idToRemove) => {
    const filtrados = data.filter((d) => d.docId !== idToRemove)
    onChange(filtrados)
  }

  return (
    <div className="fade-in">
      <h5 className="mb-4 text-eco">Apertura de Expediente Digital</h5>
      <p className="text-muted">
        Adjunte los documentos obligatorios (Cédula, RIF, Títulos) en formato PDF. Estos se
        vincularán atómicamente al crear el perfil.
      </p>

      <CCard
        className="mb-4 bg-body-tertiary text-center"
        style={{ border: '2px dashed var(--cui-border-color)' }}
      >
        <CCardBody className="py-5">
          <CIcon icon={cilCloudUpload} size="3xl" className="text-muted mb-3" />
          <h6>Arrastre aquí los archivos PDF</h6>
          <p className="small text-muted mb-3">
            O haga clic para seleccionarlos desde su computadora (Máx 5MB)
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            style={{ display: 'none' }}
          />
          <CButton color="success" onClick={() => fileInputRef.current.click()}>
            Explorar Archivos
          </CButton>
        </CCardBody>
      </CCard>

      {data.length > 0 && (
        <CListGroup>
          {data.map((doc) => (
            <CListGroupItem
              key={doc.docId}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <CIcon icon={cilFile} className="text-danger me-3" />
                <span className="fw-bold">{doc.nombreArchivo}</span>
                <CBadge color="info" shape="rounded-pill" className="ms-2">
                  {doc.tipo}
                </CBadge>
                <div className="small text-muted mt-1">
                  {(doc.tamañoBytes / 1024).toFixed(1)} KB - Subido hoy
                </div>
              </div>
              <CButton color="danger" size="sm" onClick={() => removeDoc(doc.docId)}>
                <CIcon icon={cilTrash} />
              </CButton>
            </CListGroupItem>
          ))}
        </CListGroup>
      )}
    </div>
  )
}

export default StepDocumentacion
