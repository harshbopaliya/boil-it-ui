## Resolved Bugs

### 1. Port Conflict (Address Already in Use) - FIXED
- **Fix**: Updated `run_local.ps1` to automatically cleanup stale processes on ports 3000 and 5173 before starting.

### 2. Hardcoded Folder Selection - FIXED
- **Fix**: Implemented native `tkinter` folder picker in `backend/app/routes/folder.py` and updated `PathSelectionModal.tsx` to use the API.

### 3. Silent API Failures - FIXED
- **Fix**: Added `try-catch` blocks and Toast notifications in `App.tsx` for template saving and project generation.

### 4. AI Configuration Persistence - FIXED
- **Fix**: Updated `AIModal.tsx` to use environment variables (`.env`) for OpenAI API keys and Ollama model names as defaults.

### 5. Backend Dependency Management - IMPROVED
- **Fix**: Migrated backend documentation to use `uv` for faster and more reliable environment synchronization.

## Remaining Issues

### 1. Basic File Creation Logic
- **Severity**: Medium
- **Description**: The scaffold generator only creates empty files using `open(file_path, "a").close()`. It does not support templates with content.
- **Location**: `backend/app/routes/structure.py`

### 2. Missing Loading States
- **Severity**: Medium
- **Description**: Initial data fetching (tags, templates) has no visual loading indicator.

## Recommendations
- Implement content support in the scaffold generator (instead of just empty files).
- Add a global Toast notification system in the frontend for all API errors.
- Consider adding a "Health Check" indicator for Ollama status in the UI.
