const { chromium } = require('playwright');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Set a large viewport
    await page.setViewportSize({ width: 1400, height: 2000 });

    const filePath = path.join(__dirname, '../.trae/documents/architecture_preview.html');
    const fileUrl = `file://${filePath}`;

    console.log(`Navigating to: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for mermaid to render
    console.log('Waiting for diagrams to render...');
    await page.waitForSelector('.mermaid svg', { timeout: 10000 });
    
    // Give it a bit more time for fonts and layout stabilization
    await page.waitForTimeout(2000);

    const outputPath = path.join(__dirname, '../architecture_poster.png');
    console.log(`Taking screenshot to: ${outputPath}`);
    
    await page.screenshot({ path: outputPath, fullPage: true });

    await browser.close();
    console.log('Done! Screenshot generated successfully.');
  } catch (error) {
    console.error('Error generating screenshot:', error);
    process.exit(1);
  }
})();
