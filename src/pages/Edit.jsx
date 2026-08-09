import React, { useEffect, useState } from 'react';
import EditItemCard from '../components/EditItemCard';
import EditItemCardCharlie from '../components/EditItemCardCharlie';
import LoginComponent from '../components/LoginComponent';
import { useNavigate } from 'react-router-dom';
import { DELI_API_ROOT } from '../Constants';
import { getAuthToken, setAuthToken, clearAuthToken } from '../utils/authToken';

// const API_URL = 'https://square-deli-menu.web.app/menu';
// const API_URL = 'https://deliprojectapi-eheyg4exevd7azgd.canadaeast-01.azurewebsites.net/api/MenuItems/grouped';
const API_URL = DELI_API_ROOT + '/api/MenuItems/grouped';

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
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [isEditSandwiches, setIsEditSandwiches] = useState(false)
    const [isEditOtherMeals, setIsEditOtherMeals] = useState(false)

    const navigate = useNavigate();

    // If a token from a previous login is still saved, skip straight to the
    // admin view instead of making them log in again every time they visit
    // /edit. It's not verified against the server here — an expired/invalid
    // token just means the next PUT request will fail with 401 (handled in
    // EditItemCard.jsx/EditItemCardCharlie.jsx by logging out again).
    useEffect(() => {
        if (getAuthToken()) {
            setIsLoggedIn(true);
        }
    }, []);

    // Load sandwiches and other menu items
    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                console.log(data);
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

    const handleLogin = async (e, form) => {
        e.preventDefault();

        const { username, password } = form;

        try {
            const res = await fetch(`${DELI_API_ROOT}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const { error } = await res.json().catch(() => ({}));
                alert(error || 'Invalid credentials!');
                return;
            }

            const { token } = await res.json();
            setAuthToken(token);
            setIsLoggedIn(true);
        } catch (err) {
            console.error(err);
            alert('Login failed. Please check your connection and try again.');
        }
    };

    const handleLogout = () => {
        clearAuthToken();
        setIsLoggedIn(false);
    };



    const EditPage = () => {
        return (
            <div style={{ padding: '2rem', overflowY: 'scroll', height: '100vh' }}>
                <h1>Square Deli Menu</h1>

                <div>
                    <button className='menu-view-btn mx-4' onClick={() => navigate('/sandwiches')}>Sandwiches Menu</button>
                    <button className='menu-view-btn mx-4' onClick={() => navigate('/items')}>Other Food Menu</button>
                    <button className='menu-view-btn' onClick={handleLogout}>Logout</button>
                </div>

                <div className='show-on-large'>
                    <h2>All Sandwiches</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <ul style={{ listStyle: 'none' }}>
                                {sandwiches.map((s) => (
                                    <li key={s.id}>
                                        <EditItemCard item={s} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2>Chicken</h2>
                            <ul style={{ listStyle: 'none' }}>
                                {chickenWings.map((s) => (
                                    <li key={s.id}>
                                        <EditItemCardCharlie item={s} />
                                    </li>
                                ))}
                            </ul>
                            <h2>Pizza</h2>
                            <ul>
                                {pizza.map((s) => (
                                    <li key={s.id}>
                                        <EditItemCardCharlie item={s} />
                                    </li>
                                ))}
                            </ul>
                            <h2>Empanadas</h2>
                            <ul>
                                {empanadas.map((s) => (
                                    <li key={s.id}>
                                        <EditItemCardCharlie item={s} />
                                    </li>
                                ))}
                            </ul>
                            <h2>Yaroas</h2>
                            <ul>
                                {yaroas.map((s) => (
                                    <li key={s.id}>
                                        <EditItemCardCharlie item={s} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2>FreshJuice</h2>
                            <ul>
                                {freshJuice.map((s) => (
                                    <li key={s.id}>
                                        <EditItemCardCharlie item={s} />
                                    </li>
                                ))}
                            </ul>
                            <h2>ChilliDogs</h2>
                            <ul>
                                {chilliDogs.map((s) => (
                                    <li key={s.id}>
                                        <EditItemCardCharlie item={s} />
                                    </li>
                                ))}
                            </ul>
                            <h2>Sides</h2>
                            <ul>
                                {sides.map((s) => (
                                    <li key={s.id}>
                                        <EditItemCardCharlie item={s} />
                                    </li>
                                ))}
                            </ul>
                            <h2>Desserts</h2>
                            <ul>
                                {dessert.map((s) => (
                                    <li key={s.id}>
                                        <EditItemCardCharlie item={s} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className='show-on-mobile'>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }} className='mt-4'>
                        <button onClick={() => { setIsEditSandwiches(true); setIsEditOtherMeals(false) }}>Edit Sandwiches</button>
                        <button onClick={() => { setIsEditOtherMeals(true); setIsEditSandwiches(false) }}>Edit Other Meals</button>
                    </div>

                    {isEditSandwiches && (
                        
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "12px",
                            }}>
                                <p>TESTING...</p>
                            {
                                sandwiches.map((s) => (
                                    
                                        <EditItemCard item={s} />
                                    
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {isLoggedIn ? <EditPage /> : <LoginComponent handleLogin={handleLogin} />}
        </>
    );
}

export default Edit;
