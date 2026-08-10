import React, { useState } from 'react';
import { DELI_API_ROOT } from '../../Constants';
import { getAuthToken, clearAuthToken } from '../../utils/authToken';
import { ADMIN_CATEGORIES } from '../../utils/adminCategories';
import AdminModal from './AdminModal';

const CREATE_API = DELI_API_ROOT + '/api/MenuItems';

// Sandwiches are the only category where items can use size-based pricing
// (Large/Roll) instead of a single price — and even within Sandwiches it's
// per item, not fixed (e.g. "Chopped Cheese" is a single $10.99, "Italian"
// is Large/Roll). Since there's no existing item to infer that from here,
// both price shapes are shown for Sandwiches and the admin fills in
// whichever applies to the new item.
export default function AddItemForm({ categoryValue, onCreated, onCancel }) {
    const [category, setCategory] = useState(categoryValue);
    const isSandwich = category === 'Sandwiches';

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [basePrice, setBasePrice] = useState('');
    const [largePrice, setLargePrice] = useState('');
    const [rollPrice, setRollPrice] = useState('');
    const [file, setFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append('Name', name);
            formData.append('Category', category);

            if (description) formData.append('Description', description);

            if (largePrice) {
                formData.append('Prices[0].Size', 'Large');
                formData.append('Prices[0].Price', largePrice);
            }
            if (rollPrice) {
                formData.append('Prices[1].Size', 'Roll');
                formData.append('Prices[1].Price', rollPrice);
            }
            // Sent whenever there's no size-based pricing, sandwich or not —
            // matches how EditItemCard.jsx/the backend already treat an
            // empty BasePrice as "no single price, use Prices[] instead".
            if (!largePrice && !rollPrice) {
                formData.append('BasePrice', basePrice);
            }

            if (file) formData.append('File', file);

            const res = await fetch(CREATE_API, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getAuthToken()}` },
                body: formData,
            });

            if (res.status === 401) {
                clearAuthToken();
                alert('Your session has expired. Please log in again.');
                window.location.reload();
                return;
            }

            if (!res.ok) throw new Error('Failed to create item');

            onCreated();
        } catch (err) {
            console.error(err);
            alert('Could not add item. Please check your input.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminModal title="Add Item" onClose={onCancel}>
            <form className="admin-modal-form" onSubmit={handleSubmit}>
                <label className="admin-modal-field">
                    <span>Name</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>

                <label className="admin-modal-field">
                    <span>Category</span>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        {ADMIN_CATEGORIES.map((c) => (
                            <option key={c.key} value={c.categoryValue}>{c.label}</option>
                        ))}
                    </select>
                </label>

                <label className="admin-modal-field">
                    <span>Description</span>
                    <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>

                {isSandwich ? (
                    <>
                        <p className="admin-modal-hint">
                            Use either a single Price, or Large/Roll prices — not both.
                        </p>
                        <label className="admin-modal-field">
                            <span>Price (single size)</span>
                            <input
                                type="text"
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                            />
                        </label>
                        <div className="admin-modal-price-row">
                            <label className="admin-modal-field">
                                <span>Large price</span>
                                <input
                                    type="text"
                                    value={largePrice}
                                    onChange={(e) => setLargePrice(e.target.value)}
                                />
                            </label>
                            <label className="admin-modal-field">
                                <span>Roll price</span>
                                <input
                                    type="text"
                                    value={rollPrice}
                                    onChange={(e) => setRollPrice(e.target.value)}
                                />
                            </label>
                        </div>
                    </>
                ) : (
                    <label className="admin-modal-field">
                        <span>Price</span>
                        <input
                            type="text"
                            value={basePrice}
                            onChange={(e) => setBasePrice(e.target.value)}
                        />
                    </label>
                )}

                <label className="admin-modal-field">
                    <span>Photo</span>
                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                </label>

                <div className="admin-modal-actions">
                    <button type="submit" className="admin-modal-save" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="admin-modal-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </AdminModal>
    );
}
