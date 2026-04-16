import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Attempt authentication bypass more reliably
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
        localStorage.setItem('access_token', 'fake-token');
        const fakeUser = { username: "admin", is_staff: true };
        localStorage.setItem('user', JSON.stringify(fakeUser));
    });

    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("FINAL URL:", page.url());
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("BODY TEXT:\n", bodyText);
    
    await browser.close();
})();
