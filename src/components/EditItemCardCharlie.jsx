import React, { useState } from 'react';
import { DELI_API_ROOT } from '../Constants';
import { getAuthToken, clearAuthToken } from '../utils/authToken';

const EDIT_API =  DELI_API_ROOT + '/api/MenuItems';

export default function EditItemCardCharlie({ item }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(item);

    const [name, setName] = useState(item.name || '');
    const [description, setDescription] = useState(item.description || '');
    const [basePrice, setBasePrice] = useState(item.basePrice || '');

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
                clearAuthToken();
                alert("Your session has expired. Please log in again.");
                window.location.reload();
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

    return (
        <>
            {isEditing ? (
                <div className='editItemForm' style={{ border: "1px solid black", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
                    <div style={{}}>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            style={{ width: '100%' }}
                        />
                        <br />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            rows={3}
                            style={{ width: '100%' }}
                        />
                        <br />
                        <input
                            type="text"
                            value={basePrice}
                            onChange={(e) => setBasePrice(e.target.value)}
                            placeholder={currentItem.basePrice}
                        />
                        <br />


                    </div>

                    <div style={{marginTop: '10px', display: 'flex', justifyContent: 'space-between'}}>
                        <button className='btn-save' onClick={handleEditSubmit}>Save</button>
                        <button className='btn-cancel' onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div
                    className='editShowItem'
                    onClick={() => setIsEditing(true)}
                    style={{
                        border: '1px solid',
                        marginBottom: '5px',
                        borderRadius: '5px',
                        padding: '5px',
                        cursor: 'pointer',
                        minWidth: '250px'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%'
                    }}>
                        <strong>{currentItem.name}:</strong> ${currentItem.basePrice}
                        <br />
                    </div>
                    {currentItem.description && (
                        <div style={{ fontSize: 'smaller' }}>{currentItem.description}</div>
                    )}
                </div>
            )}
        </>
    );
}
