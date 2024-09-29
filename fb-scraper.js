import { URL } from 'url';
import puppeteer from "puppeteer";
import fs from 'fs';
import https from 'https';

const iPhone = puppeteer.devices['iPhone 6'];
const browser = await puppeteer.launch({ 
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false 
});

export default class Scraper {
    
async facebook(url) {

        const link = new URL(url);
        let downloadUrl;
        let fileName;
        const page = await browser.newPage();
        await page.emulate(iPhone);

        if (!["www.facebook.com", "facebook.com", "www.fb.com", "fb.com", "m.facebook.com", "fb.watch"].includes(link.host)) {
            return {
                "success": false,
                "message": "Invalid URL"
            }
        }
        let videoUrl = await getVideoUrl(link, page);
        if (videoUrl) {
            downloadUrl = videoUrl.url;
            fileName = formatFileName(videoUrl.publishedDate);
            https.get(downloadUrl, res => {
                const stream = fs.createWriteStream("./output/" + fileName);
                res.pipe(stream);
                stream.on('finish', () => {
                    stream.close();
                })
            })
        }
        console.log("Successfully scraped: " + url);
        console.log("Video Saved As: " + fileName);
        return {
            "success": true
        }
    }

}

async function getVideoUrl(url, page) {
    await page.goto("http://m.facebook.com" + url.href.substring(url.origin.length, url.href.length));

    await page.waitForNetworkIdle();
    const videoUrl = await page.evaluate(() => {
        try {
            return document.querySelector(".displayed [data-video-url]").getAttribute("data-video-url");
        } catch (err) {
            console.error('Couldn\'t retrieve the URL from the Video element Error: ' + err)
            return null;
        }
    })
    const publishedDate = await page.evaluate(() => {
        try {
            let dateRaw = document.querySelector("div.displayed div.m div.m div.m div.native-text span.f5").innerHTML;
            return dateRaw.replace(/\W/g, '');
        } catch (err) {
            console.log('Couldn\'t retrieve the Date of the video: ' + err)
            return null;
        }
    })

    
    return {
        "success": true,
        "url": videoUrl,
        "publishedDate": publishedDate ? publishedDate : null
    }
}

function formatFileName(publishedDate) {
    if (publishedDate) {
        return publishedDate.split(' ').join('-') + '.mp4';
    }
    return null;
}