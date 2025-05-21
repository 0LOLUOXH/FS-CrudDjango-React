import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/fs/reset-password/${token}/`, {
        password
      });
      setMessage('Password changed successfully!');
      setTimeout(() => navigate('/login'), 3000); // Redirige tras 3s
    } catch (err) {
      setMessage('Error resetting password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleReset} className="bg-gray-800 p-6 rounded">
        <h2 className="text-2xl mb-4">Reset your password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full p-2 bg-gray-700 rounded"
        />
        <button type="submit" className="w-full bg-purple-600 p-2 rounded">
          Reset Password
        </button>
        {message && <p className="mt-4">{message}</p>}
      </form>
    </div>
  );
}
