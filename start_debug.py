
import subprocess
import os
import time

backend_dir = r"c:\code playground\personal\direct_repo_access\boil-it-ui\backend\app"
frontend_dir = r"c:\code playground\personal\direct_repo_access\boil-it-ui\frontend"

with open("backend_output.txt", "w") as f_be, open("frontend_output.txt", "w") as f_fe:
    be_proc = subprocess.Popen(["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "3000"], cwd=backend_dir, stdout=f_be, stderr=f_be, shell=True)
    fe_proc = subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir, stdout=f_fe, stderr=f_fe, shell=True)
    
    print(f"Backend PID: {be_proc.pid}")
    print(f"Frontend PID: {fe_proc.pid}")
    
    time.sleep(10)
    
    # Keep it running? No, this script will exit, but Popen will keep them running if we don't terminate them.
    # Actually, if this script exits, they might be orphaned or killed depending on how they are handled.
    # I'll just keep this script running for a bit then exit.
