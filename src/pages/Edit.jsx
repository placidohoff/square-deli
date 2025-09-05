import React, { useEffect, useState } from 'react';
import EditItemCard from '../components/EditItemCard';
import EditItemCardBravo from '../components/EditItemCardBravo';

const API_URL = 'http://localhost:5000/menu';

function Edit() {
    const [sandwiches, setSandwiches] = useState([]);
    const [chickenWings, setChickenWings] = useState([]);
    const [pizza, setPizza] = useState([]);
    const [empanadas, setEmpanadas] = useState([]);
    const [yaroas, setYaroas] = useState([]);
    const [freshJuice, setFreshJuice] = useState([]);
    const [chilliDogs, setChilliDogs] = useState([]);
    const [sides, setSides] = useState([]);
    const [dessert, setDessert] = useState([]);

    const [form, setForm] = useState({ name: '', description: '', price: '' });

    // Load sandwiches
    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                // console.log(data)
                setSandwiches(data.sandwiches || []);
                setChickenWings(data.chickenWings || []);
                setPizza(data.pizza || []);
                setEmpanadas(data.empanadas || []);
                setYaroas(data.yaroa || []);
                setFreshJuice(data.freshJuice || []);
                setChilliDogs(data.chilliDogs || []);
                setSides(data.sides || []);
                setDessert(data.desserts || []);
            });
    }, []);

    // Add new sandwich
    const handleAdd = async () => {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.name,
                description: form.description,
                prices: parseFloat(form.price),
                image: 'placeholder.png'
            }),
        });

        const newSandwich = await res.json();
        setSandwiches([...sandwiches, newSandwich]);
        setForm({ name: '', description: '', price: '' });
    };



    return (
        <div style={{ padding: '2rem' }}>
            <h1>Sandwich Menu</h1>

            <h2>Add Sandwich</h2>
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <button onClick={handleAdd}>Add</button>

            <h2>All Sandwiches</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <ul style={{ listStyle: 'none' }}>
                        {sandwiches.map(s => (
                            <li key={s.id}>
                                <EditItemCard
                                    item={s}
                                />

                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2>Chicken</h2>
                    <ul style={{ listStyle: 'none' }}>
                        {chickenWings.map(s => (
                            <li key={s.id}>
                                <EditItemCardBravo
                                    item={s}
                                />

                            </li>
                        ))}
                    </ul>
                    <h2>Pizza</h2>
                    <ul>
                        {pizza.map(s => (
                            <li key={s.id}>
                                <EditItemCardBravo
                                    item={s}
                                />

                            </li>
                        ))}
                    </ul>
                    <h2>Empanadas</h2>
                    <ul>
                        {empanadas.map(s => (
                            <li key={s.id}>
                                <EditItemCardBravo
                                    item={s}
                                />

                            </li>
                        ))}
                    </ul>
                    <h2>Yaroas</h2>
                    <ul>
                        {yaroas.map(s => (
                            <li key={s.id}>
                                <EditItemCardBravo
                                    item={s}
                                />

                            </li>
                        ))}
                    </ul>
                    
                </div>
                <div>
                    <h2>FreshJuice</h2>
                    <ul>
                        {freshJuice.map(s => (
                            <li key={s.id}>
                                <EditItemCardBravo
                                    item={s}
                                />

                            </li>
                        ))}
                    </ul>
                    <h2>ChilliDogs</h2>
                    <ul>
                        {chilliDogs.map(s => (
                            <li key={s.id}>
                                <EditItemCardBravo
                                    item={s}
                                />

                            </li>
                        ))}
                    </ul>
                    <h2>Sides</h2>
                    <ul>
                        {sides.map(s => (
                            <li key={s.id}>
                                <EditItemCardBravo
                                    item={s}
                                />

                            </li>
                        ))}
                    </ul>
                    <h2>Desserts</h2>
                    <ul>
                        {dessert.map(s => (
                            <li key={s.id}>
                                <EditItemCardBravo
                                    item={s}
                                />

                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
}

export default Edit;
