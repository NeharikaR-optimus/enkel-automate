import fs from 'fs';
import path from 'path';

// Read the bot responses
const responsesFile = 'botResponses.json';
if (!fs.existsSync(responsesFile)) {
    console.error('❌ botResponses.json not found. Please run the test first.');
    process.exit(1);
}

const responsesData = JSON.parse(fs.readFileSync(responsesFile, 'utf-8'));

// Handle both old format (array) and new format (object with responses property)
const responses = Array.isArray(responsesData) ? responsesData : responsesData.responses;
const testRunInfo = responsesData.testRunInfo || {
    timestamp: new Date().toISOString(),
    totalQueries: responses.length,
    completedQueries: responses.length
};

// Generate HTML report
function generateHTMLReport(responses, testRunInfo) {
    const currentDate = new Date(testRunInfo.timestamp).toLocaleString();
    const totalQueries = testRunInfo.totalQueries;
    const successfulResponses = responses.filter(r => r.response && r.response !== 'No response received (timeout)').length;
    const timeouts = responses.filter(r => r.response === 'No response received (timeout)').length;
    const errorResponses = responses.filter(r => r.response && r.response.includes('apologize for the inconvenience')).length;
    const validResponses = responses.filter(r => r.response && r.response !== 'No response received (timeout)' && !r.response.includes('apologize for the inconvenience')).length;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slack RAG Bot Test Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
            position: relative; /* Added for button positioning */
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        .allure-button {
            display: inline-block;
            background-color: #2ecc71; /* Green color for Allure button */
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px; /* Space below header text */
            transition: background-color 0.3s ease, transform 0.2s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .allure-button:hover {
            background-color: #27ae60;
            transform: translateY(-2px);
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 1em;
            text-transform: uppercase;
        }
        .stat-card .number {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        .stat-card .percentage {
            font-size: 1.1em;
            color: #666;
        }
        .success { color: #27ae60; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
        .info { color: #3498db; }
        .responses {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .responses h2 {
            background: #34495e;
            color: white;
            margin: 0;
            padding: 20px;
            font-size: 1.5em;
        }
        .response-item {
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        .response-item:last-child {
            border-bottom: none;
        }
        .query {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
            padding: 10px;
            background: #ecf0f1;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
        .response {
            padding: 15px;
            border-radius: 5px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .response.success {
            background: #d5f4e6;
            border-left: 4px solid #27ae60;
        }
        .response.error {
            background: #fadbd8;
            border-left: 4px solid #e74c3c;
        }
        .response.timeout {
            background: #fdf2e9;
            border-left: 4px solid #f39c12;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }
        @media (max-width: 768px) {
            .summary {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 Slack RAG Bot Test Report</h1>
        <p>Generated on ${currentDate}</p>
        <!-- Allure Report Navigation Button - ADDED HERE -->
        <a href="/allure-report" class="allure-button">
            View Allure Report
        </a>
    </div>

    <div class="summary">
        <div class="stat-card">
            <h3>Total Queries</h3>
            <div class="number info">${totalQueries}</div>
        </div>
        <div class="stat-card">
            <h3>Valid Responses</h3>
            <div class="number success">${validResponses}</div>
            <div class="percentage">${totalQueries > 0 ? Math.round((validResponses / totalQueries) * 100) : 0}%</div>
        </div>
        <div class="stat-card">
            <h3>Error Responses</h3>
            <div class="number error">${errorResponses}</div>
            <div class="percentage">${totalQueries > 0 ? Math.round((errorResponses / totalQueries) * 100) : 0}%</div>
        </div>
        <div class="stat-card">
            <h3>Timeouts</h3>
            <div class="number warning">${timeouts}</div>
            <div class="percentage">${totalQueries > 0 ? Math.round((timeouts / totalQueries) * 100) : 0}%</div>
        </div>
    </div>

    <div class="responses">
        <h2>📋 Query-Response Details</h2>
        ${responses.map((item, index) => {
        let responseClass = 'success';
        if (item.response === 'No response received (timeout)') {
            responseClass = 'timeout';
        } else if (item.response.includes('apologize for the inconvenience')) {
            responseClass = 'error';
        }

        return `
                <div class="response-item">
                    <div class="query">
                        <strong>Query ${index + 1}:</strong> ${item.query}
                    </div>
                    <div class="response ${responseClass}">
                        <strong>Response:</strong><br>
                        ${item.response}
                    </div>
                </div>
            `;
    }).join('')}
    </div>

    <div class="footer">
        <p>This report was automatically generated from the Slack RAG Bot automation test results.</p>
    </div>
</body>
</html>
    `;

    return html;
}

// Generate text report
function generateTextReport(responses) {
    const currentDate = new Date().toLocaleString();
    const totalQueries = responses.length;
    const successfulResponses = responses.filter(r => r.response && r.response !== 'No response received (timeout)').length;
    const timeouts = responses.filter(r => r.response === 'No response received (timeout)').length;
    const errorResponses = responses.filter(r => r.response && r.response.includes('apologize for the inconvenience')).length;
    const validResponses = responses.filter(r => r.response && r.response !== 'No response received (timeout)' && !r.response.includes('apologize for the inconvenience')).length;

    let report = `
═══════════════════════════════════════════════════════════════════════════════
                    SLACK RAG BOT TEST REPORT
═══════════════════════════════════════════════════════════════════════════════

Generated on: ${currentDate}

SUMMARY:
--------
Total Queries Sent:      ${totalQueries}
Valid Responses:         ${validResponses} (${totalQueries > 0 ? Math.round((validResponses / totalQueries) * 100) : 0}%)
Error Responses:         ${errorResponses} (${totalQueries > 0 ? Math.round((errorResponses / totalQueries) * 100) : 0}%)
Timeouts:                ${timeouts} (${totalQueries > 0 ? Math.round((timeouts / totalQueries) * 100) : 0}%)

DETAILED RESULTS:
-----------------
`;

    responses.forEach((item, index) => {
        const status = item.response === 'No response received (timeout)' ? '⏱️ TIMEOUT' :
            item.response.includes('apologize for the inconvenience') ? '❌ ERROR' : '✅ SUCCESS';

        report += `
${index + 1}. ${status}
Query: ${item.query}
Response: ${item.response}
${'─'.repeat(80)}
`;
    });

    report += `
═══════════════════════════════════════════════════════════════════════════════
                            END OF REPORT
═══════════════════════════════════════════════════════════════════════════════
`;

    return report;
}

// Generate reports
console.log('📊 Generating reports...');

const htmlReport = generateHTMLReport(responses, testRunInfo);
const textReport = generateTextReport(responses);

// Save reports
fs.writeFileSync('index.html', htmlReport);
fs.writeFileSync('test-report.txt', textReport);

console.log('✅ Reports generated successfully!');
console.log('📄 HTML Report: index.html');
console.log('📄 Text Report: test-report.txt');
console.log(`📊 Summary: ${testRunInfo.completedQueries}/${testRunInfo.totalQueries} queries processed`);
