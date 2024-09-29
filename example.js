import Scraper from './fb-scraper.js';
const scraper = new Scraper();

/// Facebook Example
let fbVideoExample = await scraper.facebook("https://www.facebook.com/firstchurchwoodland/videos/535489558987475/");

process.exit();