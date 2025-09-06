import React, { useEffect, useState } from 'react';
import EditItemCard from '../components/EditItemCard';
import EditItemCardBravo from '../components/EditItemCardBravo';
import LoginComponent from '../components/LoginComponent';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://square-deli-menu.web.app/menu';

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
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [form, setForm] = useState({
        username: '',
        password: '',
    });

    const navigate = useNavigate();
    // Load sandwiches and other menu items
    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
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

    const handleLogin = (e, form) => {
        e.preventDefault();

        const { username, password } = form;

        if (username === 'admin1' && password === 'admin789') {
            setIsLoggedIn(true);
        } else {
            alert("Invalid credentials!");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target; // Get name and value of the input
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value, // Update the specific field in form state
        }));
    };



    const EditPage = () => {
        return (
            <div style={{ padding: '2rem' }}>
                <h1>Square Deli Menu</h1>

                <div>
                    <button className='menu-view-btn mx-4' onClick={() => navigate('/sandwiches')}>Sandwiches Menu</button>
                    <button className='menu-view-btn' onClick={() => navigate('/items')}>Other Food Menu</button>
                </div>

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
                                    <EditItemCardBravo item={s} />
                                </li>
                            ))}
                        </ul>
                        <h2>Pizza</h2>
                        <ul>
                            {pizza.map((s) => (
                                <li key={s.id}>
                                    <EditItemCardBravo item={s} />
                                </li>
                            ))}
                        </ul>
                        <h2>Empanadas</h2>
                        <ul>
                            {empanadas.map((s) => (
                                <li key={s.id}>
                                    <EditItemCardBravo item={s} />
                                </li>
                            ))}
                        </ul>
                        <h2>Yaroas</h2>
                        <ul>
                            {yaroas.map((s) => (
                                <li key={s.id}>
                                    <EditItemCardBravo item={s} />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2>FreshJuice</h2>
                        <ul>
                            {freshJuice.map((s) => (
                                <li key={s.id}>
                                    <EditItemCardBravo item={s} />
                                </li>
                            ))}
                        </ul>
                        <h2>ChilliDogs</h2>
                        <ul>
                            {chilliDogs.map((s) => (
                                <li key={s.id}>
                                    <EditItemCardBravo item={s} />
                                </li>
                            ))}
                        </ul>
                        <h2>Sides</h2>
                        <ul>
                            {sides.map((s) => (
                                <li key={s.id}>
                                    <EditItemCardBravo item={s} />
                                </li>
                            ))}
                        </ul>
                        <h2>Desserts</h2>
                        <ul>
                            {dessert.map((s) => (
                                <li key={s.id}>
                                    <EditItemCardBravo item={s} />
                                </li>
                            ))}
                        </ul>
                    </div>
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
