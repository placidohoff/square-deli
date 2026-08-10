import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiExternalLink } from 'react-icons/fi';
import { ADMIN_CATEGORIES } from '../../utils/adminCategories';

export default function AdminSidebar({ selectedKey, onSelect, onLogout }) {
    const navigate = useNavigate();

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-brand">
                <span className="admin-sidebar-logo">SD</span>
                <div>
                    <div className="admin-sidebar-title">Square Deli</div>
                    <div className="admin-sidebar-subtitle">Admin Panel</div>
                </div>
            </div>

            <div className="admin-sidebar-section-label">Menu Categories</div>
            <nav className="admin-sidebar-nav">
                {ADMIN_CATEGORIES.map((cat) => (
                    <button
                        key={cat.key}
                        type="button"
                        className={`admin-nav-item${cat.key === selectedKey ? ' active' : ''}`}
                        onClick={() => onSelect(cat.key)}
                    >
                        <cat.icon className="admin-nav-icon" />
                        <span className="admin-nav-label">{cat.label}</span>
                    </button>
                ))}
            </nav>

            <div className="admin-sidebar-view-links">
                <button type="button" className="admin-view-link-btn" onClick={() => navigate('/sandwiches')}>
                    <FiExternalLink />
                    <span>View Sandwiches</span>
                </button>
                <button type="button" className="admin-view-link-btn" onClick={() => navigate('/items')}>
                    <FiExternalLink />
                    <span>View Items</span>
                </button>
            </div>

            <button type="button" className="admin-logout-btn" onClick={onLogout}>
                <FiLogOut />
                <span>Logout</span>
            </button>
        </aside>
    );
}
