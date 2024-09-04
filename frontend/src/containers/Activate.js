import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { verify } from '../actions/auth';

const Activate = ({ verify }) => {
    const [verified, setVerified] = useState(false);

    // Use the useParams hook to get the parameters
    const { uid, token } = useParams();

    const verify_account = async () => {
        try {
            await verify(uid, token);
            setVerified(true);
        } catch (err) {
            // Handle errors if needed
            console.error('Verification failed', err);
        }
    };

    if (verified) {
        return <Navigate to='/' />;
    }

    return (
        <div className='container'>
            <div 
                className='d-flex flex-column justify-content-center align-items-center'
                style={{ marginTop: '200px' }}
            >
                <h1>Verify your Account:</h1>
                <button
                    onClick={verify_account}
                    style={{ marginTop: '50px' }}
                    type='button'
                    className='btn btn-primary'
                >
                    Verify
                </button>
            </div>
        </div>
    );
};

export default connect(null, { verify })(Activate);
