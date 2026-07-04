import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormSelect,
  CFormLabel,
  CAlert,
  CListGroup,
  CListGroupItem,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilFile, cilDescription, cilImage, cilX } from '@coreui/icons'
import { TIPOS_DOCUMENTO } from '../constants/expedientesConstants'

const ExpedientesModalUpload = ({ visible, onClose, onUpload, expediente, empleado }) => {
  const [fileUpload, setFileUpload] = useState(null)
  const [tipoDoc, setTipoDoc] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }
  const handleDragLeave = () => setDragOver(false)
  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) setFileUpload(e.dataTransfer.files[0])
  }
  const handleFileSelect = (e) => setFileUpload(e.target.files[0])

  const handleUpload = async () => {
    if (!fileUpload || !tipoDoc || !expediente) return
    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = async (event) => {
      await onUpload(expediente.id, {
        nombre: fileUpload.name,
        tipo: tipoDoc,
        tamaño: `${(fileUpload.size / (1024 * 1024)).toFixed(1)} MB`,
        dataUrl: event.target.result,
      })
      setIsUploading(false)
      setFileUpload(null)
      setTipoDoc('')
      onClose()
    }
    reader.onerror = () => {
      setIsUploading(false)
      console.error('Error leyendo archivo')
    }
    reader.readAsDataURL(fileUpload)
  }

  const handleClose = () => {
    setFileUpload(null)
    setTipoDoc('')
    setDragOver(false)
    onClose()
  }

  const iconoPorTipo = (nombre) => {
    const n = nombre.toLowerCase()
    if (n.includes('pdf')) return <CIcon icon={cilDescription} size="lg" className="text-danger" />
    if (n.includes('png') || n.includes('jpg') || n.includes('jpeg'))
      return <CIcon icon={cilImage} size="lg" className="text-success" />
    return <CIcon icon={cilFile} size="lg" className="text-secondary" />
  }

  return (
    <CModal visible={visible} onClose={handleClose} size="lg" alignment="center" className="border-0">
      <CModalHeader closeButton className="border-0 pb-0" style={{ background: '#f8f9fa' }}>
        <CModalTitle className="fw-bolder text-dark d-flex align-items-center">
          <div className="p-2 bg-success bg-opacity-10 rounded me-3 text-success">
            <CIcon icon={cilCloudUpload} size="lg" />
          </div>
          Subir Documento
        </CModalTitle>
      </CModalHeader>
      
      <CModalBody className="p-4 bg-white">
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #10b981, #047857)',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {empleado?.nombre?.charAt(0) || '?'}
          </div>
          <div>
            <div className="fw-bold text-dark">{empleado?.nombre || 'Empleado'} {empleado?.apellidos || ''}</div>
            <div className="text-muted small">Anexando archivo al expediente digital</div>
          </div>
        </div>

        <div className="mb-4">
          <CFormLabel className="fw-bold text-dark">Tipo de documento <span className="text-danger">*</span></CFormLabel>
          <CFormSelect
            value={tipoDoc}
            onChange={(e) => setTipoDoc(e.target.value)}
            className="border-2"
            style={{ borderRadius: '10px' }}
          >
            <option value="">Seleccione el tipo de documento...</option>
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </CFormSelect>
        </div>

        <CFormLabel className="fw-bold text-dark">Archivo <span className="text-danger">*</span></CFormLabel>
        {!fileUpload ? (
          <div
            className={`exp-drag-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileUploadInput').click()}
            style={{
              borderColor: dragOver ? '#10b981' : 'rgba(16, 185, 129, 0.4)',
              background: dragOver ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.02)',
            }}
          >
            <CIcon icon={cilCloudUpload} size="3xl" className="text-success mb-3 opacity-75" />
            <h5 className="fw-bolder text-dark mb-1">Arrastra tu archivo aquí</h5>
            <p className="text-muted small mb-0">o haz clic para explorar en tu dispositivo</p>
            <div className="mt-2 text-muted" style={{ fontSize: '0.7rem' }}>Formatos soportados: PDF, JPG, PNG, DOC (Máx. 10MB)</div>
            <input
              type="file"
              id="fileUploadInput"
              className="d-none"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="p-4 border rounded-3 bg-light d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-white rounded shadow-sm">
                <CIcon icon={cilFile} className="text-primary" size="xl" />
              </div>
              <div>
                <div className="fw-bold text-dark mb-1">{fileUpload.name}</div>
                <div className="text-muted small">
                  {(fileUpload.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            </div>
            <CButton
              color="light"
              className="text-danger border-0"
              onClick={() => setFileUpload(null)}
            >
              <CIcon icon={cilX} /> Cancelar
            </CButton>
          </div>
        )}
      </CModalBody>
      <CModalFooter className="border-0 pt-0 bg-white">
        <CButton color="light" onClick={handleClose} className="fw-semibold text-muted" disabled={isUploading}>
          Cancelar
        </CButton>
        <CButton
          color="success"
          className="text-white fw-bold px-4"
          style={{ boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}
          onClick={handleUpload}
          disabled={!fileUpload || !tipoDoc || isUploading}
        >
          {isUploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Subiendo...
            </>
          ) : (
            <>
              <CIcon icon={cilCloudUpload} className="me-2" />
              Subir Documento
            </>
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ExpedientesModalUpload
