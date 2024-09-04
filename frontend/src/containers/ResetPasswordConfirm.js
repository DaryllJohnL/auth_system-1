import React, { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import { reset_password_confirm } from '../actions/auth';

const ResetPasswordConfirm = ({ reset_password_confirm }) => {
    const [requestSent, setRequestSent] = useState(false);
    const [formData, setFormData] = useState({
        new_password: '',
        re_new_password: ''
    });
    const [error, setError] = useState(null); // State to store error messages

    const { new_password, re_new_password } = formData;

    // Use useParams to get uid and token from the URL
    const { uid, token } = useParams();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();

        if (new_password !== re_new_password) {
            setError('Passwords do not match.');
            return;
        }
        console.log('Form Data:', { uid, token, new_password, re_new_password });
        try {
            // Perform the password reset request
            await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/users/reset_password_confirm/`,
                { uid, token, new_password,re_new_password },
                { headers: { 'Content-Type': 'application/json' } }
            );

            // Call the Redux action (optional, depending on your setup)
            reset_password_confirm(uid, token, new_password, re_new_password);
            setRequestSent(true);
        } catch (err) {
            setError('Password reset failed. Please try again.');
        }
    };

    if (requestSent) {
        return <Navigate to='/' />
    }

    return (
        <div className='container mt-5'>
            <h1>Reset Your Password</h1>
            {error && <div className='alert alert-danger'>{error}</div>}
            <form onSubmit={e => onSubmit(e)}>
                <div className='form-group'>
                    <input
                        className='form-control'
                        type='password'
                        placeholder='New Password'
                        name='new_password'
                        value={new_password}
                        onChange={e => onChange(e)}
                        minLength='6'
                        required
                    />
                </div>
                <div className='form-group'>
                    <input
                        className='form-control'
                        type='password'
                        placeholder='Confirm New Password'
                        name='re_new_password'
                        value={re_new_password}
                        onChange={e => onChange(e)}
                        minLength='6'
                        required
                    />
                </div>
                <button className='btn btn-primary' type='submit'>Reset Password</button>
            </form>
        </div>
    );
};

export default connect(null, { reset_password_confirm })(ResetPasswordConfirm);
