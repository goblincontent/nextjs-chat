import * as fs from 'fs';
import * as cookieManager from './cookie_manager';
import { setLocalCookie, getLocalCookie } from './cookie_storage.js';
import { SupabaseWrapper } from './supabaseWrapper.js';

const axios = require('axios').default;
const UserAgent = require('user-agents');
const cheerio = require('cheerio');

const filePath = 'data/online_marketplace_antitrust.json'

class Scraper
{
    axios: any;
    constructor() {
        this.axios = axios.create({
            headers: {
                cookie: getLocalCookie(),
                'user-agent': (new UserAgent()).toString(),
            },
        });
        console.log("axios set");
    }

    async run(url: string) {
        console.log('IScraper: working on %s', url);
    
        try {
          // do HTTP request to the web server
            const { data } = await this.axios.get(url);
            // create a cheerio object with nodes from html markup
            const $ = cheerio.load(data);
    
                // if the cheerio object contains nodes, run Parser
            // and return to index.js the result of parsing
            if ($.length) {
                // console.log($);
                const mainContentText = $('div.main-content ');
                return mainContentText.text();
            }
            console.log('IScraper: could not fetch or handle the page content from %s', url);
            return null;
        } catch (e) {
            // console.log(e);
            console.log('IScraper: could not fetch the page content from %s', url);
          return null;
        }
      }
}

async function main() {
    try {
        const jsonData = await readJsonFile(filePath);
        const scraper = new Scraper();
        const supabaseWrapper = new SupabaseWrapper("cases");

        for (let i = 22; i < jsonData.results.length; i++) {
            const caseName = jsonData.results[i].name_abbreviation;
            const frontendUrl = jsonData.results[i].frontend_url;

            await sleep(60000);
            let response = await scraper.run(frontendUrl)
            if (response != null) {
                response = stripWhitespace(response);
                if (response != "") {
                    console.log("Case Name:", caseName);
                    console.log("URL:", frontendUrl);
                    console.log("====Case Text====");
                    console.log(response.slice(0, 100));
                    console.log("=================");
                    // Add to supabase db
                    supabaseWrapper.insertData({
                        "case_id": jsonData.results[i].id,
                        "case_name": jsonData.results[i].name_abbreviation,
                        "decision_date": jsonData.results[i].decision_date,
                        "reporter_name": jsonData.results[i].reporter.full_name,
                        "court_name": jsonData.results[i].court.name,
                        "url": jsonData.results[i].frontend_url,
                        "case_text": response,
                        "index": i
                    })
                }
            }
        }     

    } catch (error) {
        console.log(error);
    }
}

async function cookieSetup() {
    // CookieManager call point
    const cookie = await cookieManager.fetchCookie(
        "https://cite.case.law/f-supp-2d/650/89/"
    );

    if (cookie) {
        // if the cookie was received, assign it as the value of a storage variable
        setLocalCookie(cookie);
        console.log('Cookie was set successfully');
    } else {
        console.log('Warning! Could not fetch the Cookie after 3 attempts. Aborting the process...');
        // close the application with an error if it is impossible to receive the cookie
        process.exit(1);
    }
};

async function readJsonFile(filePath: string): Promise<any> {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (error) {
        throw new Error(`Error reading json: ${error}`);
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function stripWhitespace(input: string): string {
    // Use a regular expression to replace all whitespace (including newline characters and tabs)
    return input.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
}

cookieSetup().then(() => {
    sleep(60000).then(() => {
        main();
    });
})
