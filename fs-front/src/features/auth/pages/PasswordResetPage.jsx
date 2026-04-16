import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Ambos campos son requeridos.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regex.test(password)) {
      toast.error("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:8000/fs/reset-password/${token}/`, {
        password,
        confirm_password: confirmPassword,
      });

      toast.success(response.data.detail || "Contraseña actualizada correctamente.");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const msg = err.response?.data?.detail || "Error al restablecer la contraseña.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleReset} className="bg-gray-800 p-6 rounded w-full max-w-md">
        <h2 className="text-2xl mb-4">Restablecer contraseña</h2>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full p-2 bg-gray-700 rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-4 w-full p-2 bg-gray-700 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 p-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Restablecer contraseña"}
        </button>
      </form>
    </div>
  );
}
