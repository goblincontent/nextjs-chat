"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var cookieManager = require("./cookie_manager");
var cookie_storage_js_1 = require("./cookie_storage.js");
var supabaseWrapper_js_1 = require("./supabaseWrapper.js");
var axios = require('axios').default;
var UserAgent = require('user-agents');
var cheerio = require('cheerio');
var filePath = 'data/online_marketplace_antitrust.json';
var Scraper = /** @class */ (function () {
    function Scraper() {
        this.axios = axios.create({
            headers: {
                cookie: (0, cookie_storage_js_1.getLocalCookie)(),
                'user-agent': (new UserAgent()).toString(),
            },
        });
        console.log("axios set");
    }
    Scraper.prototype.run = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var data, $, mainContentText, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('IScraper: working on %s', url);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.axios.get(url)];
                    case 2:
                        data = (_a.sent()).data;
                        $ = cheerio.load(data);
                        // if the cheerio object contains nodes, run Parser
                        // and return to index.js the result of parsing
                        if ($.length) {
                            mainContentText = $('div.main-content ');
                            return [2 /*return*/, mainContentText.text()];
                        }
                        console.log('IScraper: could not fetch or handle the page content from %s', url);
                        return [2 /*return*/, null];
                    case 3:
                        e_1 = _a.sent();
                        // console.log(e);
                        console.log('IScraper: could not fetch the page content from %s', url);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Scraper;
}());
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var jsonData, scraper, supabaseWrapper, i, caseName, frontendUrl, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, readJsonFile(filePath)];
                case 1:
                    jsonData = _a.sent();
                    scraper = new Scraper();
                    supabaseWrapper = new supabaseWrapper_js_1.SupabaseWrapper();
                    i = 22;
                    _a.label = 2;
                case 2:
                    if (!(i < jsonData.results.length)) return [3 /*break*/, 6];
                    caseName = jsonData.results[i].name_abbreviation;
                    frontendUrl = jsonData.results[i].frontend_url;
                    return [4 /*yield*/, sleep(60000)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, scraper.run(frontendUrl)];
                case 4:
                    response = _a.sent();
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
                            });
                        }
                    }
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function cookieSetup() {
    return __awaiter(this, void 0, void 0, function () {
        var cookie;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, cookieManager.fetchCookie("https://cite.case.law/f-supp-2d/650/89/")];
                case 1:
                    cookie = _a.sent();
                    if (cookie) {
                        // if the cookie was received, assign it as the value of a storage variable
                        (0, cookie_storage_js_1.setLocalCookie)(cookie);
                        console.log('Cookie was set successfully');
                    }
                    else {
                        console.log('Warning! Could not fetch the Cookie after 3 attempts. Aborting the process...');
                        // close the application with an error if it is impossible to receive the cookie
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
;
function readJsonFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var data, jsonData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs.promises.readFile(filePath, 'utf8')];
                case 1:
                    data = _a.sent();
                    jsonData = JSON.parse(data);
                    return [2 /*return*/, jsonData];
                case 2:
                    error_2 = _a.sent();
                    throw new Error("Error reading json: ".concat(error_2));
                case 3: return [2 /*return*/];
            }
        });
    });
}
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function stripWhitespace(input) {
    // Use a regular expression to replace all whitespace (including newline characters and tabs)
    return input.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
}
cookieSetup().then(function () {
    sleep(60000).then(function () {
        main();
    });
});
