import React, { useState, useEffect } from 'react';
import { Modal, GlassCard, Badge } from './ui';
import { setup2FA, confirm2FA, disable2FA } from '../api/auth_api';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-toastify';
import { QRCode } from 'antd';

export function TwoFactorModal({ isOpen, onClose }) {
  const { user, update2FAStatus } = useUser();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para activación
  const [setupData, setSetupData] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [showManualKey, setShowManualKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados para desactivación
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableOtpCode, setDisableOtpCode] = useState('');

  // Reiniciar estados al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setSetupData(null);
      setOtpCode('');
      setShowManualKey(false);
      setCopied(false);
      setShowDisableForm(false);
      setDisablePassword('');
      setDisableOtpCode('');
    }
  }, [isOpen]);

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const res = await setup2FA();
      setSetupData(res.data);
      setShowManualKey(false);
      setOtpCode('');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Error al iniciar configuración 2FA.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      toast.success('Clave secreta copiada al portapapeles');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleConfirm2FA = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.warning('Ingresa el código de 6 dígitos emitido por tu app.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await confirm2FA(otpCode.trim());
      toast.success(res.data.message || '¡2FA activado exitosamente!');
      update2FAStatus(true);
      setSetupData(null);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Código incorrecto. Verifica la sincronización horaria.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!disablePassword) {
      toast.warning('Debes ingresar tu contraseña actual.');
      return;
    }
    if (!disableOtpCode || disableOtpCode.trim().length !== 6) {
      toast.warning('Debes ingresar tu código 2FA actual para confirmar.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await disable2FA(disablePassword, disableOtpCode.trim());
      toast.success(res.data.message || 'Doble factor desactivado.');
      update2FAStatus(false);
      setShowDisableForm(false);
      setDisablePassword('');
      setDisableOtpCode('');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Error al desactivar 2FA. Revisa las credenciales.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isEnabled = Boolean(user?.is_2fa_enabled);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seguridad de la Cuenta — Doble Factor (2FA)"
      maxWidth="560px"
    >
      <div className="space-y-5 text-[var(--text-main)] py-2">
        {/* Cabecera de Estado */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card-subtle)]">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                isEnabled
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              <i className={`fa-solid ${isEnabled ? 'fa-shield-halved' : 'fa-triangle-exclamation'}`}></i>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--text-main)]">
                {isEnabled ? '2FA Activado y Protegido' : '2FA No Configurado'}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                {isEnabled
                  ? 'Tu cuenta requiere código temporal para cada acceso.'
                  : 'Tu cuenta solo está protegida por contraseña.'}
              </p>
            </div>
          </div>
          <Badge variant={isEnabled ? 'success' : 'warning'}>
            <i className={`fa-solid ${isEnabled ? 'fa-lock' : 'fa-lock-open'} mr-1 text-[10px]`}></i>
            {isEnabled ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        {/* =========================================================================
            CASO A: 2FA ESTÁ ACTIVADO
        ========================================================================= */}
        {isEnabled && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-[var(--text-main)] space-y-2 leading-relaxed">
              <div className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 text-sm">
                <i className="fa-solid fa-circle-check"></i>
                Cumplimiento de Políticas de Seguridad
              </div>
              <p>
                Tu cuenta cumple con la directriz de <strong>Autenticación Multifactor (MFA)</strong> estipulada en las <em>Prácticas de Seguridad de la Información (ISO/IEC 27001 & NIST SP 800-63B)</em>.
              </p>
              <p className="text-[var(--text-muted)]">
                Para ingresar al sistema necesitarás tu contraseña habitual junto con el código cambiante de 6 dígitos de tu aplicación autenticadora.
              </p>
            </div>

            {!showDisableForm ? (
              <div className="pt-2 border-t border-[var(--border-glass)] flex justify-between items-center">
                <span className="text-xs text-[var(--text-muted)]">
                  ¿Deseas desvincular tu app autenticadora?
                </span>
                <button
                  type="button"
                  onClick={() => setShowDisableForm(true)}
                  className="btn btn-outline text-rose-500 hover:bg-rose-500/10 border-rose-500/30 text-xs px-3 py-1.5"
                >
                  <i className="fa-solid fa-trash-can mr-1.5"></i>
                  Desactivar 2FA
                </button>
              </div>
            ) : (
              <form onSubmit={handleDisable2FA} className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <i className="fa-solid fa-shield-xmark text-sm"></i>
                  Confirmar Desactivación de Seguridad
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Por seguridad, confirma tu contraseña actual y un código OTP activo:
                </p>

                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Contraseña actual"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    required
                    disabled={submitting}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:border-rose-500"
                  />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Código 2FA actual (6 dígitos)"
                    value={disableOtpCode}
                    onChange={(e) => setDisableOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    disabled={submitting}
                    className="w-full text-center font-mono tracking-widest text-sm px-3 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDisableForm(false)}
                    disabled={submitting}
                    className="btn btn-outline text-xs px-3 py-1.5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn text-white bg-rose-600 hover:bg-rose-700 text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Desactivando...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-lock-open"></i>
                        Confirmar Desactivación
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* =========================================================================
            CASO B: 2FA ESTÁ DESACTIVADO - WIZARD DE ACTIVACIÓN
        ========================================================================= */}
        {!isEnabled && (
          <div className="space-y-4">
            {!setupData ? (
              <div className="space-y-4 text-center py-3">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
                  El Doble Factor de Autenticación agrega una capa indispensable de seguridad. Aunque alguien descubra tu contraseña, no podrá acceder al sistema sin el código dinámico de tu teléfono.
                </p>

                <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-glass)] text-left text-xs space-y-1.5">
                  <div className="font-semibold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                    <i className="fa-solid fa-mobile-screen text-[var(--primary)]"></i>
                    Aplicaciones compatibles recomendadas:
                  </div>
                  <ul className="list-disc list-inside text-[var(--text-muted)] pl-2 space-y-0.5">
                    <li>Google Authenticator (Android / iOS)</li>
                    <li>Microsoft Authenticator (Android / iOS)</li>
                    <li>Authy o 1Password</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleStartSetup}
                  disabled={loading}
                  className="btn btn-primary w-full py-2.5 text-sm shadow-lg shadow-[var(--primary)]/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Generando clave de seguridad...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-qrcode"></i>
                      Comenzar Configuración de 2FA
                    </>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirm2FA} className="space-y-4">
                {/* Paso 1: Escanear QR */}
                <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[var(--primary)] uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center text-[11px] font-bold">1</span>
                    Escanea el código QR con tu app
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                    <div className="p-3 bg-white rounded-xl shadow-md border border-gray-200 shrink-0">
                      {setupData.qr_code ? (
                        <img
                          src={setupData.qr_code}
                          alt="Código QR TOTP"
                          className="w-36 h-36 object-contain"
                        />
                      ) : (
                        <QRCode value={setupData.otpauth_uri} size={144} />
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-[var(--text-muted)] max-w-xs text-center sm:text-left">
                      <p>
                        Abre <strong>Google Authenticator</strong> o <strong>Microsoft Authenticator</strong>, pulsa <strong>"+"</strong> y selecciona <strong>"Escanear código QR"</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowManualKey(!showManualKey)}
                        className="text-xs font-semibold text-[var(--primary)] hover:underline block cursor-pointer"
                      >
                        {showManualKey ? 'Ocultar clave manual' : '¿No puedes escanear? Ingresar clave manual'}
                      </button>
                    </div>
                  </div>

                  {showManualKey && (
                    <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-glass)] space-y-1.5 text-center">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                        Clave Secreta Base32
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <code className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-glass)] text-[var(--text-main)] tracking-widest select-all">
                          {setupData.secret}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="btn btn-outline text-xs p-1.5"
                          title="Copiar clave"
                        >
                          <i className={`fa-solid ${copied ? 'fa-check text-emerald-500' : 'fa-copy'}`}></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Paso 2: Introducir código */}
                <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[var(--primary)] uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center text-[11px] font-bold">2</span>
                    Ingresa el código de 6 dígitos para validar
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      maxLength={6}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      disabled={submitting}
                      className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-2.5 px-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                      required
                      autoFocus
                    />
                    <p className="text-[11px] text-center text-[var(--text-muted)]">
                      Ingresa el código cambiante actual que aparece en tu pantalla móvil.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-glass)]">
                  <button
                    type="button"
                    onClick={() => setSetupData(null)}
                    disabled={submitting}
                    className="btn btn-outline text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || otpCode.length !== 6}
                    className="btn btn-primary text-xs flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Verificando...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-shield-check"></i>
                        Verificar y Activar 2FA
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
