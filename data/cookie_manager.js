// 'user-agents' generates 'User-Agent' values for HTTP headers
// 'puppeteer-extra' - wrapper for 'puppeteer' library
const _ = require('lodash');
const UserAgent = require('user-agents');
const puppeteerXtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// hide from webserver that it is bot
puppeteerXtra.use(StealthPlugin());

class CookieManager {
	// this.browser & this.page - Chromium window and page instances 
  constructor() {
    this.browser = null;
    this.page = null;
    this.cookie = null;
  }

  // getter
  getCookie() {
    return this.cookie;
  }

  // setter
  setCookie(cookie) {
    this.cookie = cookie;
  }

  async fetchCookie(startpage) {
		// give 3 attempts to authorize and receive cookies
    const attemptCount = 3;

    try {
			// instantiate Chromium window and blank page 
      this.browser = await puppeteerXtra.launch({
        headless: 'false',
        args: ['--no-sandbox']
      });

			// Chromium instantiates blank page and sets 'User-Agent' header
      this.page = await this.browser.newPage();
      await this.page.setUserAgent((new UserAgent()).toString());

      for (let i = 0; i < attemptCount; i += 1) {
				// Chromium asks the web server for an authorization page
				//and waiting for DOM
        await this.page.goto(startpage, { waitUntil: ['domcontentloaded'] });

        await this.page.waitForTimeout(2000);

				// get the cookies and glue them into a string of the form <key>=<value> [; <key>=<value>]
        this.setCookie(
          _.join(
            _.map(
              await this.page.cookies(),
              ({ name, value }) => _.join([name, value], '='),
            ),
            '; ',
          ),
        );

				// when the cookie has been received, break the loop
        if (this.cookie) break;
      }

			// return cookie to call point (in index.js)
      return this.getCookie();
    } catch (err) {
      throw new Error(err);
    } finally {
			// close page and browser instances
      this.page && await this.page.close();
      this.browser && await this.browser.close();
    }
  }
}

// export singleton
module.exports = new CookieManager();