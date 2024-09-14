import React from 'react';
import ReactDOM from 'react-dom/client'; // Note the updated import path

import App from './App';

// Create a root for rendering the app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component using the new root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);