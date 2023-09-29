import * as fs from 'fs';
import * as cookieManager from './cookie_manager';
import { setLocalCookie, getLocalCookie } from './cookie_storage.js';
import { insertData } from './insert_documents_supabase.js';

const axios = require('axios').default;
const UserAgent = require('user-agents');
const cheerio = require('cheerio');

const filePath = 'online_marketplace_antitrust.json'

async function readJsonFile(filePath: string): Promise<any> {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (error) {
        throw new Error(`Error reading json: ${error}`);
    }
}

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
            console.log(e);
            console.log('IScraper: could not fetch the page content from %s', url);
          return null;
        }
      }
}

async function main() {
    try {
        const jsonData = await readJsonFile(filePath);
        const scraper = new Scraper();

        for (let i = 0; i < jsonData.results.length; i++) {
            const caseID = jsonData.results[i].id;
            const caseName = jsonData.results[i].name_abbreviation;
            const decisionDate = jsonData.results[i].decision_date;
            const docketNumber = jsonData.results[i].docket_number;
            const volumeNumber = jsonData.results[i].volume.volume_number;
            const reporterFullName = jsonData.results[i].reporter.full_name;
            const courtName = jsonData.results[i].court.name;
            const frontendUrl = jsonData.results[i].frontend_url;

            console.log("Case Name:", caseName);
            console.log("Decision Date:", decisionDate);
            console.log("Docket Number:", docketNumber);
            console.log("Volume Number:", volumeNumber);
            console.log("Reporter Full Name:", reporterFullName);
            console.log("Court Name:", courtName);
            console.log("URL:", frontendUrl);

            await sleep(3000);
            let response = await scraper.run(frontendUrl)
            response = stripWhitespace(response);
            console.log(response);
            if (response != "") {
                // Add to supabase db
            }
        }     

    } catch (error) {
        console.log(error);
    }
}

async function cookieSetup() {
    // CookieManager call point
    // login/password values are stored in the .env file
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

cookieSetup().then(() => {
    sleep(5000).then(() => {
        main();
    });
})

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function stripWhitespace(input: string): string {
    // Use a regular expression to replace leading and trailing whitespace
    return input.replace(/^\s+|\s+$/g, '');
  }