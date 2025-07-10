@echo off
echo 🤖 Slack Bot Hybrid Automation Pipeline
echo ⚠️  MANUAL STEPS REQUIRED: You will need to handle CAPTCHA and OTP
echo.

echo 🧪 Step 1: Running Playwright test (MANUAL LOGIN REQUIRED)...
echo 👤 Please be ready to:
echo    - Solve CAPTCHA (30 second wait)
echo    - Enter OTP code (20 second wait)
echo.
pause
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
git add botResponses.json index.html
git commit -m "Update test results - %date% %time%"
git push

echo.
echo ✅ Pipeline Complete!
echo 🔄 GitHub Actions will now automatically deploy your report
echo 🌐 Your report will be available at:
echo    https://YOUR-GITHUB-USERNAME.github.io/enkel-automate/
echo.
echo 📝 Next steps:
echo    1. Replace 'YOUR-GITHUB-USERNAME' with your actual GitHub username
echo    2. Enable GitHub Pages: Settings → Pages → Source: GitHub Actions
echo    3. Wait 2-3 minutes for deployment to complete
echo    4. Your code is on 'develop' branch - workflow will trigger automatically
echo.
pause
