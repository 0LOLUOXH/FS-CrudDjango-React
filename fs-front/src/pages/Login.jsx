import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { isAuthenticated, login } = useAuth(); // Añade login del contexto
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/inicio', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/fs/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al iniciar sesión");
            }

            // Guardar el token y los datos del usuario
            console.log(data);
            login(data.token, {
              'user_id': data.user_id,
              'username': data.username,
            }); 
            navigate("/inicio");
        } catch (err) {
            setError(err.message || "Error al iniciar sesión. Inténtalo de nuevo.");
        }
    };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/login-image.jpg')" }}>
        <div className="p-8 text-white">
          <h1 className="mt-20 text-3xl font-bold">Energía renovable, <br />compromiso imparable.</h1>
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


