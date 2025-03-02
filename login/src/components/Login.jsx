import React, { useState } from 'react';
import './Login.css';

function Login() {
    const [userType, setUserType] = useState('student');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rollNumber: '',
        facultyId: ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUserTypeChange = (type) => {
        setUserType(type);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your login logic here
        console.log('Form submitted:', { userType, ...formData });
    };

    return (
        <div className="container">
            <div className="login-container">
                <div className="text-center mb-4">
                    <h2>ProjectHub Login</h2>
                    <p>Welcome back! Please login to continue</p>
                </div>

                {/* User Type Selection */}
                <div className="user-type-toggle mb-4">
                    <button 
                        className={`btn ${userType === 'student' ? 'active' : ''}`}
                        onClick={() => handleUserTypeChange('student')}
                    >
                        Student
                    </button>
                    <button 
                        className={`btn ${userType === 'faculty' ? 'active' : ''}`}
                        onClick={() => handleUserTypeChange('faculty')}
                    >
                        Faculty
                    </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Student-specific fields */}
                    {userType === 'student' && (
                        <div className="mb-3">
                            <label htmlFor="rollNumber" className="form-label">Roll Number</label>
                            <input
                                type="text"
                                className="form-control"
                                id="rollNumber"
                                name="rollNumber"
                                value={formData.rollNumber}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}

                    {/* Faculty-specific fields */}
                    {userType === 'faculty' && (
                        <div className="mb-3">
                            <label htmlFor="facultyId" className="form-label">Faculty ID</label>
                            <input
                                type="text"
                                className="form-control"
                                id="facultyId"
                                name="facultyId"
                                value={formData.facultyId}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}

                    <div className="mb-3 form-check">
                        <input type="checkbox" className="form-check-input" id="rememberMe" />
                        <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Login</button>

                    <div className="text-center mt-3">
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login; 