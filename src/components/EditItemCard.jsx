import React, { useState } from 'react';
import axios from 'axios';
import { DELI_API_ROOT } from '../Constants';

const EDIT_API =  DELI_API_ROOT + '/api/MenuItems';
// const EDIT_API = 'https://deliprojectapi-eheyg4exevd7azgd.canadaeast-01.azurewebsites.net/api/MenuItems';
// const API_URL = 'https://square-deli-menu.web.app/sandwiches';
// const UPLOAD_URL = 'https://square-deli-menu.web.app/upload-image';

export default function EditItemCard({ item }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(item);
    const [selectedImage, setSelectedImage] = useState(null);

    const [form, setForm] = useState({
        name: item.name,
        description: item.description,
        prices: Array.isArray(item.prices) ? item.prices : [],
    });

    const [name, setName] = useState(item.name || '');
    const [description, setDescription] = useState(item.description || '');
    const [basePrice, setBasePrice] = useState(item.basePrice || '');
    const [prices, setPrices] = useState(Array.isArray(item.prices) ? item.prices : []);
    const [sizeLargePrice, setSizeLargePrice] = useState(prices[0]?.price || '');
    const [sizeSmallPrice, setSizeSmallPrice] = useState(prices[1]?.price || '');
    const [file, setFile] = useState(null);

    const handleEditSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append("Id", currentItem.id);
            formData.append("Name", name);
            formData.append("BasePrice", basePrice);

            if (description) {
                formData.append("Description", description);
            }

            if (Array.isArray(prices)) {
                prices.forEach((p, index) => {
                    formData.append(`Prices[${index}].Size`, p.size);
                    formData.append(`Prices[${index}].Price`, p.price);
                });
            }

            if (file) {
                formData.append("File", file);
            }

            const res = await fetch(`${EDIT_API}/${currentItem.id}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to update item");

            const updatedItem = await res.json();
            setCurrentItem(updatedItem);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Update failed. Please check your input.");
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
                                placeholder={currentItem.basePrice ? currentItem.basePrice : 'None'}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={sizeLargePrice}
                                    onChange={(e) => setSizeLargePrice(e.target.value)}
                                    placeholder={currentItem.prices?.[0]?.price || 'None'}
                                />
                                <input
                                    type="text"
                                    value={sizeSmallPrice}
                                    onChange={(e) => setSizeSmallPrice(e.target.value)}
                                    placeholder={currentItem.prices?.[1]?.price || 'None'}
                                />
                            </div>
                            <br />
                            <div>
                                <img
                                    style={{ maxWidth: '300px' }}
                                    className='img-fluid'
                                    src={currentItem.imageUrl}
                                    alt="Menu item"
                                />
                                <br />
                                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                            </div>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
                            <button style={{marginBottom: '10px'}} className='btn-save' onClick={handleEditSubmit}>Save</button>
                            <button className='btn-cancel' onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
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
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <div style={{ width: '80%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <strong>{currentItem.name}:</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                                {currentItem.basePrice
                                    ? <span>${currentItem.basePrice.toFixed(2)}</span>
                                    : currentItem.prices.map((p, idx) => (
                                        <span key={idx}>
                                            {p.size}: ${p.price.toFixed(2)}
                                        </span>
                                    ))
                                }
                            </div>
                        </div>
                        <br />
                        <div style={{ width: '90%' }}>
                            {currentItem.description}
                        </div>
                    </div>
                    <div>
                        <img
                            style={{ maxWidth: '100px' }}
                            className='img-fluid'
                            src={currentItem.imageUrl}
                            alt="Menu item"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
