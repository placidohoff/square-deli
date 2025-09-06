import React, { useState } from 'react';

const LoginComponent = ({ handleLogin }) => {
    const [form, setForm] = useState({
        username: '',
        password: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    return (
        <>
            <h2>Login</h2>
            <form onSubmit={(e) => handleLogin(e, form)}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleInputChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleInputChange}
                />
                <button type="submit">Login</button>
            </form>
        </>
    );
};

export default LoginComponent;
