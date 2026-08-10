import React, { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { DELI_API_ROOT } from '../Constants';
import { getAuthToken, clearAuthToken } from '../utils/authToken';
import AdminModal from './admin/AdminModal';

const EDIT_API =  DELI_API_ROOT + '/api/MenuItems';

function handleUnauthorized() {
    clearAuthToken();
    alert('Your session has expired. Please log in again.');
    window.location.reload();
}

export default function EditItemCardCharlie({ item, onDeleted }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(item);

    const [name, setName] = useState(item.name || '');
    const [description, setDescription] = useState(item.description || '');
    const [basePrice, setBasePrice] = useState(item.basePrice || '');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEditSubmit = async (e) => {
        try {
            e.preventDefault();
            const formData = new FormData();
            formData.append("Id", currentItem.id);
            formData.append("Name", name);
            formData.append("BasePrice", basePrice);

            if (description) {
                formData.append("Description", description);
            }

            const res = await fetch(`${EDIT_API}/${currentItem.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getAuthToken()}` },
                body: formData, // 🚀 no Content-Type header — browser sets correct multipart boundaries
            });

            if (res.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!res.ok) throw new Error("Failed to update item");

            const updatedItem = await res.json();
            setCurrentItem(updatedItem);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('Update failed. Please check your input.');
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${currentItem.name}"? This can't be undone.`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`${EDIT_API}/${currentItem.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });

            if (res.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!res.ok) throw new Error("Failed to delete item");

            onDeleted(currentItem.id);
        } catch (err) {
            console.error(err);
            alert("Delete failed. Please try again.");
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="admin-item-card">
                <div className="admin-item-card-header">
                    <h3 className="admin-item-name">{currentItem.name}</h3>
                    <span className="admin-price-badge">${currentItem.basePrice}</span>
                </div>

                {currentItem.description && (
                    <p className="admin-item-desc">{currentItem.description}</p>
                )}

                <div className="admin-item-footer">
                    <button type="button" className="admin-edit-btn" onClick={() => setIsEditing(true)}>
                        <FiEdit2 /> Edit
                    </button>
                    <button type="button" className="admin-delete-btn" onClick={handleDelete} disabled={isDeleting}>
                        <FiTrash2 /> {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            {isEditing && (
                <AdminModal title={`Edit ${currentItem.name}`} onClose={() => setIsEditing(false)}>
                    <div className="admin-modal-form">
                        <label className="admin-modal-field">
                            <span>Name</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </label>
                        <label className="admin-modal-field">
                            <span>Description</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                            />
                        </label>
                        <label className="admin-modal-field">
                            <span>Price</span>
                            <input
                                type="text"
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                            />
                        </label>

                        <div className="admin-modal-actions">
                            <button type="button" className="admin-modal-save" onClick={handleEditSubmit}>Save</button>
                            <button type="button" className="admin-modal-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </div>
                </AdminModal>
            )}
        </>
    );
}
