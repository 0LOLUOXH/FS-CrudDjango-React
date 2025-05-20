import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/fs/apibd/v1/login/', { username, password });
      navigate('/clientes');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/login-image.jpg')" }}>
        <div className="p-8 text-white">
          <button className="bg-gray-700 px-4 py-2 rounded">Volver al sitio</button>
          <h1 className="mt-20 text-3xl font-bold">Captura momentos,<br />crea recuerdos</h1>
        </div>
      </div>
      <div className="w-1/2 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-3/4">
          <h2 className="text-2xl mb-4">Iniciar sesión</h2>
          <input
            placeholder="Nombre de usuario"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="mb-4 w-full p-2 bg-gray-700 rounded"
            required
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mb-4 w-full p-2 bg-gray-700 rounded"
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="w-full bg-purple-600 p-2 rounded">Entrar</button>
          <p className="mt-4 text-sm">
            ¿Olvidaste tu contraseña?{' '}
            <a href="/reset-password" className="underline">Haz clic aquí</a>
          </p>
        </form>
      </div>
    </div>
  );
}


