import React from 'react';
import { ADMIN_CATEGORIES } from '../../utils/adminCategories';

export default function AdminCategoryPills({ counts, selectedKey, onSelect }) {
    return (
        <div className="admin-category-pills">
            {ADMIN_CATEGORIES.map(({ key, label }) => (
                <button
                    key={key}
                    type="button"
                    className={`admin-pill${key === selectedKey ? ' active' : ''}`}
                    onClick={() => onSelect(key)}
                >
                    {label}
                    <span className="admin-pill-count">{counts[key] ?? 0}</span>
                </button>
            ))}
        </div>
    );
}
