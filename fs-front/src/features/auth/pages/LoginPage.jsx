import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { GlassCard, FloatingInput } from '../../../components/ui';
import { toast } from 'react-toastify';
import { defaultApi } from '../../../api/axiosInstance';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isBlocked, setIsBlocked] = useState(false);
    const [timer, setTimer] = useState(60);
    const [submitting, setSubmitting] = useState(false);

    const { isAuthenticated, login } = useUser();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Temporizador para bloqueo por intentos fallidos
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
        setSubmitting(true);

        try {
            const response = await defaultApi.post("login/", { username, password });
            const data = response.data;

            // Guardar datos seguros del usuario en UserContext (cookie HttpOnly gestionada por el navegador)
            login({
                'is_staff': data.is_staff,
                'user_id': data.user_id,
                'username': data.username,
                'email': data.email,
            });
            toast.success(`¡Bienvenido, ${data.username}!`);
            navigate("/home", { replace: true });

        } catch (err) {
            const data = err.response?.data || {};
            const backendMessage =
                (data.non_field_errors && data.non_field_errors[0]) ||
                data.detail ||
                data.message ||
                data.error ||
                err.message ||
                "Error al iniciar sesión. Verifique sus credenciales.";

            if (typeof backendMessage === 'string' && backendMessage.toLowerCase().includes("bloqueado")) {
                setIsBlocked(true);
                setTimer(60);
            }

            setError(typeof backendMessage === 'string' ? backendMessage : JSON.stringify(backendMessage));
            toast.error(typeof backendMessage === 'string' ? backendMessage : "Error al iniciar sesión");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-500 relative">
            {/* Botón flotante para alternar tema */}
            <button
                type="button"
                onClick={toggleTheme}
                aria-label="Cambiar tema"
                className="absolute top-6 right-6 z-30 p-2.5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--primary)]/15 transition-all shadow-md"
            >
                <i className={`fa-solid ${isDark ? 'fa-sun text-amber-400 rotate-180' : 'fa-moon text-indigo-500'} text-lg transition-transform duration-500`}></i>
            </button>

            {/* Panel Hero Izquierdo (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#121518] via-[#1E232A] to-[#0D1013] text-white">
                {/* Patrón decorativo solar / mesh */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#F28C28_1px,transparent_1px)] [background-size:24px_24px]"></div>
                
                {/* Sol radial decorativo */}
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#F28C28]/20 blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#3B82F6]/15 blur-3xl pointer-events-none"></div>

                {/* Logo & Marca */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#F28C28] flex items-center justify-center text-white text-xl shadow-lg shadow-[#F28C28]/30">
                        <i className="fa-solid fa-solar-panel"></i>
                    </div>
                    <div>
                        <span className="text-xl font-bold tracking-tight text-white">Fusion Solar</span>
                        <span className="block text-xs font-semibold text-[#F28C28] uppercase tracking-wider">ERP Platform</span>
                    </div>
                </div>

                {/* Mensaje Inspiracional Central */}
                <div className="relative z-10 max-w-md space-y-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F28C28]/15 text-[#F28C28] border border-[#F28C28]/30">
                        <i className="fa-solid fa-bolt text-[10px]"></i>
                        Energía Limpia & Gestión Integral
                    </span>
                    <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight text-white">
                        Energía renovable, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F28C28] to-amber-300">
                            compromiso imparable.
                        </span>
                    </h1>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Control unificado de inventario fotovoltaico, gestión de compras y ventas, trazabilidad de clientes y métricas operativas en tiempo real.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div className="space-y-1">
                            <span className="text-xs text-gray-400">Eficiencia Operativa</span>
                            <div className="text-xl font-bold text-white flex items-center gap-1.5">
                                <i className="fa-solid fa-shield-halved text-emerald-400 text-sm"></i>
                                99.9%
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-gray-400">Trazabilidad Total</span>
                            <div className="text-xl font-bold text-white flex items-center gap-1.5">
                                <i className="fa-solid fa-cubes text-[#F28C28] text-sm"></i>
                                Multi-Bodega
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pie de Marca */}
                <div className="relative z-10 text-xs text-gray-400 flex items-center justify-between">
                    <span>&copy; {new Date().getFullYear()} Fusion Solar Inc.</span>
                    <span>v2.0 • Prototipo Oficial</span>
                </div>
            </div>

            {/* Panel Formulario Derecho */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-md space-y-8">
                    {/* Cabecera en Móvil */}
                    <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white text-lg shadow-md shadow-[var(--primary)]/30">
                            <i className="fa-solid fa-solar-panel"></i>
                        </div>
                        <span className="text-2xl font-bold text-[var(--text-main)]">Fusion Solar</span>
                    </div>

                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
                            Iniciar Sesión
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                            Ingresa tus credenciales autorizadas para acceder al portal
                        </p>
                    </div>

                    {/* Tarjeta de Formulario Glass */}
                    <GlassCard className="p-6 sm:p-8 space-y-6">
                        {error && !isBlocked && (
                            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-xs font-medium">
                                <i className="fa-solid fa-circle-exclamation text-base shrink-0"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        {isBlocked && (
                            <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 space-y-1">
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    <i className="fa-solid fa-lock text-base"></i>
                                    <span>Acceso bloqueado temporalmente</span>
                                </div>
                                <p className="text-xs">
                                    Has superado el límite de intentos. Podrás reintentar en:
                                </p>
                                <div className="text-2xl font-mono font-bold pt-1 text-center">
                                    00:{timer < 10 ? `0${timer}` : timer}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <FloatingInput
                                label="Nombre de Usuario"
                                name="username"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                disabled={isBlocked || submitting}
                                icon={<i className="fa-solid fa-user text-sm"></i>}
                            />

                            <div className="relative">
                                <FloatingInput
                                    label="Contraseña"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    disabled={isBlocked || submitting}
                                    icon={<i className="fa-solid fa-lock text-sm"></i>}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1"
                                    tabIndex={-1}
                                >
                                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                </button>
                            </div>

                            <div className="flex justify-end">
                                <Link
                                    to="/reset-password"
                                    className="text-xs font-medium text-[var(--primary)] hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isBlocked || submitting}
                                className="btn btn-primary w-full py-3 text-base shadow-lg shadow-[var(--primary)]/20"
                            >
                                {submitting ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                        Ingresando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-arrow-right-to-bracket mr-2"></i>
                                        Entrar al Sistema
                                    </>
                                )}
                            </button>
                        </form>
                    </GlassCard>

                    <p className="text-center text-xs text-[var(--text-muted)]">
                        Fusion Solar ERP • Acceso seguro protegido con cookies HttpOnly y SameSite
                    </p>
                </div>
            </div>
        </div>
    );
}
