import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPasswordConfirm() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post(`http://localhost:8000/fs/apibd/v1/reset-password/${token}/`, {
        password,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000); // Redirige tras 3s
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700"
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700"
          required
        />
        <button type="submit" className="w-full bg-purple-600 p-2 rounded">
          Reset Password
        </button>
        {message && <p className="mt-4 text-center text-sm text-red-400">{message}</p>}
      </form>
    </div>
  );
}
