import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiLogOut, FiExternalLink } from 'react-icons/fi';

export default function AdminMobileMenu({ onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="admin-mobile-menu">
            <button
                type="button"
                className="admin-mobile-menu-btn"
                aria-label="Menu"
                onClick={() => setIsOpen((open) => !open)}
            >
                <FiMenu />
            </button>

            {isOpen && (
                <div className="admin-mobile-menu-dropdown">
                    <button type="button" onClick={() => { navigate('/sandwiches'); setIsOpen(false); }}>
                        <FiExternalLink />
                        <span>View Sandwiches</span>
                    </button>
                    <button type="button" onClick={() => { navigate('/items'); setIsOpen(false); }}>
                        <FiExternalLink />
                        <span>View Other Items</span>
                    </button>
                    <button type="button" onClick={() => { setIsOpen(false); onLogout(); }}>
                        <FiLogOut />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}
