import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER CONSOLE ERROR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('PAGE ERROR:', error.message);
    });

    console.log("Navigating to http://localhost:5173/products...");
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle0' });
    
    // Check if the body is completely empty (which means React crashed and unmounted)
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (!bodyHTML.includes('id="root"')) {
         console.log("Root element is missing?");
    }
    const rootHTML = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root ? root.innerHTML : '';
    });
    
    if (rootHTML.trim() === '') {
        console.log("CRASH CONFIRMED: Root element is entirely empty.");
    } else {
        console.log("Root is not empty, length:", rootHTML.length);
    }
    
    await browser.close();
})();
