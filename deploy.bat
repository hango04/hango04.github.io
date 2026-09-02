@echo off
chcp 65001 >nul
echo Dang sao chep anh sang thu muc assets neu co...
if exist "%USERPROFILE%\.gemini\antigravity-ide\brain\36d189c4-1cb7-44b3-9190-8a28c1b9a9ef\taxua_bg_*.jpg" (
    for %%f in ("%USERPROFILE%\.gemini\antigravity-ide\brain\36d189c4-1cb7-44b3-9190-8a28c1b9a9ef\taxua_bg_*.jpg") do copy /y "%%f" "assets\taxua_bg.jpg" >nul
)
if exist "%USERPROFILE%\.gemini\antigravity-ide\brain\36d189c4-1cb7-44b3-9190-8a28c1b9a9ef\autotech_robot_*.jpg" (
    for %%f in ("%USERPROFILE%\.gemini\antigravity-ide\brain\36d189c4-1cb7-44b3-9190-8a28c1b9a9ef\autotech_robot_*.jpg") do copy /y "%%f" "assets\autotech_robot.jpg" >nul
)

echo Dang day code len Github...
git add .
git commit -m "Cap nhat: Them chuyen di Ta Xua va thuc tap Autotech"
git push
echo.
echo ==========================================================
echo Hoan thanh! Ban doi khoang 1-2 phut de web cap nhat nhe.
echo ==========================================================
pause

