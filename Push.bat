@echo off
echo =============================================
echo     Tracklist2G — Автообновление GitHub
echo =============================================

REM Проверка: есть ли git
git --version >nul 2>&1
if errorlevel 1 (
    echo Ошибка: Git не установлен!
    pause
    exit /b
)

echo Добавление изменений...
git add .

echo Создание коммита...
git commit -m "update"

echo Установка ветки main...
git branch -M main

echo Пуш на GitHub...
git push -u origin main --force

echo ---------------------------------------------
echo Готово! Файлы обновлены и сайт перезагружен.
echo Открой: https://spirtuozgit.github.io/tracklist2g/
echo ---------------------------------------------

pause
