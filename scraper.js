const puppeteer = require('puppeteer');
const url = 'https://apps.ecs.vuw.ac.nz/cgi-bin/studentmarks?course=CYBR271';

module.exports = {

    async getMarks(){
        console.log('initializing scraper');
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        page.on('console', msg => {
            for (let i = 0; i < msg.args.length; ++i)
                console.log(`${i}: ${msg.args[i]}`);
        });

        console.log('loading login page');
        await page.goto(url, { waitUntil: 'networkidle0' });

        console.log('logging in');

        await page.evaluate(() => {
            document.querySelector("input[name='username']").value = 'username';
            document.querySelector("input[name='password']").value = 'password';
        });
        await Promise.all([
            page.click("input[name=login]"),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        console.log('logged in!');

        let data = await page.evaluate(() => {
            let output = new Map();

            let results = document.querySelectorAll(".panel-success .panel-title");
            results.forEach((result) => {
                let key = result.closest(".tab-pane").id;
                if(output.has(key))
                    output.get(key).push(result.textContent);
                else
                    output.set(key, [result.textContent]);
                console.log(key, result.textContent);
            });

            return JSON.stringify([...output.entries()])
        });

        let map = JSON.parse(data).reduce((m, [key, val])=> m.set(key, val) , new Map());

        await browser.close();
        return map;
    }
};

