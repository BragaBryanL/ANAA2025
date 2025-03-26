import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Sidebar from '../components/Sidebar';
import '../css/dashboard.css';

const Dashboard = () => {
  const [facultyStatus, setFacultyStatus] = useState({ available: 0, busy: 0, offline: 0 });
  const [notifications, setNotifications] = useState([]);

  const fetchFacultyStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/faculty/status');
      const data = await response.json();
      setFacultyStatus(data);
    } catch (error) {
      console.error('Error fetching faculty status:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3001/notifications');
      const data = await response.json();
      setNotifications(data.map(notification => ({
        ...notification,
        time: new Date(notification.created_at).toLocaleString() // assuming created_at field contains the time
      })));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchFacultyStatus();
    fetchNotifications();

    const socket = io("http://localhost:3001");

    socket.on("new-faculty", (data) => {
      setNotifications((prevNotifications) => [
        {
          type: "new-faculty",
          name: data.name,
          rfid: data.rfid,
          status: data.status,
          time: data.time
        },
        ...prevNotifications,
      ]);
      fetchFacultyStatus(); // Update faculty status counts
    });

    socket.on("faculty-status-change", (data) => {
      setNotifications((prevNotifications) => [
        {
          type: "faculty-status-change",
          name: data.name,
          rfid: data.rfid,
          status: data.status,
          time: new Date().toLocaleString()
        },
        ...prevNotifications,
      ]);
      fetchFacultyStatus(); // Update faculty status counts
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="content">
        <div className="dashboard-title">Dashboard</div>
        <div className="card-container">
          <div className="card available">
            <h2>Available</h2>
            <p>{facultyStatus.available}</p>
          </div>
          <div className="card busy">
            <h2>Busy</h2>
            <p>{facultyStatus.busy}</p>
          </div>
          <div className="card offline">
            <h2>Offline</h2>
            <p>{facultyStatus.offline}</p>
          </div>
        </div>

        <div className="layout">
          <div className="notification-widget">
            <h3>Notifications</h3>
            <ul>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <li key={index}>
                    <span><strong>Name:</strong> {notification.name}</span>
                    <span><strong>RFID:</strong> {notification.rfid}</span>
                    <span><strong>Status:</strong> {notification.status}</span>
                    <span><strong>Time:</strong> {notification.time}</span>
                  </li>
                ))
              ) : (
                <li>No notifications available</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
