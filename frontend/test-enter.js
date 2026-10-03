const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/dashboard');
  
  // Login if necessary
  if (await page.$('input[type="email"]')) {
    await page.fill('input[type="email"]', 'samogamer291@gmail.com');
    await page.fill('input[type="password"]', 'abc@123');
    await page.click('button:has-text("Log")');
    await page.waitForNavigation();
  }

  // Wait for the textarea
  await page.waitForSelector('textarea');
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.fill('textarea', 'Hello world');
  await page.press('textarea', 'Enter');
  
  await page.waitForTimeout(2000);
  
  const queryValue = await page.$eval('textarea', el => el.value);
  console.log('Textarea value after Enter:', JSON.stringify(queryValue));
  
  await browser.close();
})();
