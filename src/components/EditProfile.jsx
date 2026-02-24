import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditProfile = () => {
  const user = JSON.parse(localStorage.getItem('user')); // get logged-in user
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setError('User not logged in');
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      return setError('Both fields are required');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/edit-profile/update-password/${user._id}`,
        { newPassword, confirmPassword }
      );
      setMessage(res.data.message || 'Password updated successfully');
      setFormData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed. Please try again.');
    }
  };

  if (!user) return <p className="text-red-600 text-center mt-10">User not logged in</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Edit Profile</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input
          type="text"
          value={user.username}
          readOnly
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 "
          disabled 
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={user.email}
          readOnly
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
          disabled 
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">User Type</label>
        <input
          type="text"
          value={user.type}
          readOnly
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
          disabled 
        />
      </div>

      {message && <p className="text-green-600 mb-4 text-center">{message}</p>}
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
