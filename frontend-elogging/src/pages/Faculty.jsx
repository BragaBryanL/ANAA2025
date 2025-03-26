import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import '../css/faculty.css';

const generateUserIcon = (name) => {
    const formattedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${formattedName}&background=random&size=100`;
};

const IconItem = ({ id, name, status, onStatusChange }) => {
    const getButtonStyle = (currentStatus, buttonType) => {
        if (currentStatus === buttonType) {
            switch (buttonType) {
                case 'available':
                    return { backgroundColor: '#28a745', color: 'white' }; // Green
                case 'busy':
                    return { backgroundColor: '#ff8c00', color: 'white' }; // Orange
                case 'offline':
                    return { backgroundColor: '#dc3545', color: 'white' }; // Red
                default:
                    return {};
            }
        }
        return { backgroundColor: 'white', color: 'black', border: `2px solid ${buttonType === 'available' ? '#28a745' : buttonType === 'busy' ? '#ff8c00' : '#dc3545'}` }; 
    };

    return (
        <div className="icon-item">
            <img src={generateUserIcon(name)} alt={name} className="icon-img" />
            <h3 className="icon-name">{name}</h3>
            <div className="button-container">
                <button 
                    style={getButtonStyle(status, 'available')} 
                    onClick={() => onStatusChange(id, 'available')}
                    className="circle-button"
                />
                <button 
                    style={getButtonStyle(status, 'busy')} 
                    onClick={() => onStatusChange(id, 'busy')}
                    className="circle-button"
                />
                <button 
                    style={getButtonStyle(status, 'offline')} 
                    onClick={() => onStatusChange(id, 'offline')}
                    className="circle-button"
                />
            </div>
        </div>
    );
};

const Faculty = () => {
    const [iconList, setIconList] = useState([]); 
    const [filter, setFilter] = useState("all");

    // Fetch faculty data from the backend using axios
    useEffect(() => {
        const fetchFacultyData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/faculty'); 
                console.log(response.data); // Log fetched data

                const updatedData = response.data.map(icon => {
                    // Convert the availability status to integer for accurate comparison
                    const availability = parseInt(icon.availability, 10);

                    const status = 
                        availability === 0 ? 'offline' :
                        availability === 1 ? 'available' :
                        availability === 2 ? 'busy' :
                        (console.warn(`Unknown availability: ${icon.availability}`), 'unknown'); 

                    return {
                        ...icon,
                        status
                    };
                });

                setIconList(updatedData); 
            } catch (error) {
                console.error("Error fetching faculty data:", error);
            }
        };

        fetchFacultyData();
    }, []); 

    const handleStatusChange = async (id, newStatus) => {
        // Convert status to integer for backend
        const statusCode = newStatus === 'available' ? 1 : newStatus === 'busy' ? 2 : 0;
 
        try {
            // Update status in the backend
            await axios.put(`http://localhost:3001/update-availability/${id}`, { availability: statusCode }); // Update based on availability
            
            // Update the status in local state
            setIconList(prevList =>
                prevList.map(icon => {
                    if (icon.id === id) {
                        return { ...icon, status: newStatus }; // Update the status displayed
                    }
                    return icon;
                })
            );
        } catch (error) {
            console.error("Error updating faculty status:", error);
        }
    };
     
    const filteredIcons = iconList.filter(icon => {
        if (filter === "all") return true;
        return icon.status === filter;
    });

    return (
        <div className="faculty-container">
            <Sidebar/>
            <div className="faculty-title">Faculty</div>
            <div className="filter-container">
                <label htmlFor="status-filter">Filter by Status: </label>
                <select
                    id="status-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                </select>
            </div>

            <div className="icon-row-container">
                {filteredIcons.map(icon => (
                    <IconItem
                        key={icon.id}
                        id={icon.id}
                        name={`${icon.firstname} ${icon.lastname}`} 
                        status={icon.status} 
                        onStatusChange={handleStatusChange} 
                    />
                ))}
            </div>
        </div>
    );
};

export default Faculty;