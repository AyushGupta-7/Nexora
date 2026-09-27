import React, { useEffect, useRef } from 'react'
import './ConfirmModal.css'

/**
 * Reusable confirmation modal for destructive actions.
 *
 * Props:
 *   isOpen     — boolean
 *   title      — string  (e.g. "Delete this post?")
 *   message    — string  (e.g. "This action cannot be undone.")
 *   confirmLabel  — string (default: "Confirm")
 *   cancelLabel   — string (default: "Cancel")
 *   isDestructive — boolean (default: true) — styles confirm button in danger color
 *   loading    — boolean — shows spinner in confirm button, disables both buttons
 *   onConfirm  — async () => void
 *   onCancel   — () => void
 */
const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, loading, onCancel])

  // Trap focus on confirm button when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmBtnRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel?.()
    }
  }

  return (
    <div className="confirm-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          {isDestructive && (
            <div className="confirm-icon-wrapper">
              <span className="material-symbols-outlined confirm-icon">warning</span>
            </div>
          )}
          <h3 id="confirm-title" className="confirm-title">{title}</h3>
        </div>

        {message && (
          <p className="confirm-message">{message}</p>
        )}

        <div className="confirm-actions">
          <button
            className="confirm-btn confirm-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            className={`confirm-btn ${isDestructive ? 'confirm-btn-danger' : 'confirm-btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="confirm-spinner" />
                {confirmLabel}…
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
