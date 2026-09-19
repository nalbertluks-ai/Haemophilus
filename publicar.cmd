@echo off
REM Publica a apresentacao no Vercel (so a pasta dist, ja compilada).
REM Na primeira vez abre o navegador para voce entrar na sua conta Vercel.
cd /d "%~dp0"
call npx --yes vercel@latest whoami >nul 2>&1 || call npx --yes vercel@latest login
call npm run build
call npx --yes vercel@latest deploy dist --prod --yes
pause
