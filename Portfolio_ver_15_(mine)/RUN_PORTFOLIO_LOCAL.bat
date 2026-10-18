@echo off
setlocal
cd /d "%~dp0"
title Student Portfolio - Local Server

where py >nul 2>nul
if not errorlevel 1 (
  py -3 start_portfolio_server.py
  if errorlevel 1 pause
  goto :eof
)

where python >nul 2>nul
if not errorlevel 1 (
  python start_portfolio_server.py
  if errorlevel 1 pause
  goto :eof
)

echo Python was not found.
echo Install Python 3 from https://www.python.org/downloads/windows/
echo During installation, enable "Add Python to PATH".
pause
