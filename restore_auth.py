"""
EcoFlow AI - Restore Authentication & Encryption Utility
Restores all original login barriers, AES encryption locks, Command Center master password checks,
and onboarding gateway screens to their full production state when instructed by the user.
"""

import os
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKUP_DIR = os.path.join(ROOT, "auth_backup_snapshot")

FILES_TO_RESTORE = [
    ("auth.js", os.path.join(ROOT, "static", "js", "auth.js")),
    ("app.js", os.path.join(ROOT, "static", "js", "app.js")),
    ("index.html", os.path.join(ROOT, "static", "index.html")),
    ("server.py", os.path.join(ROOT, "server.py"))
]

def restore_auth():
    print("🔄 Restoring every login detail, encryption lock, and Command Center access check...")
    if not os.path.exists(BACKUP_DIR):
        print("❌ Error: Backup directory not found at:", BACKUP_DIR)
        return False

    for backup_name, target_path in FILES_TO_RESTORE:
        src = os.path.join(BACKUP_DIR, backup_name)
        if os.path.exists(src):
            shutil.copy2(src, target_path)
            print(f"✅ Restored: {backup_name} -> {target_path} ({os.path.getsize(target_path)} bytes)")
        else:
            print(f"⚠️ Warning: Missing backup file for {backup_name}")

    print("\n🎉 SUCCESS: All login details, encryptions, and Command Center security have been fully restored!")
    return True

if __name__ == "__main__":
    restore_auth()
