import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginComponent = ({ handleLogin }) => {
    const [form, setForm] = useState({
        username: '',
        password: '',
    });

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    // ✅ Styles
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'Arial, sans-serif',
        },
        title: {
            marginBottom: '1rem',
            fontSize: '1.5rem',
            marginTop: '40px'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            width: '250px',
            gap: '10px',
        },
        input: {
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '14px',
        },
        loginButton: {
            padding: '8px',
            backgroundColor: '#007bff', // blue
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        },
        navButton: {
            padding: '8px',
            backgroundColor: '#28a745', // green
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        },
        navButtonTop: {
            padding: '8px',
            backgroundColor: '#28a745', // green
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Login</h2>
            <form
                style={styles.form}
                onSubmit={(e) => handleLogin(e, form)}
            >
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleInputChange}
                    style={styles.input}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleInputChange}
                    style={styles.input}
                />
                {/* Login button */}
                <button type="submit" style={styles.loginButton}>
                    Login
                </button>

                
                    {/* Navigation buttons */}
                    <button
                        type="button"
                        style={styles.navButtonTop}
                        onClick={() => navigate('/sandwiches')}
                    >
                        Sandwiches
                    </button>
                    <button
                        type="button"
                        style={styles.navButton}
                        onClick={() => navigate('/items')}
                    >
                        More Items
                    </button>

            </form>
        </div>
    );
};

export default LoginComponent;
