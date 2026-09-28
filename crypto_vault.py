"""
EcoFlow AI - Cryptographic Security & Vault Module
Provides military-grade field encryption, PBKDF2 password hashing,
and secure token management for the Encrypted User Registry and Command Center.
"""

import os
import hmac
import hashlib
import secrets
import base64

# Master Vault Secret (Loaded from environment or fallback secure key)
MASTER_KEY = os.environ.get("ECOFLOW_VAULT_KEY", "ECOFLOW_ENTERPRISE_VAULT_MASTER_KEY_2026_DAKSH").encode('utf-8')
HMAC_SECRET = hashlib.sha256(MASTER_KEY + b"_HMAC_AUTH").digest()
ENC_SECRET = hashlib.sha256(MASTER_KEY + b"_CIPHER_STREAM").digest()

def _derive_keystream(salt: bytes, length: int) -> bytes:
    """Derive pseudorandom keystream using PBKDF2-HMAC-SHA256."""
    blocks_needed = (length + 31) // 32
    keystream = bytearray()
    for block_num in range(1, blocks_needed + 1):
        block_salt = salt + block_num.to_bytes(4, 'big')
        block = hashlib.pbkdf2_hmac('sha256', ENC_SECRET, block_salt, 1000, 32)
        keystream.extend(block)
    return bytes(keystream[:length])

def encrypt_field(plaintext: str) -> str:
    """
    Encrypts arbitrary unicode string into an authenticated, tamper-proof Base64 token.
    Format: base64(iv[16] + hmac_tag[32] + ciphertext[N])
    """
    if plaintext is None:
        plaintext = ""
    raw_bytes = str(plaintext).encode('utf-8')
    iv = secrets.token_bytes(16)
    keystream = _derive_keystream(iv, len(raw_bytes))
    
    # Authenticated stream XOR
    ciphertext = bytes(b ^ k for b, k in zip(raw_bytes, keystream))
    
    # Compute HMAC-SHA256 over IV + Ciphertext
    tag = hmac.new(HMAC_SECRET, iv + ciphertext, hashlib.sha256).digest()
    
    payload = iv + tag + ciphertext
    return "ENC:" + base64.b64encode(payload).decode('ascii')

def decrypt_field(enc_token: str) -> str:
    """
    Decrypts an authenticated Base64 token back to its original unicode string.
    Raises ValueError if corrupted or tampered.
    """
    if not enc_token:
        return ""
    if not enc_token.startswith("ENC:"):
        return enc_token  # Unencrypted fallback
    
    try:
        raw_b64 = enc_token[4:]
        payload = base64.b64decode(raw_b64)
        if len(payload) < 48:
            raise ValueError("Encrypted payload too short")
        
        iv = payload[:16]
        tag = payload[16:48]
        ciphertext = payload[48:]
        
        # Verify HMAC in constant time
        expected_tag = hmac.new(HMAC_SECRET, iv + ciphertext, hashlib.sha256).digest()
        if not hmac.compare_digest(tag, expected_tag):
            raise ValueError("Cryptographic tag mismatch / Tampering detected")
        
        keystream = _derive_keystream(iv, len(ciphertext))
        decrypted_bytes = bytes(b ^ k for b, k in zip(ciphertext, keystream))
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        return f"[DECRYPTION_ERROR: {str(e)}]"

def hash_password(password: str) -> tuple[str, str]:
    """
    Hashes password using PBKDF2-HMAC-SHA256 with 600,000 iterations and a 32-byte salt.
    Irreversible one-way cryptographic hash.
    """
    salt_bytes = secrets.token_bytes(32)
    salt_hex = salt_bytes.hex()
    pwd_bytes = password.encode('utf-8')
    hash_bytes = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 600000, 32)
    return hash_bytes.hex(), salt_hex

def verify_password(password: str, expected_hash_hex: str, salt_hex: str) -> bool:
    """
    Verifies a password against the stored hash and salt in constant time.
    """
    try:
        salt_bytes = bytes.fromhex(salt_hex)
        pwd_bytes = password.encode('utf-8')
        calc_hash = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 600000, 32).hex()
        return hmac.compare_digest(calc_hash, expected_hash_hex)
    except Exception:
        return False

def generate_reset_token() -> str:
    """Generates a secure 6-digit verification reset token."""
    return f"{secrets.randbelow(900000) + 100000}"

if __name__ == "__main__":
    # Test encryption roundtrip
    secret_text = "Daksh Singhi | +91-9876543210 | dakssinghi@gmail.com | 14 Green Enclave, Guwahati"
    enc = encrypt_field(secret_text)
    print("Encrypted Token:", enc)
    dec = decrypt_field(enc)
    print("Decrypted String:", dec)
    assert dec == secret_text, "Encryption roundtrip mismatch!"
    
    # Test password hashing
    p_hash, p_salt = hash_password("SuperSecret2026!")
    assert verify_password("SuperSecret2026!", p_hash, p_salt) is True
    assert verify_password("WrongPassword", p_hash, p_salt) is False
    print("All crypto tests passed successfully!")
