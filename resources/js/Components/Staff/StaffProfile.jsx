import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../css/css_of_staff/StaffProfile.css';

const StaffProfile = () => {
    const { user, token, updateUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.put(`/api/users/${user.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            updateUser(response.data.user);
            setIsEditing(false);
            window.showNotification ? 
                window.showNotification('Profile updated successfully!', 'success') : 
                alert('Profile updated successfully!');
        } catch (err) {
            console.error('Error updating profile:', err.response?.data || err.message);
            window.showNotification ? 
                window.showNotification('Failed to update profile', 'error') : 
                alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            window.showNotification ? 
                window.showNotification('New password and confirmation do not match.', 'error') : 
                alert('New password and confirmation do not match.');
            setLoading(false);
            return;
        }

        try {
            await axios.get('/sanctum/csrf-cookie', {
                withCredentials: true,
            });

            await axios.post(
                `/api/users/${user.id}/change-password`,
                passwordData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            setIsChangingPassword(false);
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
            window.showNotification ? 
                window.showNotification('Password changed successfully!', 'success') : 
                alert('Password changed successfully!');
        } catch (err) {
            console.error('Error changing password:', err.response?.data || err.message);
            window.showNotification ? 
                window.showNotification('Failed to change password', 'error') : 
                alert('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
    };

    const handleCancelPasswordChange = () => {
        setIsChangingPassword(false);
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
    };

    if (!user) {
        return <div className="container mt-5 text-center">Loading...</div>;
    }

    return (
        <div className="staff-profile-container">
            <div className="profile-header">
                <h2>Staff Profile</h2>
            </div>
            
            <div className="profile-content">
                <div className="profile-section">
                    <div className="profile-info">
                        <div className="profile-avatar">
                            <img src={user.avatar} alt="Avatar" className="avatar-img" />
                        </div>
                        <div className="profile-details">
                            <h3>{user.name}</h3>
                            <p><i className="bx bx-envelope"></i> {user.email}</p>
                            <p><i className="bx bx-phone"></i> {user.phone || 'No phone number'}</p>
                            <p><i className="bx bx-id-card"></i> Role: {user.role}</p>
                        </div>
                    </div>
                    
                    {!isEditing && !isChangingPassword && (
                        <div className="profile-actions">
                            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                            <button className="btn btn-secondary" onClick={() => setIsChangingPassword(true)}>
                                Change Password
                            </button>
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className="edit-profile-section">
                        <h3>Edit Profile</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="phone" className="form-label">Phone</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-success" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleCancelEdit}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {isChangingPassword && (
                    <div className="change-password-section">
                        <h3>Change Password</h3>
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-3">
                                <label htmlFor="current_password" className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="current_password"
                                    name="current_password"
                                    value={passwordData.current_password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="new_password" className="form-label">New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="new_password"
                                    name="new_password"
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="new_password_confirmation" className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="new_password_confirmation"
                                    name="new_password_confirmation"
                                    value={passwordData.new_password_confirmation}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-success" disabled={loading}>
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleCancelPasswordChange}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffProfile;