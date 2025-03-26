// Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import '../css/sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
            <img src={require('../assets/anaa_syslogo.jpg')} alt="ANAA System Logo" style={{ width: 65, height: 50 }} />
                <h2 className="system-name">ANAA Sys</h2>
            </div>
            <ul>
                <li>
                    <span role="img" aria-label="dashboard">🏠</span>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <span role="img" aria-label="users">📚</span>
                    <Link to="/users">Users</Link>
                </li>
                <li>
                    <span role="img" aria-label="faculty">👩‍🏫</span>
                    <Link to="/faculty">Faculty</Link>
                </li>                
                <li class="logout-button">
                    <span role="img" aria-label="logout">🚪</span>
                    <Link to="/homepage">Logout</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
