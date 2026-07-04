/**
 * ECOGEST — Shared Confirm Modal Hook (useConfirmModal)
 * =====================================================
 * Replaces ALL window.confirm() calls across the application.
 * Uses CoreUI CModal with ECOGEST design system styling.
 *
 * Usage:
 *   const { ConfirmModal, confirm } = useConfirmModal();
 *   const ok = await confirm('¿Eliminar?', 'Esta acción no se puede deshacer.');
 *   if (ok) { ... }
 *   // ... in JSX: <ConfirmModal />
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilWarning, cilTrash, cilShieldAlt } from '@coreui/icons';

const useConfirmModal = () => {
  const [state, setState] = useState({
    visible: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    variant: 'danger', // 'danger' | 'warning' | 'info'
    icon: cilWarning,
  });

  const resolveRef = useRef(null);

  /**
   * Show a confirmation modal. Returns a Promise<boolean>.
   * @param {string} title
   * @param {string} message
   * @param {object} opts - { confirmLabel, cancelLabel, variant, icon }
   */
  const confirm = useCallback((title, message, opts = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        visible: true,
        title,
        message,
        confirmLabel: opts.confirmLabel || 'Confirmar',
        cancelLabel: opts.cancelLabel || 'Cancelar',
        variant: opts.variant || 'danger',
        icon: opts.icon || (opts.variant === 'warning' ? cilWarning : cilTrash),
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }));
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }));
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  const VARIANT_COLORS = {
    danger: {
      bg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      btn: 'danger',
      iconBg: 'rgba(239,68,68,0.12)',
    },
    warning: {
      bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      btn: 'warning',
      iconBg: 'rgba(245,158,11,0.12)',
    },
    info: {
      bg: 'linear-gradient(135deg, var(--eco-700) 0%, var(--eco-500) 100%)',
      btn: 'success',
      iconBg: 'rgba(67,160,71,0.12)',
    },
  };

  const colors = VARIANT_COLORS[state.variant] || VARIANT_COLORS.danger;

  /**
   * Render the modal. Place once in your component tree.
   */
  const ConfirmModal = useCallback(() => (
    <CModal
      visible={state.visible}
      onClose={handleCancel}
      size="sm"
      backdrop="static"
      alignment="center"
      className="modal-minec"
    >
      <CModalHeader
        className="border-0 pb-0"
        style={{ background: colors.bg, color: 'white' }}
      >
        <CModalTitle className="fw-bold text-montserrat d-flex align-items-center gap-2">
          <div className="bg-white bg-opacity-25 rounded-circle p-2 d-flex align-items-center justify-content-center">
            <CIcon icon={state.icon} className="text-white" />
          </div>
          {state.title}
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="pt-4 pb-3 px-4">
        <p
          className="text-inter mb-0"
          style={{
            fontSize: 'var(--font-size-base, 0.875rem)',
            color: 'var(--color-text-body, #1F2937)',
            lineHeight: 1.6,
          }}
        >
          {state.message}
        </p>
      </CModalBody>

      <CModalFooter className="border-0 pt-0 d-flex gap-2">
        <CButton
          color="secondary"
          variant="outline"
          onClick={handleCancel}
          className="btn-minec-outline flex-grow-1"
          style={{ borderRadius: 'var(--radius-sm, 8px)' }}
        >
          {state.cancelLabel}
        </CButton>
        <CButton
          color={colors.btn}
          onClick={handleConfirm}
          className={`fw-semibold flex-grow-1 ${colors.btn === 'success' ? 'btn-minec-success' : ''}`}
          style={{ borderRadius: 'var(--radius-sm, 8px)' }}
        >
          <CIcon icon={state.icon} className="me-2" />
          {state.confirmLabel}
        </CButton>
      </CModalFooter>
    </CModal>
  ), [state, colors, handleCancel, handleConfirm]);

  return { confirm, ConfirmModal };
};

export default useConfirmModal;
