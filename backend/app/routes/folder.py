from fastapi import APIRouter
from models import PathRequest
import os, subprocess, sys
import subprocess
import shutil
import sys
from pathlib import Path

def open_in_vscode(path: str):
    code_cmd = shutil.which("code")
    if code_cmd:
        subprocess.Popen([code_cmd, path])
        return

    if sys.platform == "win32":
        possible_paths = [
            Path(os.environ.get("LOCALAPPDATA", "")) / "Programs" / "Microsoft VS Code" / "Code.exe",
            Path("C:/Program Files/Microsoft VS Code/Code.exe"),
            Path("C:/Program Files (x86)/Microsoft VS Code/Code.exe"),
        ]

        for exe in possible_paths:
            if exe.exists():
                subprocess.Popen([str(exe), path])
                return

    if sys.platform == "darwin":
        subprocess.Popen(["open", "-a", "Visual Studio Code", path])
        return

    subprocess.Popen(["code", path])


router = APIRouter()

@router.post("/select")
def select():
    try:
        import tkinter as tk
        from tkinter import filedialog
        
        root = tk.Tk()
        root.withdraw()  # Hide the main tkinter window
        root.attributes("-topmost", True)  # Bring to front
        
        selected_path = filedialog.askdirectory()
        root.destroy()
        
        if selected_path:
            return {"path": selected_path}
        return {"path": None}
    except Exception as e:
        return {"error": str(e), "path": "/mock/path"}

@router.post("/open")
def open_folder(req: PathRequest):
    path = req.path
    if sys.platform == "win32":
        os.startfile(path)
    elif sys.platform == "darwin":
        subprocess.Popen(["open", path])
    else:
        subprocess.Popen(["xdg-open", path])
    return {"opened": path}

@router.post("/open-vscode")
def open_vscode(req: PathRequest):
    open_in_vscode(req.path)
    return {"opened_in_vscode": req.path}