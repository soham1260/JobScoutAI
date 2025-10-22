import hashlib

def hash_id(x: str) -> str:
    return hashlib.sha256(x.encode()).hexdigest()[:16]
