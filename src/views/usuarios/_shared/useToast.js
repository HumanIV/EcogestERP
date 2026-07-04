/**
 * ECOGEST — Shared Toast Hook (useToast)
 * =======================================
 * Replaces ALL window.alert() calls across the application.
 * Uses CoreUI CToast for non-blocking, styled notifications.
 *
 * Usage:
 *   const { ToastContainer, showToast } = useToast();
 *   showToast('Operación exitosa', 'success');
 *   // ... in JSX: <ToastContainer />
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  CToast,
  CToastBody,
  CToastClose,
  CToaster,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilCheckCircle,
  cilWarning,
  cilInfo,
  cilBan,
} from '@coreui/icons';

const TOAST_ICONS = {
  success: cilCheckCircle,
  warning: cilWarning,
  info: cilInfo,
  danger: cilBan,
  error: cilBan,
};

const TOAST_COLORS = {
  success: 'var(--color-success, #10B981)',
  warning: 'var(--color-warning, #F59E0B)',
  info: 'var(--color-info, #3B82F6)',
  danger: 'var(--color-danger, #EF4444)',
  error: 'var(--color-danger, #EF4444)',
};

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  /**
   * Show a toast notification.
   * @param {string} message - message to display
   * @param {'success'|'warning'|'info'|'danger'|'error'} type - toast type
   * @param {number} duration - auto-dismiss in ms (default 4000, 0 = persistent)
   */
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [
      ...prev,
      { id, message, type, duration },
    ]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /**
   * Toast container component — render this once at the bottom of your page component.
   */
  const ToastContainer = useCallback(() => (
    <CToaster
      placement="top-end"
      className="position-fixed p-3"
      style={{ zIndex: 9999 }}
    >
      {toasts.map((toast) => (
        <CToast
          key={toast.id}
          visible
          autohide={toast.duration > 0}
          delay={toast.duration}
          className="border-0 shadow-lg animate-fade-eco"
          style={{
            borderRadius: 'var(--radius-md, 12px)',
            borderLeft: `4px solid ${TOAST_COLORS[toast.type] || TOAST_COLORS.info}`,
            backdropFilter: 'blur(12px)',
            background: 'rgba(255,255,255,0.96)',
          }}
        >
          <CToastBody className="d-flex align-items-center gap-3 py-3 px-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm, 8px)',
                background: `${TOAST_COLORS[toast.type] || TOAST_COLORS.info}15`,
              }}
            >
              <CIcon
                icon={TOAST_ICONS[toast.type] || TOAST_ICONS.info}
                style={{ color: TOAST_COLORS[toast.type] || TOAST_COLORS.info }}
              />
            </div>
            <span
              className="text-inter flex-grow-1"
              style={{
                fontWeight: 500,
                fontSize: 'var(--font-size-base, 0.875rem)',
                color: 'var(--color-text-body, #1F2937)',
              }}
            >
              {toast.message}
            </span>
            <CToastClose
              className="ms-2"
              onClick={() => dismissToast(toast.id)}
            />
          </CToastBody>
        </CToast>
      ))}
    </CToaster>
  ), [toasts, dismissToast]);

  return { showToast, ToastContainer };
};

export default useToast;
