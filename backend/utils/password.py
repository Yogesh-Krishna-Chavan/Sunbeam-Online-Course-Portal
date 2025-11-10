import hashlib


def hash_password_sha256(raw_password: str) -> str:
    """Hash password using SHA256 (matches crypto-js.SHA256 behavior)"""
    return hashlib.sha256(raw_password.encode()).hexdigest()


def verify_password_sha256(raw_password: str, hashed_password: str) -> bool:
    """Verify password using SHA256"""
    return hash_password_sha256(raw_password) == hashed_password

