import React from 'react';
import { FiX } from 'react-icons/fi';

// Shared modal shell for the admin page's Edit/Add Item forms — a dark
// overlay behind a centered white panel, closable via the X button, the
// Cancel action inside, or clicking the overlay itself.
export default function AdminModal({ title, onClose, children }) {
    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2 className="admin-modal-title">{title}</h2>
                    <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">
                        <FiX />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
