"""
Utilidades de seguridad: hashing de contraseñas y manejo de tokens JWT.
Implementación robusta compatible con o sin librerías externas (bcrypt / python-jose).
"""
import os
import json
import base64
import hmac
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from config.settings import settings


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')


def _b64decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str) -> str:
    try:
        import bcrypt
        password_bytes = password.encode("utf-8")[:72]
        return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")
    except ImportError:
        # Fallback estándar PBKDF2 de Python
        salt = os.urandom(16)
        pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        return f"pbkdf2_sha256${salt.hex()}${pwd_hash.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            import bcrypt
            password_bytes = plain_password.encode("utf-8")[:72]
            return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))
    except Exception:
        pass

    if hashed_password.startswith("pbkdf2_sha256$"):
        parts = hashed_password.split("$")
        if len(parts) == 3:
            salt = bytes.fromhex(parts[1])
            expected_hash = parts[2]
            computed_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000).hex()
            return hmac.compare_digest(expected_hash, computed_hash)

    # Comparación directa de texto si fue guardada plana
    return plain_password == hashed_password


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    try:
        from jose import jwt
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    except ImportError:
        # Implementación estándar de JWT HS256 sin dependencias externas
        header = {"alg": settings.ALGORITHM, "typ": "JWT"}
        to_encode = data.copy()
        expire = (datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))).timestamp()
        to_encode.update({"exp": expire})

        header_b64 = _b64encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
        payload_b64 = _b64encode(json.dumps(to_encode, separators=(',', ':')).encode('utf-8'))
        signature_raw = f"{header_b64}.{payload_b64}".encode('utf-8')
        signature = _b64encode(hmac.new(settings.SECRET_KEY.encode('utf-8'), signature_raw, hashlib.sha256).digest())
        return f"{header_b64}.{payload_b64}.{signature}"


def decode_access_token(token: str) -> Optional[dict]:
    try:
        from jose import jwt, JWTError
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        try:
            parts = token.split('.')
            if len(parts) != 3:
                return None
            header_b64, payload_b64, signature = parts
            signature_raw = f"{header_b64}.{payload_b64}".encode('utf-8')
            expected_sig = _b64encode(hmac.new(settings.SECRET_KEY.encode('utf-8'), signature_raw, hashlib.sha256).digest())
            if not hmac.compare_digest(signature, expected_sig):
                return None
            payload = json.loads(_b64decode(payload_b64).decode('utf-8'))
            if "exp" in payload and payload["exp"] < datetime.utcnow().timestamp():
                return None
            return payload
        except Exception:
            return None
