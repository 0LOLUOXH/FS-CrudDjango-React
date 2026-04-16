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

    console.log("Navigating to http://localhost:5173/ ...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    
    // Inject fake token
    await page.evaluate(() => {
        localStorage.setItem('access_token', 'fake-token');
        const fakeUser = { username: "admin", is_staff: true };
        localStorage.setItem('user', JSON.stringify(fakeUser));
    });

    console.log("Navigating to http://localhost:5173/products...");
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle0' });
    
    await new Promise(r => setTimeout(r, 2000));
    
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
