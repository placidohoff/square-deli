import React, { useState } from 'react';

const API_URL = 'https://square-deli-menu.web.app/other-menu-items';
// const UPLOAD_URL = 'https://square-deli-menu.web.app/upload-image'; // your backend upload endpoint

export default function EditItemCardBravo({ item }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(item);

    const [form, setForm] = useState({
        name: item.name,
        description: item.description,
        price: typeof item.prices === 'object' ? JSON.stringify(item.prices) : item.price,
    });

    const handleEditSubmit = async () => {
        try {
           
            // Step 2: Update JSON/item
            const updatedData = {
                name: form.name,
                // description: form.description,
                price: isNaN(form.prices)
                    ? JSON.parse(form.price)
                    : parseFloat(form.price),
            };

            //TODO: WORK ON /OTHER-MENU-ITEMS ENDPOINT: FIX THE EXPECTED BODY VALUES ETC
            const res = await fetch(`${API_URL}/${currentItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) throw new Error('Failed to update item');

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
                    <div style={{  }}>
                        
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Name"
                                style={{ width: '100%' }}
                            />
                            <br />
                            {/* <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Description"
                                rows={3}
                                style={{ width: '100%' }}
                            /> */}
                            <br />
                            <input
                                type="text"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                placeholder='Price or {"Large": 9.99}'
                            />
                            <br />
                       
                        
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
                        
                    }}
                >
                    <div>
                        <strong>{currentItem.name}</strong>: $
                        {typeof currentItem.prices === 'object'
                            ? JSON.stringify(currentItem.prices)
                            : currentItem.price}
                        <br />
                        {currentItem.description}
                    </div>
                    
                </div>
            )}
        </>
    );
}
