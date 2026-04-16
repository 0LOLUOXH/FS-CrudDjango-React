import puppeteer from 'puppeteer';

(async () => {
    console.log("Launching puppeteer...");
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

    console.log("Navigating to login...");
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

    console.log("Filling login form...");
    // The previous code had a login form. Let's look for inputs.
    // If not found, we can do API login and set localStorage.
    
    // Instead of UI login, let's just make a fetch request to the backend using page.evaluate
    console.log("Authenticating via backend api...");
    const authData = await page.evaluate(async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/fs/apibd/v1/user/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Try admin/admin or admin/1234
                body: JSON.stringify({ username: "admin", password: "1" }) // Wait, what is the password?
            });
            const data = await res.json();
            return data;
        } catch (err) {
            return { error: err.message };
        }
    });
    
    console.log("Auth response:", authData);
    
    if (authData.token) {
        await page.evaluate((data) => {
            localStorage.setItem('access_token', data.token);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));
        }, authData);
        console.log("Local storage set.");
    } else {
        console.log("Could not authenticate. Trying fallback fake auth...");
        await page.evaluate(() => {
            localStorage.setItem('access_token', "fake.jwt.token");
            localStorage.setItem('user', JSON.stringify({username: "admin", is_staff: true}));
        });
    }

    console.log("Navigating to /products...");
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle0' });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("FINAL URL:", page.url());
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    const hasErrorBoundary = bodyHTML.includes('¡Algo salió mal en la aplicación!');
    
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
