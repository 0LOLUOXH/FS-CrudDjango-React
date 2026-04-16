import { useState } from 'react';
import axios from 'axios';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:8000/fs/reset-password/', { email });
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded">
        <h2 className="text-xl mb-4">Reset your password</h2>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Your email" className="p-2 mb-4 w-full bg-gray-700 rounded"/>
        <button className="bg-purple-600 w-full p-2 rounded">Send reset link</button>
        {sent && <p className="mt-2 text-green-400">Check your email for the link.</p>}
      </form>
    </div>
  );
}
