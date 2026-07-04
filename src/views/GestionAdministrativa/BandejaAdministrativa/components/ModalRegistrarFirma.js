import React, { useState } from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CAlert, CFormLabel, CFormInput,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle, cilFile, cilWarning } from '@coreui/icons';

const ModalRegistrarFirma = ({
  visible,
  onClose,
  onConfirmar,
  tramite,
}) => {
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState(null);

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF.');
      setArchivo(null);
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('El archivo no debe superar los 10MB.');
      setArchivo(null);
      return;
    }

    setError(null);
    setArchivo(file);
  };

  const handleConfirmar = () => {
    if (!archivo) {
      setError('Debe subir el documento firmado.');
      return;
    }
    onConfirmar(tramite, archivo);
    setArchivo(null);
    setError(null);
  };

  const handleClose = () => {
    setArchivo(null);
    setError(null);
    onClose();
  };

  return (
    <CModal visible={visible} onClose={handleClose}>
      <CModalHeader closeButton className="bg-success bg-opacity-10">
        <CModalTitle>
          <CIcon icon={cilCheckCircle} className="me-2 text-success" />
          Registrar Firma y Aprobar
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p className="text-muted small mb-3">
          Trámite: <strong>{tramite?.tramiteId}</strong> — {tramite?.tramiteData?.solicitante}
        </p>

        <div className="border rounded p-3 bg-light mb-3">
          <small className="text-muted fw-bold d-block mb-2">Instrucciones:</small>
          <ol className="small mb-0 ps-3">
            <li>Imprima la Providencia Administrativa generada</li>
            <li>El Director General debe firmar el documento</li>
            <li>Escanee el documento firmado en formato PDF</li>
            <li>Suba el archivo escaneado aquí</li>
          </ol>
        </div>

        {error && (
          <CAlert color="danger" className="py-2 small">
            <CIcon icon={cilWarning} className="me-2" />
            {error}
          </CAlert>
        )}

        <CFormLabel className="small fw-semibold mb-1">
          <CIcon icon={cilFile} className="me-1" size="sm" />
          Documento Firmado (PDF, máx 10MB)
        </CFormLabel>
        <CFormInput
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />
        {archivo && (
          <div className="mt-2 p-2 bg-success bg-opacity-10 rounded">
            <small className="text-success fw-bold">
              <CIcon icon={cilCheckCircle} className="me-1" />
              {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
            </small>
          </div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>Cancelar</CButton>
        <CButton color="success" onClick={handleConfirmar} disabled={!archivo}>
          <CIcon icon={cilCheckCircle} className="me-1" />
          Registrar Firma y Aprobar
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ModalRegistrarFirma;
