import React, { useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { connect } from 'react-redux';
import { checkAuthenticated, load_user } from '../actions/auth';

const Layout = ({ checkAuthenticated, load_user, children }) => {
    const authenticateAndLoadUser = useCallback(() => {
        checkAuthenticated();
        load_user();
    }, [checkAuthenticated, load_user]);

    useEffect(() => {
        authenticateAndLoadUser();
    }, [authenticateAndLoadUser]);

    return (
        <div>
            <Navbar />
            {children}
        </div>
    );
};

export default connect(null, { checkAuthenticated, load_user })(Layout);
