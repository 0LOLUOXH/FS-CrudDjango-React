import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isBlocked, setIsBlocked] = useState(false);
    const [timer, setTimer] = useState(60);

    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/inicio', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Temporizador para bloqueo
    useEffect(() => {
        let interval;
        if (isBlocked) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsBlocked(false);
                        setError('');
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isBlocked]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

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
                console.log("Respuesta del backend:", data);

                const backendMessage =
                  (data.non_field_errors && data.non_field_errors[0]) ||
                  data.detail ||
                  data.message ||
                  data.error ||
                  "Error al iniciar sesión";

                if (backendMessage.toLowerCase().includes("bloqueado")) {
                  setIsBlocked(true);
                  setTimer(60);
                }

                throw new Error(backendMessage);
            }


            // Guardar el token y datos del usuario
            login(data.token, {
                'is_staff': data.is_staff,
                'user_id': data.user_id,
                'username': data.username,
            });
            navigate("/inicio");

        } catch (err) {
          toast.error(err.message || "Error al iniciar sesión");
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
                    <h2 className="text-2xl mb-4">Iniciar sesión - Fusion Solar</h2>
                    <input
                        placeholder="Nombre de usuario"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="mb-4 w-full p-2 bg-gray-700 rounded"
                        required
                        disabled={isBlocked}
                    />
                    <input
                        placeholder="Contraseña"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="mb-4 w-full p-2 bg-gray-700 rounded"
                        required
                        disabled={isBlocked}
                    />
                    {error && <p className="text-red-500">{error}</p>}
                    {isBlocked && (
                        <p className="text-yellow-400 text-sm mb-2">
                            Has sido bloqueado. Intenta de nuevo en {timer} segundos.
                        </p>
                    )}
                    <button type="submit" className="w-full bg-purple-600 p-2 rounded" disabled={isBlocked}>
                        Entrar
                    </button>
                    <p className="mt-4 text-sm">
                        ¿Olvidaste tu contraseña?{' '}
                        <a href="/reset-password" className="underline">Haz clic aquí</a>
                    </p>
                </form>
            </div>
        </div>
    );
}



