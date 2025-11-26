/**
 * Download OHLCV (K-line) data from BitMEX public API
 * This script downloads candlestick data for chart display
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BITMEX_API = 'https://www.bitmex.com/api/v1';

// Symbols to download
const SYMBOLS = ['XBTUSD', 'ETHUSD'];

// Timeframes to download
const TIMEFRAMES = {
    '1d': { binSize: '1d', days: 365 * 5 },   // 5 years of daily
    '1h': { binSize: '1h', days: 365 },        // 1 year of hourly
    '5m': { binSize: '5m', days: 60 },         // 60 days of 5-min
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible)',
                'Accept': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON: ${data.substring(0, 200)}`));
                }
            });
        }).on('error', reject);
    });
}

async function downloadOHLCV(symbol, binSize, days) {
    const candles = [];
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - days);

    let currentStart = new Date(startTime);
    const count = 750; // Max per request

    console.log(`   Downloading ${symbol} ${binSize} data from ${startTime.toISOString().split('T')[0]} to ${endTime.toISOString().split('T')[0]}...`);

    while (currentStart < endTime) {
        const url = `${BITMEX_API}/trade/bucketed?binSize=${binSize}&symbol=${symbol}&count=${count}&startTime=${currentStart.toISOString()}&partial=false`;

        try {
            const data = await fetchJSON(url);

            if (!Array.isArray(data) || data.length === 0) {
                break;
            }

            for (const bar of data) {
                candles.push({
                    timestamp: bar.timestamp,
                    open: bar.open,
                    high: bar.high,
                    low: bar.low,
                    close: bar.close,
                    volume: bar.volume || 0
                });
            }

            // Update start time for next batch
            const lastBar = data[data.length - 1];
            currentStart = new Date(lastBar.timestamp);

            // Add a small time increment to avoid duplicate
            if (binSize === '1d') {
                currentStart.setDate(currentStart.getDate() + 1);
            } else if (binSize === '1h') {
                currentStart.setHours(currentStart.getHours() + 1);
            } else if (binSize === '5m') {
                currentStart.setMinutes(currentStart.getMinutes() + 5);
            }

            process.stdout.write(`\r   Fetched ${candles.length} candles...`);

            // Rate limit: 30 requests per minute for public endpoints
            await sleep(2100); // ~28 requests per minute to be safe

        } catch (error) {
            console.error(`\n   Error fetching data: ${error.message}`);
            await sleep(5000); // Wait longer on error
        }
    }

    console.log(`\n   Total: ${candles.length} candles`);
    return candles;
}

function saveToCSV(candles, filepath) {
    const header = 'timestamp,open,high,low,close,volume\n';
    const rows = candles.map(c =>
        `${c.timestamp},${c.open},${c.high},${c.low},${c.close},${c.volume}`
    ).join('\n');

    fs.writeFileSync(filepath, header + rows);
}

async function main() {
    const baseDir = path.dirname(path.dirname(__filename));
    const ohlcvDir = path.join(baseDir, 'data', 'ohlcv');

    // Create directory if not exists
    fs.mkdirSync(ohlcvDir, { recursive: true });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('           BitMEX OHLCV Data Download');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const symbol of SYMBOLS) {
        console.log(`\n📊 ${symbol}`);
        console.log('─'.repeat(50));

        for (const [tf, config] of Object.entries(TIMEFRAMES)) {
            const candles = await downloadOHLCV(symbol, config.binSize, config.days);

            if (candles.length > 0) {
                const filename = path.join(ohlcvDir, `${symbol}_${tf}.csv`);
                saveToCSV(candles, filename);
                console.log(`   ✅ Saved: ${filename} (${candles.length} candles)`);
            } else {
                console.log(`   ⚠️ No data for ${symbol} ${tf}`);
            }

            // Pause between different timeframes
            await sleep(3000);
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ OHLCV download complete!');
    console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
