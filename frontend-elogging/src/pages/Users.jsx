import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/users.css';
import Sidebar from '../components/Sidebar';
import FacultyRegister from './FacultyRegister';

const Users = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Fetch users from the backend
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/faculty');
                setUsers(response.data);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, []);

    const handleNewFaculty = (newFaculty) => {
        // Check if the new faculty member already exists in the users list
        const exists = users.some(user => user.user_id === newFaculty.user_id);
        if (!exists) {
            // Update the users list with the new faculty member
            setUsers(prevUsers => [
                ...prevUsers,
                {
                    user_id: newFaculty.user_id,
                    firstname: newFaculty.firstname,
                    middle: newFaculty.middle,
                    lastname: newFaculty.lastname,
                    email: newFaculty.email,
                    rfid: newFaculty.rfid,
                    status: newFaculty.status
                }
            ]);
        }
    };

    const toggleUserStatus = async (id) => {
        try {
            await axios.put(`http://localhost:3001/faculty/${id}/toggle-status`);
            setUsers(users.map(user =>
                user.user_id === id ? { ...user, status: user.status === 1 ? 0 : 1 } : user
            ));
        } catch (err) {
            console.error('Error toggling user status:', err);
        }
    };

    const deleteUser = async (id) => {
        console.log(`Deleting user with id: ${id}`);
        try {
            await axios.delete(`http://localhost:3001/faculty/${id}`);
            setUsers(users.filter(user => user.user_id !== id));
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    };

    return (
        <div className="users-container">
            <Sidebar />
            <div className="users-title">Faculty</div>
            <FacultyRegister onNewFaculty={handleNewFaculty} />
            <table className="users-table">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Middle Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>RFID</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.user_id}>
                            <td>{user.firstname}</td>
                            <td>{user.middle}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            <td>{user.rfid}</td>
                            <td>{user.status === 1 ? 'Active' : 'Disabled'}</td>
                            <td>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button onClick={() => toggleUserStatus(user.user_id)}>
                                {user.status === 1 ? 'Disable' : 'Enable'}
                                </button>
                                <button onClick={() => deleteUser(user.user_id)}>
                                Delete
                                </button>
                            </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Users;