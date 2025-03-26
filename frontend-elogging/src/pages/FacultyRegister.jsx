import React, { useState } from "react";
import axios from "axios";
import "../css/FacultyRegister.css";

const FacultyRegister = ({ onNewFaculty }) => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    middle: "",
    email: "",
    password: "",
    rfid: ""
  });
  const [isModalOpen, setModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/register-faculty", formData);
      alert(response.data.message);
      setFormData({
        firstname: "",
        lastname: "",
        middle: "",
        email: "",
        password: "",
        rfid: ""
      });
      setModalOpen(false);
      onNewFaculty(response.data.faculty); // Notify the parent component about the new faculty member
    } catch (err) {
      console.error("Error registering faculty:", err);
      alert(err.response.data.message);
    }
  };

  return (
    <div className="faculty-register-container">
      <button className="add-faculty-btn" onClick={() => setModalOpen(true)}>Add Faculty</button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
            <h2>Add Faculty</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="firstname"
                placeholder="First Name"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="middle"
                placeholder="Middle Name"
                value={formData.middle}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastname"
                placeholder="Last Name"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input 
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="rfid"
                placeholder="RFID"
                value={formData.rfid}
                onChange={handleChange}
                required
              />
              <button type="submit">Register</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyRegister;
