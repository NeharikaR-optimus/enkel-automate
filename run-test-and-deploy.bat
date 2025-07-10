@echo off
echo 🤖 Running Slack Bot Tests and Deploying...
echo.

echo 🧪 Step 1: Running Playwright test...
npx playwright test slackBotFlow.spec.js
if %errorlevel% neq 0 (
    echo ❌ Test failed
    pause
    exit /b 1
)

echo.
echo 📊 Step 2: Generating report...
node generateReport.js
if %errorlevel% neq 0 (
    echo ❌ Report generation failed
    pause
    exit /b 1
)

echo.
echo 🚀 Step 3: Committing and pushing to GitHub...
git add botResponses.json test-report.html
git commit -m "Update test results - %date% %time%"
git push

echo.
echo ✅ Complete! Your report will be available at:
echo 🌐 https://YOUR-GITHUB-USERNAME.github.io/enkel-automate/test-report.html
echo.
echo 📝 Replace 'YOUR-GITHUB-USERNAME' with your actual GitHub username
echo 📝 Note: It may take a few minutes for GitHub Pages to update
pause
