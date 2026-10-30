import hmac
import hashlib
import time
import base64
import struct
import secrets
import urllib.parse
import io

def generate_totp_secret(length=32):
    """
    Genera un secreto criptográfico aleatorio en formato Base32 (RFC 3548 / RFC 6238).
    Compatible con Google Authenticator, Microsoft Authenticator, 1Password y Authy.
    """
    random_bytes = secrets.token_bytes(20)
    secret_b32 = base64.b32encode(random_bytes).decode('utf-8').replace('=', '')
    return secret_b32[:length]

def get_totp_uri(secret, username, issuer="FusionSolar"):
    """
    Construye la URI de aprovisionamiento estándar otpauth://
    """
    label = f"{issuer}:{username}"
    params = {
        'secret': secret,
        'issuer': issuer,
        'algorithm': 'SHA1',
        'digits': 6,
        'period': 30
    }
    encoded_params = urllib.parse.urlencode(params)
    return f"otpauth://totp/{urllib.parse.quote(label)}?{encoded_params}"

def generate_totp_code(secret, time_step=30, t=None):
    """
    Genera el código de 6 dígitos actual conforme a RFC 6238 (TOTP) / RFC 4226 (HOTP).
    """
    if t is None:
        t = time.time()
    
    counter = int(t // time_step)
    
    # Rellenar padding Base32 si es necesario
    padding = (8 - len(secret) % 8) % 8
    secret_padded = secret + ('=' * padding)
    key = base64.b32decode(secret_padded, casefold=True)
    
    # Empaquetar el contador en 8 bytes en formato Big-Endian
    msg = struct.pack(">Q", counter)
    h = hmac.new(key, msg, hashlib.sha1).digest()
    
    # Truncamiento dinámico según RFC 4226
    offset = h[-1] & 0x0F
    code_int = struct.unpack(">I", h[offset:offset + 4])[0] & 0x7FFFFFFF
    return str(code_int % 1000000).zfill(6)

def verify_totp_code(secret, code, valid_window=1, time_step=30):
    """
    Verifica si el código ingresado coincide con el secreto en la ventana de tiempo.
    valid_window=1 permite tolerar una deriva de reloj de hasta ±30 segundos en el móvil.
    """
    if not secret or not code:
        return False
    
    cleaned_code = str(code).strip()
    if not cleaned_code.isdigit() or len(cleaned_code) != 6:
        return False
        
    now = time.time()
    for w in range(-valid_window, valid_window + 1):
        target_time = now + (w * time_step)
        if generate_totp_code(secret, time_step=time_step, t=target_time) == cleaned_code:
            return True
            
    return False

def generate_qr_code_base64(uri):
    """
    Genera un Data URI en PNG/Base64 para incrustar directamente en la respuesta JSON.
    Usa la librería qrcode si está disponible; de lo contrario, delega al cliente web.
    """
    try:
        import qrcode
        img = qrcode.make(uri)
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{img_str}"
    except Exception:
        return None
