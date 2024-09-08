import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../actions/auth';
import axios from 'axios';

const Login = ({ login, isAuthenticated }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '' 
    });
    const [error, setError] = useState(null); // State to store error messages

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();

        try {
            // Make sure the URL is correct and the API endpoint is reachable
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/jwt/create/`,
                { email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            // Ensure that the response structure matches what you expect
            if (response.data && response.data.access) {
                const { access } = response.data;
                
                // Store the token in localStorage
                localStorage.setItem('token', access);
    
                // Optionally, handle successful login
                login(email, password);
            } else {
                // Handle cases where response does not have the expected data
                setError('Unexpected response format.');
            }
    
        } catch (err) {
            console.error(err); // Log the error for debugging
            setError('Login failed. Please check your credentials.');
        }
    };

   

    if (isAuthenticated) {
        return <Navigate to='/accounts' />
    }

    return (
        <div className='container mt-5'>
            <h1>Sign In</h1>
            <p>Sign into your Account</p>
            {error && <div className='alert alert-danger'>{error}</div>}
            <form onSubmit={e => onSubmit(e)}>
                <div className='form-group'>
                    <input
                        className='form-control'
                        type='email'
                        placeholder='Email'
                        name='email'
                        value={email}
                        onChange={e => onChange(e)}
                        required
                    />
                </div>
                <div className='form-group'>
                    <input
                        className='form-control'
                        type='password'
                        placeholder='Password'
                        name='password'
                        value={password}
                        onChange={e => onChange(e)}
                        minLength='6'
                        required
                    />
                </div>
                <button className='btn btn-primary' type='submit'>Login</button>
            </form>
       
            <p className='mt-3'>
                Don't have an account? <Link to='/signup'>Sign Up</Link>
            </p>
            <p className='mt-3'>
                Forgot your Password? <Link to='/reset-password'>Reset Password</Link>
            </p>
        </div>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { login })(Login);
