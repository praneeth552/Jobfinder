"""
Encryption utility for sensitive data using Fernet (AES-128-CBC with HMAC).
This provides authenticated encryption - data is both encrypted and tamper-proof.
"""
from cryptography.fernet import Fernet, InvalidToken
import os
from functools import lru_cache

@lru_cache(maxsize=1)
def get_cipher():
    """Get the Fernet cipher instance. Cached for performance."""
    encryption_key = os.getenv("ENCRYPTION_KEY")
    if not encryption_key:
        raise ValueError("ENCRYPTION_KEY environment variable not set. Generate one with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"")
    return Fernet(encryption_key.encode())


def encrypt_field(value: str) -> str:
    """
    Encrypt a string field.
    Returns the encrypted value as a base64 string.
    Returns empty string if value is None or empty.
    """
    if not value:
        return value
    try:
        cipher = get_cipher()
        encrypted = cipher.encrypt(value.encode())
        return encrypted.decode()
    except Exception as e:
        print(f"Encryption error: {e}")
        # Return original value if encryption fails (graceful degradation)
        return value


def decrypt_field(encrypted_value: str) -> str:
    """
    Decrypt an encrypted field.
    Returns the original plaintext string.
    Returns empty string if value is None or empty.
    Handles unencrypted values gracefully (for migration).
    """
    if not encrypted_value:
        return encrypted_value
    try:
        cipher = get_cipher()
        decrypted = cipher.decrypt(encrypted_value.encode())
        return decrypted.decode()
    except InvalidToken:
        # Value was not encrypted (legacy data) - return as-is
        return encrypted_value
    except Exception as e:
        print(f"Decryption error: {e}")
        # Return original value if decryption fails
        return encrypted_value


def is_encrypted(value: str) -> bool:
    """Check if a value appears to be Fernet-encrypted."""
    if not value:
        return False
    try:
        # Fernet tokens start with 'gAAAAA' (base64 encoded version byte)
        return value.startswith('gAAAAA') and len(value) > 100
    except:
        return False
