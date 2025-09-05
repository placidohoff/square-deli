import React, { useState } from 'react';

const API_URL = 'http://localhost:5000/sandwiches';
const UPLOAD_URL = 'http://localhost:5000/upload-image'; // your backend upload endpoint

export default function EditItemCard({ item }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(item);
    const [selectedImage, setSelectedImage] = useState(null);

    const [form, setForm] = useState({
        name: item.name,
        description: item.description,
        prices: typeof item.prices === 'object' ? JSON.stringify(item.prices) : item.prices,
    });

    const handleEditSubmit = async () => {
        try {
            // Step 1: Upload image if selected
            let imageFilename = currentItem.image;

            if (selectedImage) {
                const formData = new FormData();
                formData.append('image', selectedImage);
                formData.append('folder', 'sandwiches'); // Optional: for folder-specific handling

                const uploadRes = await fetch(UPLOAD_URL, {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error('Image upload failed');

                const uploadData = await uploadRes.json();
                imageFilename = uploadData.filename; // Update image filename
            }

            // Step 2: Update JSON/item
            const updatedData = {
                name: form.name,
                description: form.description,
                prices: isNaN(form.prices)
                    ? JSON.parse(form.prices)
                    : parseFloat(form.prices),
                image: imageFilename,
            };

            const res = await fetch(`${API_URL}/${currentItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) throw new Error('Failed to update item');

            const updatedItem = await res.json();
            setCurrentItem(updatedItem);
            setSelectedImage(null);
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
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '100%', paddingRight: '10px' }}>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Name"
                                style={{ width: '100%' }}
                            />
                            <br />
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Description"
                                rows={3}
                                style={{ width: '100%' }}
                            />
                            <br />
                            <input
                                type="text"
                                value={form.prices}
                                onChange={(e) => setForm({ ...form, prices: e.target.value })}
                                placeholder='Price or {"Large": 9.99}'
                            />
                            <br />
                        </div>
                        <div>
                            <img
                                style={{ maxWidth: '300px' }}
                                className='img-fluid'
                                src={`http://localhost:5000/public/images/sandwiches/${currentItem.image}`}
                                alt="Menu item"
                            />
                            <br />
                            <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} />
                        </div>
                    </div>

                    <button onClick={handleEditSubmit}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
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
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <div>
                        <strong>{currentItem.name}</strong>: $
                        {typeof currentItem.prices === 'object'
                            ? JSON.stringify(currentItem.prices)
                            : currentItem.prices}
                        <br />
                        {currentItem.description}
                    </div>
                    <div>
                        <img
                            style={{ maxWidth: '100px' }}
                            className='img-fluid'
                            src={`http://localhost:5000/public/images/sandwiches/${currentItem.image}`}
                            alt="Menu item"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
