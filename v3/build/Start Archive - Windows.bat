@echo off
setlocal
cd /d "%~dp0"

if not exist "Preview\archive_server.py" (
  echo ERROR: Preview\archive_server.py was not found.
  echo Keep this launcher in the archive's top-level folder.
  pause
  exit /b 1
)
if not exist "Preview\archive.html" (
  echo ERROR: Preview\archive.html was not found.
  echo Keep the Preview folder beside this launcher.
  pause
  exit /b 1
)

where py >nul 2>nul
if not errorlevel 1 (
  py -3 --version >nul 2>&1
  if not errorlevel 1 goto use_py
)

where python >nul 2>nul
if not errorlevel 1 (
  python -c "import sys; raise SystemExit(0 if sys.version_info.major == 3 else 1)" >nul 2>&1
  if not errorlevel 1 goto use_python
)

echo Python 3 was not found.
echo Install Python 3 from https://www.python.org/downloads/windows/
echo Then double-click this launcher again.
pause
exit /b 1

:use_py
py -3 "Preview\archive_server.py"
goto finished

:use_python
python "Preview\archive_server.py"

:finished
if errorlevel 1 echo The archive server stopped with an error.
pause
