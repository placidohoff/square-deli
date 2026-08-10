import React from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { ADMIN_CATEGORIES } from '../../utils/adminCategories';

export default function AdminHeader({ selectedKey, itemCount, searchQuery, onSearchChange, onAddClick }) {
    const category = ADMIN_CATEGORIES.find((c) => c.key === selectedKey);

    return (
        <div className="admin-header">
            <div>
                <h1 className="admin-header-title">{category?.label}</h1>
                <p className="admin-header-subtitle">{itemCount} item{itemCount === 1 ? '' : 's'} in this category</p>
            </div>

            <div className="admin-header-actions">
                <div className="admin-search">
                    <FiSearch className="admin-search-icon" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <button type="button" className="admin-add-btn" onClick={onAddClick}>
                    <FiPlus />
                    <span>Add Item</span>
                </button>
            </div>
        </div>
    );
}
