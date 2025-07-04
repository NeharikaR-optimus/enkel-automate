import { test, expect } from '@playwright/test';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const queries = fs.readFileSync('queries.txt', 'utf-8').split('\n').filter(Boolean);


test('Slack RAG_BOT automation flow', async ({ browser }) => {
    test.setTimeout(600000); // 10 minutes timeout for multiple queries
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://slack.com/ssb/signin#/signin');
    await page.getByRole('textbox', { name: 'Enter your email address' }).fill(process.env.SLACK_EMAIL || '');
    await page.getByRole('button', { name: 'Sign In With Email' }).click();

    console.log('🧩 Waiting 30 seconds to solve CAPTCHA...');
    await page.waitForTimeout(30000);

    await page.getByRole('button', { name: 'Sign In With Email' }).click();

    console.log('📨 Waiting 20 seconds for OTP entry...');
    await page.waitForTimeout(20000);

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Open TestBot' }).click();
    const slackPage = await page1Promise;

    await slackPage.getByRole('link', { name: 'use Slack in your browser' }).click();
    await slackPage.goto('https://app.slack.com/client/T08QE2DLMPX/C08QKEVDU04');

    await slackPage.getByRole('treeitem', { name: 'RAG_BOT' }).locator('img').click();

    for (const query of queries) {
        console.log(`💬 Sending: ${query}`);
        await slackPage.getByRole('textbox', { name: /Message to RAG_BOT/i }).fill(query);
        await slackPage.getByRole('button', { name: 'Send now' }).click();        // Wait for bot response before sending next query
        console.log('⏳ Waiting for bot response...');
        
        // Wait for bot to start typing (if typing indicator exists)
        await slackPage.waitForTimeout(1000);
        
        // Wait for a reasonable time for bot to respond
        let botResponded = false;
        let retries = 0;
        const maxRetries = 30; // Wait up to 1 minute for response

        while (!botResponded && retries < maxRetries) {
            await slackPage.waitForTimeout(1000);
            
            // Check if there's a new message from the bot (not from user)
            const lastMessage = await slackPage.locator('.c-message_kit__blocks').last();
            const messageText = await lastMessage.innerText().catch(() => '');
            
            // Check if the last message contains bot response content (not the user's query)
            if (messageText && !messageText.includes(query) && messageText.length > query.length) {
                botResponded = true;
                console.log(`✅ Bot responded to: ${query}`);
                break;
            }
            
            retries++;
        }

        if (!botResponded) {
            console.log(`⚠️ Timeout waiting for response to: ${query} - continuing to next query`);
        }
        
        // Short wait to ensure UI is stable before next query
        await slackPage.waitForTimeout(500);
    }

    console.log('📝 All messages sent successfully');

    await context.close();
});
