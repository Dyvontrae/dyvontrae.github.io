import React from 'react';
import ReactDOM from 'react-dom/client';
import Portfolio from './Portfolio';
import AdminPanel from './components/AdminPanel';
import './index.css';

const App = () => {
  const isAdmin = window.location.pathname === '/admin';
  return isAdmin ? <AdminPanel /> : <Portfolio />;
};

// Remove the duplicate render and only keep one
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);