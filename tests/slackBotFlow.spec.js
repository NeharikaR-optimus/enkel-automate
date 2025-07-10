import { test, expect } from '@playwright/test';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const queries = fs.readFileSync('queries.txt', 'utf-8').split('\n').filter(Boolean);


test('Slack RAG_BOT automation flow', async ({ browser }) => {
    test.setTimeout(600000); // 10 minutes timeout for multiple queries
    const context = await browser.newContext();
    const page = await context.newPage();

    // Array to store query-response pairs
    const botResponses = [];

    await page.goto('https://slack.com/ssb/signin#/signin');
    await page.getByRole('textbox', { name: 'Enter your email address' }).fill(process.env.SLACK_EMAIL || '');
    await page.getByRole('button', { name: 'Sign In With Email' }).click();

    await page.waitForTimeout(30000); // CAPTCHA time

    await page.getByRole('button', { name: 'Sign In With Email' }).click();

    await page.waitForTimeout(20000); // OTP time

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Open TestBot' }).click();
    const slackPage = await page1Promise;

    await slackPage.getByRole('link', { name: 'use Slack in your browser' }).click();
    await slackPage.goto('https://app.slack.com/client/T08QE2DLMPX/C08QKEVDU04');

    await slackPage.getByRole('treeitem', { name: 'RAG_BOT' }).locator('img').click();

    for (const query of queries) {
        // Get message count before sending
        const messagesBefore = await slackPage.locator('.c-message_kit__blocks').count();

        await slackPage.getByRole('textbox', { name: /Message to RAG_BOT/i }).fill(query);
        await slackPage.getByRole('button', { name: 'Send now' }).click();

        await slackPage.waitForTimeout(1000);

        let botResponded = false;
        let retries = 0;
        const maxRetries = 60; // Wait up to 2 minutes for response
        let botResponse = 'No response received (timeout)';

        while (!botResponded && retries < maxRetries) {
            await slackPage.waitForTimeout(2000);

            // Check if new messages appeared
            const messagesAfter = await slackPage.locator('.c-message_kit__blocks').count();

            if (messagesAfter > messagesBefore) {
                // Get the latest message(s) after our query
                const latestMessages = await slackPage.locator('.c-message_kit__blocks').last();
                const messageText = await latestMessages.innerText().catch(() => '');

                // Check if this message is from the bot (not containing our query)
                if (messageText && !messageText.includes(query) && messageText.trim().length > 10) {
                    botResponse = messageText.trim();
                    botResponded = true;
                    break;
                }
            }

            retries++;
        }

        // Store the query-response pair
        botResponses.push({
            query: query.trim(),
            response: botResponse,
            timestamp: new Date().toISOString(),
            responseTime: retries * 2 // Approximate response time in seconds
        });

        await slackPage.waitForTimeout(1000);
    }

    // Save responses to JSON file
    const reportData = {
        testRunInfo: {
            timestamp: new Date().toISOString(),
            totalQueries: queries.length,
            completedQueries: botResponses.length
        },
        responses: botResponses
    };

    fs.writeFileSync('botResponses.json', JSON.stringify(reportData, null, 2));

    // Generate HTML report automatically
    try {
        const { execSync } = await import('child_process');
        execSync('node generateReport.js', { stdio: 'inherit' });
    } catch (error) {
        // Silent fail - report can be generated manually
    }

    console.log('📝 All messages sent successfully');

    await context.close();
});
