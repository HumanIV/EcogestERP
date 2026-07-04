import React, { useState, useMemo } from 'react';
import {
  CCard,
  CCardBody,
  CFormLabel,
  CRow,
  CCol,
  CButton,
  CBadge,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilPlus, cilMagnifyingGlass, cilPencil, cilTrash, cilBuilding, 
  cilTags, cilPeople, cilLocationPin, cilPhone, cilCheckCircle,
  cilWarning, cilSearch, cilSync, cilX, cilInbox
} from '@coreui/icons';
import { CATEGORIAS } from '../constants/inventarioConstants';

const ESTADOS_PROVEEDOR = [
  { value: 'Activo', label: 'Activo', color: 'success' },
  { value: 'Inactivo', label: 'Inactivo', color: 'secondary' },
  { value: 'Suspendido', label: 'Suspendido', color: 'warning' }
];

const InventarioProveedores = ({ proveedores, onOpenModal, onAgregarProveedor, onEditarProveedor, onEliminarProveedor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [proveedorEditando, setProveedorEditando] = useState(null);
  const [errores, setErrores] = useState({});
  const [form, setForm] = useState({
    nombre: '',
    rif: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    categoria: '',
    estado: 'Activo'
  });

  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter(prov => {
      const matchSearch = !searchTerm || 
        prov.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prov.rif.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prov.contacto.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado = !filterEstado || prov.estado === filterEstado;
      const matchCategoria = !filterCategoria || prov.categoria === filterCategoria;
      return matchSearch && matchEstado && matchCategoria;
    });
  }, [proveedores, searchTerm, filterEstado, filterCategoria]);

  const abrirModalCrear = () => {
    setModalMode('create');
    setProveedorEditando(null);
    setForm({
      nombre: '', rif: '', contacto: '', telefono: '', email: '',
      direccion: '', categoria: '', estado: 'Activo'
    });
    setErrores({});
    setShowModal(true);
  };

  const abrirModalEditar = (prov) => {
    setModalMode('edit');
    setProveedorEditando(prov);
    setForm({
      nombre: prov.nombre,
      rif: prov.rif,
      contacto: prov.contacto || '',
      telefono: prov.telefono || '',
      email: prov.email || '',
      direccion: prov.direccion || '',
      categoria: prov.categoria || '',
      estado: prov.estado || 'Activo'
    });
    setErrores({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setProveedorEditando(null);
    setErrores({});
  };

  const validarForm = () => {
    const newErrores = {};

    if (!form.nombre.trim()) {
      newErrores.nombre = 'El nombre es obligatorio';
    }

    if (!form.rif.trim()) {
      newErrores.rif = 'El RIF es obligatorio';
    } else if (!/^[JGVEPjgvpe]-\d{6,9}-\d$/.test(form.rif)) {
      newErrores.rif = 'Formato RIF inválido (Ej: J-30123456-7)';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrores.email = 'Email inválido';
    }

    if (form.telefono && !/^\+?\d{10,14}$/.test(form.telefono.replace(/[\s()-]/g, ''))) {
      newErrores.telefono = 'Teléfono inválido';
    }

    if (!form.categoria) {
      newErrores.categoria = 'Seleccione una categoría';
    }

    setErrores(newErrores);
    return Object.keys(newErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validarForm()) return;

    if (modalMode === 'create') {
      onAgregarProveedor(form);
    } else {
      onEditarProveedor(proveedorEditando.id, form);
    }
    cerrarModal();
  };

  const handleEliminar = (prov) => {
    if (window.confirm(`¿Está seguro de eliminar el proveedor "${prov.nombre}"?`)) {
      onEliminarProveedor(prov.id);
    }
  };

  const handleInputChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: '' }));
    }
  };

  const estadosStats = useMemo(() => {
    const stats = { Activo: 0, Inactivo: 0, Suspendido: 0 };
    proveedores.forEach(p => {
      if (stats[p.estado] !== undefined) stats[p.estado]++;
    });
    return stats;
  }, [proveedores]);

  return (
    <>
      <CRow className="mb-3 align-items-center">
        <CCol xs={12} md={6}>
          <h5 className="mb-0 fw-bold">
            <CIcon icon={cilPeople} className="me-2 text-eco" />
            Proveedores Autorizados
          </h5>
          <p className="text-muted mb-0">
            {proveedoresFiltrados.length} de {proveedores.length} proveedores
          </p>
        </CCol>
        <CCol xs={12} md={6} className="text-md-end">
          <CButton color="success" onClick={abrirModalCrear}>
            <CIcon icon={cilPlus} className="me-2" />
            Nuevo Proveedor
          </CButton>
        </CCol>
      </CRow>

      <CRow className="mb-4 g-3">
        <CCol xs={12} md={4}>
          <CInputGroup>
            <CInputGroupText className="bg-eco-soft border-end-0">
              <CIcon icon={cilSearch} className="text-eco" />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar por nombre, RIF o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-start-0"
            />
          </CInputGroup>
        </CCol>
        <CCol xs={6} md={3}>
          <CFormSelect
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="input-minec"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_PROVEEDOR.map(est => (
              <option key={est.value} value={est.value}>{est.label}</option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol xs={6} md={3}>
          <CFormSelect
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="input-minec"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(cat => (
              <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol xs={12} md={2}>
          <CButton 
            color="secondary" 
            variant="outline" 
            className="w-100"
            onClick={() => { setSearchTerm(''); setFilterEstado(''); setFilterCategoria(''); }}
            disabled={!searchTerm && !filterEstado && !filterCategoria}
          >
            <CIcon icon={cilSync} className="me-1" />
            Limpiar
          </CButton>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol xs={12}>
          <div className="d-flex gap-3 flex-wrap">
            {ESTADOS_PROVEEDOR.map(est => (
              <CBadge 
                key={est.value}
                color={est.color}
                className="px-3 py-2"
                style={{ cursor: 'pointer' }}
                onClick={() => setFilterEstado(filterEstado === est.value ? '' : est.value)}
              >
                {est.label}: {estadosStats[est.value]}
              </CBadge>
            ))}
          </div>
        </CCol>
      </CRow>

      {proveedoresFiltrados.length === 0 ? (
        <CCard className="eco-card">
          <CCardBody className="text-center py-5">
            <CIcon icon={cilSearch} size="4xl" className="text-muted mb-3" />
            <h6 className="text-muted">No se encontraron proveedores</h6>
            <p className="text-muted small">Intenta con otros términos de búsqueda</p>
          </CCardBody>
        </CCard>
      ) : (
        <CRow>
          {proveedoresFiltrados.map(prov => (
            <CCol md={6} lg={4} key={prov.id} className="mb-4">
              <CCard className="h-100 eco-card">
                <CCardBody>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="bg-success-subtle rounded-circle d-flex p-2">
                      <CIcon icon={cilBuilding} size="lg" className="text-success m-auto" />
                    </div>
                    <CBadge color={prov.estado === 'Activo' ? 'success' : prov.estado === 'Suspendido' ? 'warning' : 'secondary'}>
                      {prov.estado}
                    </CBadge>
                  </div>
                  
                  <h6 className="fw-bold mb-1">{prov.nombre}</h6>
                  <small className="text-muted d-block mb-3">RIF: {prov.rif}</small>

                  <div className="small mb-2">
                    <CIcon icon={cilTags} className="me-2 text-muted" />
                    {prov.categoria || 'Sin categoría'}
                  </div>
                  <div className="small mb-2">
                    <CIcon icon={cilPeople} className="me-2 text-muted" />
                    {prov.contacto || 'Sin contacto'}
                  </div>
                  <div className="small mb-2">
                    <CIcon icon={cilPhone} className="me-2 text-muted" />
                    {prov.telefono || 'Sin teléfono'}
                  </div>
                  <div className="small mb-2">
                    <CIcon icon={cilInbox} className="me-2 text-muted" />
                    {prov.email || 'Sin email'}
                  </div>
                  <div className="small text-muted mb-3">
                    <CIcon icon={cilLocationPin} className="me-2" />
                    {prov.direccion || 'Sin dirección'}
                  </div>

                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <small className="text-muted">Proveedor</small>
                    <div className="btn-group btn-group-sm">
                      <CButton 
                        size="sm" 
                        color="warning" 
                        variant="outline"
                        onClick={() => abrirModalEditar(prov)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton 
                        size="sm" 
                        color="danger" 
                        variant="outline"
                        onClick={() => handleEliminar(prov)}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </div>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      )}

      <CModal
        visible={showModal}
        onClose={cerrarModal}
        size="lg"
        className="eco-modal"
      >
        <CModalHeader closeButton className="eco-card-header">
          <CModalTitle className="fw-bold">
            <CIcon icon={cilBuilding} className="me-2" />
            {modalMode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            {Object.keys(errores).length > 0 && (
              <CAlert color="danger" className="mb-3">
                <CIcon icon={cilWarning} className="me-2" />
                Por favor corrija los errores indicados
              </CAlert>
            )}

            <CRow className="g-3">
              <CCol md={12}>
                <CFormLabel>Nombre o Razón Social *</CFormLabel>
                <CFormInput
                  value={form.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Ej: Tecnología Venezuela C.A."
                  invalid={!!errores.nombre}
                />
                {errores.nombre && <small className="text-danger">{errores.nombre}</small>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>RIF / Cédula *</CFormLabel>
                <CFormInput
                  value={form.rif}
                  onChange={(e) => handleInputChange('rif', e.target.value.toUpperCase())}
                  placeholder="J-30123456-7"
                  invalid={!!errores.rif}
                />
                {errores.rif && <small className="text-danger">{errores.rif}</small>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Categoría *</CFormLabel>
                <CFormSelect
                  value={form.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  invalid={!!errores.categoria}
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIAS.map(cat => (
                    <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                  ))}
                </CFormSelect>
                {errores.categoria && <small className="text-danger">{errores.categoria}</small>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Persona de Contacto</CFormLabel>
                <CFormInput
                  value={form.contacto}
                  onChange={(e) => handleInputChange('contacto', e.target.value)}
                  placeholder="Ej: Ing. Roberto Sánchez"
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>Teléfono</CFormLabel>
                <CFormInput
                  value={form.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="+58 276-1234567"
                  invalid={!!errores.telefono}
                />
                {errores.telefono && <small className="text-danger">{errores.telefono}</small>}
              </CCol>

              <CCol md={12}>
                <CFormLabel>Correo Electrónico</CFormLabel>
                <CFormInput
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="correo@empresa.com"
                  invalid={!!errores.email}
                />
                {errores.email && <small className="text-danger">{errores.email}</small>}
              </CCol>

              <CCol md={12}>
                <CFormLabel>Dirección</CFormLabel>
                <CFormInput
                  value={form.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Dirección completa de la empresa"
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>Estado</CFormLabel>
                <CFormSelect
                  value={form.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                >
                  {ESTADOS_PROVEEDOR.map(est => (
                    <option key={est.value} value={est.value}>{est.label}</option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={cerrarModal}>
              Cancelar
            </CButton>
            <CButton type="submit" color="success">
              <CIcon icon={cilCheckCircle} className="me-2" />
              {modalMode === 'create' ? 'Registrar Proveedor' : 'Guardar Cambios'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  );
};

export default InventarioProveedores;