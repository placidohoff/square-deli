import React, { useState } from 'react';

const EDIT_API = 'https://deliprojectapi-eheyg4exevd7azgd.canadaeast-01.azurewebsites.net/api/MenuItems';
// const API_URL = 'https://square-deli-menu.web.app/other-menu-items';
// const API_URL = 'http://localhost:5000/other-menu-items';
// const UPLOAD_URL = 'https://square-deli-menu.web.app/upload-image'; // your backend upload endpoint

export default function EditItemCardCharlie({ item }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(item);

    const [name, setName] = useState('');
    const [basePrice, setBasePrice] = useState('');

    // const [form, setForm] = useState({
    //     name: item.name,
    //     description: item.description,
    //     price: item.basePrice,
    // });

    const handleEditSubmit = async (e) => {
        try {
            e.preventDefault();
            //The endpoint expects PUT [FromFile]
            const formData = new FormData();
            formData.append("Id", currentItem.id);
            formData.append("Name", name);
            formData.append("BasePrice", basePrice);

            //TODO: WORK ON /OTHER-MENU-ITEMS ENDPOINT: FIX THE EXPECTED BODY VALUES ETC
            const res = await fetch(`${EDIT_API}/${currentItem.id}`, {
                method: "PUT",
                body: formData, // 🚀 no headers — browser sets correct multipart boundaries
            });

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
                            placeholder={currentItem.name}
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
                        {/* {typeof currentItem.prices === 'object'
                            ? JSON.stringify(currentItem.prices)
                            : currentItem.price} */}
                        <br />
                        {/* {currentItem.description} */}
                    </div>

                </div>
            )}
        </>
    );
}
