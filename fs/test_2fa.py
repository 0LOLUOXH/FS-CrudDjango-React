from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import status
from fs.api.totp import generate_totp_code, generate_totp_secret, verify_totp_code
from fs.models.user import AuditLog

User = get_user_model()

class TwoFactorAuthenticationTest(TestCase):
    """
    Pruebas integrales de Seguridad para Autenticación de Doble Factor (2FA / RFC 6238 TOTP)
    Alineado con ISO/IEC 27001 & NIST SP 800-63B.
    """

    def setUp(self):
        cache.clear()
        self.client = Client()
        self.password = "SecurePassword123!"
        self.user = User.objects.create_user(
            username="security_admin",
            email="admin@fusionsolar.local",
            password=self.password,
            is_staff=True
        )

    def test_01_setup_2fa_generates_secret_and_qr(self):
        """Setup 2FA debe generar secreto Base32, URI otpauth:// y código QR Data URI"""
        self.client.force_login(self.user)
        res = self.client.post('/fs/2fa/setup/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('secret', res.data)
        self.assertIn('otpauth_uri', res.data)
        self.assertIn('qr_code', res.data)
        self.assertEqual(len(res.data['secret']), 32)
        self.assertTrue(res.data['otpauth_uri'].startswith('otpauth://totp/'))
        self.assertTrue(res.data['qr_code'].startswith('data:image/png;base64,'))

    def test_02_confirm_2fa_with_invalid_code_fails(self):
        """Confirm 2FA con código incorrecto debe ser rechazado con HTTP 400"""
        self.client.force_login(self.user)
        self.client.post('/fs/2fa/setup/')

        res = self.client.post('/fs/2fa/confirm/', {'otp_code': '000000'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_2fa_enabled)

    def test_03_confirm_2fa_with_valid_code_activates_and_logs(self):
        """Confirm 2FA con código TOTP válido activa 2FA y genera registro en AuditLog"""
        self.client.force_login(self.user)
        setup_res = self.client.post('/fs/2fa/setup/')
        secret = setup_res.data['secret']

        valid_code = generate_totp_code(secret)
        confirm_res = self.client.post('/fs/2fa/confirm/', {'otp_code': valid_code})
        self.assertEqual(confirm_res.status_code, status.HTTP_200_OK)
        self.assertTrue(confirm_res.data.get('is_2fa_enabled'))

        self.user.refresh_from_db()
        self.assertTrue(self.user.is_2fa_enabled)
        self.assertEqual(self.user.otp_secret, secret)

        # Verificar AuditLog
        audit = AuditLog.objects.filter(user=self.user, action="SECURITY_2FA_ENABLED").first()
        self.assertIsNotNone(audit, "No se generó AuditLog para activación de 2FA")

    def test_04_login_flow_with_2fa_challenge(self):
        """Flujo de login: credenciales válidas devuelven temp_token si 2FA está activo"""
        secret = generate_totp_secret()
        self.user.otp_secret = secret
        self.user.is_2fa_enabled = True
        self.user.save()

        # Paso 1: Login con contraseña
        res = self.client.post('/fs/login/', {
            'username': self.user.username,
            'password': self.password
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data.get('requires_2fa'))
        self.assertIn('temp_token', res.data)
        temp_token = res.data['temp_token']

        # Paso 2: Código inválido
        verify_fail = self.client.post('/fs/login/2fa-verify/', {
            'temp_token': temp_token,
            'otp_code': '999999'
        })
        self.assertEqual(verify_fail.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('restantes', verify_fail.data.get('detail', '').lower())

        # Paso 3: Código válido emite cookie HttpOnly
        valid_otp = generate_totp_code(secret)
        verify_ok = self.client.post('/fs/login/2fa-verify/', {
            'temp_token': temp_token,
            'otp_code': valid_otp
        })
        self.assertEqual(verify_ok.status_code, status.HTTP_200_OK)
        self.assertIn('auth_token', verify_ok.cookies)
        self.assertTrue(verify_ok.cookies['auth_token']['httponly'])

    def test_05_brute_force_on_2fa_cancels_challenge(self):
        """Mitigación de fuerza bruta en desafío 2FA cancela el desafío tras 5 intentos fallidos"""
        secret = generate_totp_secret()
        self.user.otp_secret = secret
        self.user.is_2fa_enabled = True
        self.user.save()

        res = self.client.post('/fs/login/', {
            'username': self.user.username,
            'password': self.password
        })
        temp_token = res.data['temp_token']

        # Enviar 4 intentos erróneos
        for _ in range(4):
            res_fail = self.client.post('/fs/login/2fa-verify/', {
                'temp_token': temp_token,
                'otp_code': '123456'
            })
            self.assertEqual(res_fail.status_code, status.HTTP_401_UNAUTHORIZED)
            self.assertIn('restantes', res_fail.data.get('detail', '').lower())

        # El 5to intento erróneo cancela el desafío
        fifth_res = self.client.post('/fs/login/2fa-verify/', {
            'temp_token': temp_token,
            'otp_code': '123456'
        })
        self.assertEqual(fifth_res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('cancelado', fifth_res.data.get('detail', '').lower())

        # Un 6to intento ya no encuentra el token en cache porque fue eliminado
        sixth_res = self.client.post('/fs/login/2fa-verify/', {
            'temp_token': temp_token,
            'otp_code': '123456'
        })
        self.assertEqual(sixth_res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('expirado', sixth_res.data.get('detail', '').lower())

    def test_06_disable_2fa_requires_password_and_otp(self):
        """Desactivación de 2FA requiere contraseña actual y código OTP válido"""
        secret = generate_totp_secret()
        self.user.otp_secret = secret
        self.user.is_2fa_enabled = True
        self.user.save()
        self.client.force_login(self.user)

        # 1. Con contraseña incorrecta
        res_bad_pw = self.client.post('/fs/2fa/disable/', {
            'password': 'WrongPassword123!',
            'otp_code': generate_totp_code(secret)
        })
        self.assertEqual(res_bad_pw.status_code, status.HTTP_401_UNAUTHORIZED)

        # 2. Con código OTP incorrecto
        res_bad_otp = self.client.post('/fs/2fa/disable/', {
            'password': self.password,
            'otp_code': '000000'
        })
        self.assertEqual(res_bad_otp.status_code, status.HTTP_401_UNAUTHORIZED)

        # 3. Con credenciales correctas
        res_ok = self.client.post('/fs/2fa/disable/', {
            'password': self.password,
            'otp_code': generate_totp_code(secret)
        })
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_2fa_enabled)
        self.assertIsNone(self.user.otp_secret)

        # Verificar AuditLog
        audit = AuditLog.objects.filter(user=self.user, action="SECURITY_2FA_DISABLED").first()
        self.assertIsNotNone(audit, "No se generó AuditLog para desactivación de 2FA")
