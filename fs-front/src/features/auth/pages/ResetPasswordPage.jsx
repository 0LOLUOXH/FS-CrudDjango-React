import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { GlassCard, FloatingInput } from '../../../components/ui';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'react-toastify';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/fs/reset-password/', { email });
      setSent(true);
      toast.success("Enlace de restablecimiento enviado a tu correo");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Error al solicitar restablecimiento");
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
            <i className="fa-solid fa-envelope-open-text"></i>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
            Recuperar Contraseña
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Ingresa el correo electrónico asociado a tu cuenta para recibir el enlace de recuperación.
          </p>
        </div>

        {/* Tarjeta de Formulario Glass */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          {sent ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 space-y-2 text-center">
              <i className="fa-solid fa-circle-check text-3xl"></i>
              <h3 className="font-bold text-base">¡Correo Enviado!</h3>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las instrucciones para crear una nueva contraseña.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <FloatingInput
                label="Correo Electrónico"
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                icon={<i className="fa-solid fa-at text-sm"></i>}
              />

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 text-base shadow-lg shadow-[var(--primary)]/20"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Enviando enlace...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane mr-2"></i>
                    Enviar Enlace de Recuperación
                  </>
                )}
              </button>
            </form>
          )}

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
