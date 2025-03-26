import React from "react";
import { Link } from "react-router-dom";
import "../css/Homepage.css";

const Homepage = () => {
  return (
    <div className="homepage-container">
      {}
      <div className="left-panel">
        <h1 className="title">ANAA SYS</h1>
        <p className="subtitle">Availability Notification and Alerting System</p>
        <div className="icon">
        <img src={require('../assets/anaa_syslogo.jpg')} alt="ANAA System Logo" style={{ width: 190, height: 150 }} />
        </div>
      </div>

      {}
      <div className="right-panel">
        <h2 className="login-title">Login</h2>
        <form className="login-form">
          <div className="input-container">
            <input type="text" placeholder="Username" className="input-field" />
          </div>
          <div className="input-container">
            <input type="password" placeholder="Password" className="input-field" />
            <div className="password-toggle">
              <i className="fa fa-eye"></i> {}
            </div>
          </div>
          <div className="login-actions">
            <Link to="/dashboard" className="login-button">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Homepage;
