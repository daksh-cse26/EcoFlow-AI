"""
EcoFlow AI - GitHub Integration & Auto-Sync Utility
Links local repository to your GitHub account and keeps remote updated.
"""

import os
import sys
import subprocess

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

def setup_github_remote(remote_url, user_name=None, user_email=None):
    print(f"Configuring GitHub repository remote: {remote_url}")
    if user_name:
        run_git(["config", "user.name", user_name])
    if user_email:
        run_git(["config", "user.email", user_email])

    # Check existing remote
    remotes = subprocess.run([GIT_EXE, "remote"], cwd=REPO_DIR, capture_output=True, text=True).stdout.strip().split()
    if "origin" in remotes:
        run_git(["remote", "set-url", "origin", remote_url])
    else:
        run_git(["remote", "add", "origin", remote_url])

    print("Remote 'origin' configured successfully.")
    print("Testing connection and pushing main branch...")
    code = run_git(["push", "-u", "origin", "main"])
    if code == 0:
        print("🎉 Successfully pushed EcoFlow AI repository to GitHub!")
    else:
        print("Note: If authentication is required, ensure you have set up a GitHub Personal Access Token (PAT) or SSH key.")

def sync_and_push(commit_msg="update: EcoFlow AI platform enhancements"):
    print(f"Syncing and pushing changes to GitHub...")
    run_git(["add", "."])
    run_git(["commit", "-m", commit_msg])
    code = run_git(["push", "origin", "main"])
    if code == 0:
        print("✅ Repository synchronized with GitHub.")
    return code

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--setup":
        if len(sys.argv) > 2:
            url = sys.argv[2]
            setup_github_remote(url)
        else:
            print("Usage: python git_sync.py --setup <GITHUB_REPO_URL>")
    elif len(sys.argv) > 1:
        msg = " ".join(sys.argv[1:])
        sync_and_push(msg)
    else:
        sync_and_push()
