// components/Logout.js

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "./auth"; // Adjust path as necessary

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Dispatch logout action
    dispatch(logout());
    // Redirect to login page after logout
    navigate("/authentication/sign-in");
  }, [dispatch, navigate]);

  return null; // No UI needed
};

export default Logout;
