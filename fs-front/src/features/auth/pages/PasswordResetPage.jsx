import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { GlassCard, FloatingInput } from '../../../components/ui';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'react-toastify';

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();

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
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.detail || "Error al restablecer la contraseña. El enlace puede haber expirado.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-500 p-4 relative">
      {/* Botón alternar tema */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Cambiar tema"
        className="absolute top-6 right-6 z-30 p-2.5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--primary)]/15 transition-all shadow-md"
      >
        <i className={`fa-solid ${isDark ? 'fa-sun text-amber-400 rotate-180' : 'fa-moon text-indigo-500'} text-lg transition-transform duration-500`}></i>
      </button>

      <div className="w-full max-w-md space-y-6">
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] text-2xl mb-2">
            <i className="fa-solid fa-shield-keyhole"></i>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
            Nueva Contraseña
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Define una contraseña segura para restablecer el acceso a tu cuenta.
          </p>
        </div>

        {/* Tarjeta de Formulario Glass */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative">
              <FloatingInput
                label="Nueva Contraseña"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                icon={<i className="fa-solid fa-lock text-sm"></i>}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] p-1"
                tabIndex={-1}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
              </button>
            </div>

            <FloatingInput
              label="Confirmar Contraseña"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              icon={<i className="fa-solid fa-lock-check text-sm"></i>}
            />

            <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-glass)] text-[11px] text-[var(--text-muted)] space-y-1">
              <p className="font-semibold text-[var(--text-main)]">Requisitos de seguridad:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Mínimo 8 caracteres</li>
                <li>Al menos una mayúscula y una minúscula</li>
                <li>Al menos un número</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base shadow-lg shadow-[var(--primary)]/20"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Actualizando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check mr-2"></i>
                  Restablecer Contraseña
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[var(--border-glass)] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              <i className="fa-solid fa-arrow-left text-[10px]"></i>
              Volver a Iniciar Sesión
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
