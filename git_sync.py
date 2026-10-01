"""
EcoFlow AI - GitHub Integration & Auto-Sync Utility
Links local repository to your GitHub account and keeps remote updated.
"""

import os
import sys
import subprocess

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

GIT_EXE = r"C:\Users\LOQ\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe"
REPO_DIR = os.path.dirname(os.path.abspath(__file__))


def run_git(args):
    cmd = [GIT_EXE] + args
    res = subprocess.run(cmd, cwd=REPO_DIR, capture_output=True, text=True)
    if res.stdout:
        print(res.stdout.strip())
    if res.stderr and res.returncode != 0:
        print(f"Error: {res.stderr.strip()}", file=sys.stderr)
    return res.returncode

def setup_github_remote(remote_url, token=None, user_name=None, user_email=None):
    print(f"Configuring GitHub repository remote: {remote_url}")
    if user_name:
        run_git(["config", "user.name", user_name])
    if user_email:
        run_git(["config", "user.email", user_email])

    # If token provided, inject it into the HTTPS URL
    target_url = remote_url
    if token:
        clean_url = remote_url.replace("https://", "").replace("http://", "")
        # Remove any existing user info
        if "@" in clean_url:
            clean_url = clean_url.split("@", 1)[1]
        target_url = f"https://{token}@{clean_url}"
        print("🔐 Authenticated URL configured with your Personal Access Token.")

    # Check existing remote
    remotes = subprocess.run([GIT_EXE, "remote"], cwd=REPO_DIR, capture_output=True, text=True).stdout.strip().split()
    if "origin" in remotes:
        run_git(["remote", "set-url", "origin", target_url])
    else:
        run_git(["remote", "add", "origin", target_url])

    print("Remote 'origin' configured successfully.")
    print("Testing connection and pushing main branch to GitHub...")
    code = run_git(["push", "-u", "origin", "main"])
    if code == 0:
        print("\n🎉 SUCCESS! EcoFlow AI has been pushed to GitHub!")
        print(f"🌐 View your repository at: https://github.com/daksh-singhi/EcoFlow_AI")
    else:
        print("\n⚠️ Push was not completed. Common reasons:")
        print("1. Repository not created yet: Create 'EcoFlow_AI' at https://github.com/new")
        print("2. Authentication required: Provide a GitHub Personal Access Token (PAT) with 'repo' scope.")
        print("   Run: python git_sync.py --token <YOUR_GITHUB_PAT>")
    return code

def sync_and_push(commit_msg="update: EcoFlow AI platform enhancements"):
    print(f"Syncing and pushing changes to GitHub...")
    run_git(["add", "."])
    # check status
    status = subprocess.run([GIT_EXE, "status", "--porcelain"], cwd=REPO_DIR, capture_output=True, text=True).stdout.strip()
    if status:
        run_git(["commit", "-m", commit_msg])
    code = run_git(["push", "origin", "main"])
    if code == 0:
        print("✅ Repositories synchronized with GitHub:")
        print("   🌐 https://github.com/daksh-singhi/EcoFlow_AI")
        print("   🌐 https://github.com/daksh-cse26/EcoFlow-AI")
    return code

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--token":
        if len(sys.argv) > 2:
            token = sys.argv[2]
            setup_github_remote("https://github.com/daksh-singhi/EcoFlow_AI.git", token=token)
        else:
            print("Usage: python git_sync.py --token <GITHUB_PERSONAL_ACCESS_TOKEN>")
    elif len(sys.argv) > 1 and sys.argv[1] == "--setup":
        url = sys.argv[2] if len(sys.argv) > 2 else "https://github.com/daksh-singhi/EcoFlow_AI.git"
        token = sys.argv[3] if len(sys.argv) > 3 else None
        setup_github_remote(url, token=token)
    elif len(sys.argv) > 1:
        msg = " ".join(sys.argv[1:])
        sync_and_push(msg)
    else:
        sync_and_push()

