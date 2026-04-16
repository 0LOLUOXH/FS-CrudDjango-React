import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER CONSOLE ERROR:', msg.text());
        } else {
            console.log('LOG:', msg.text());
        }
    });
    
    page.on('pageerror', error => {
        console.log('PAGE ERROR:', error.message);
    });

    console.log("Navigating to /products...");
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle0' });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("FINAL URL:", page.url());
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    const hasErrorBoundary = bodyHTML.includes('Algo salió mal');
    
    if (hasErrorBoundary) {
        console.log("ERROR BOUNDARY RENDERED!");
        const errorText = await page.evaluate(() => document.body.innerText);
        console.log("ERROR BOUNDARY TEXT:\n", errorText);
    } else {
        const rootContent = await page.evaluate(() => {
            const el = document.getElementById('root');
            return el ? el.innerHTML : '';
        });
        if (rootContent.trim() === '') {
            console.log("FATAL: ROOT IS EMPTY AND NO ERROR BOUNDARY!");
        } else {
            console.log("Rendered successfully! Root length:", rootContent.length);
        }
    }

    await browser.close();
})();
