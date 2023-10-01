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
var openai_1 = require("langchain/embeddings/openai");
var text_splitter_1 = require("langchain/text_splitter");
var document_1 = require("langchain/document");
var supabase_1 = require("langchain/vectorstores/supabase");
var supabaseWrapper_js_1 = require("./supabaseWrapper.js");
require('dotenv').config();
// Responsible for creating openAI embeddings
var EmbeddingsManager = /** @class */ (function () {
    function EmbeddingsManager() {
        this.textSplitter = new text_splitter_1.TokenTextSplitter({
            encodingName: "cl100k_base",
            chunkOverlap: 20,
            chunkSize: 400
        });
        this.supabaseWrapperCaseChunks = new supabaseWrapper_js_1.SupabaseWrapper("case_chunks");
    }
    EmbeddingsManager.prototype.addDocumentToVectorStore = function (document, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var docs, embeddings, store, _i, docs_1, doc, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.textSplitter.splitDocuments([
                                new document_1.Document({
                                    pageContent: document,
                                    metadata: metadata
                                })
                            ])];
                    case 1:
                        docs = _a.sent();
                        embeddings = new openai_1.OpenAIEmbeddings();
                        store = new supabase_1.SupabaseVectorStore(embeddings, {
                            client: this.supabaseWrapperCaseChunks.supabase,
                            tableName: this.supabaseWrapperCaseChunks.tableName
                        });
                        console.log("Adding documents");
                        _i = 0, docs_1 = docs;
                        _a.label = 2;
                    case 2:
                        if (!(_i < docs_1.length)) return [3 /*break*/, 5];
                        doc = docs_1[_i];
                        return [4 /*yield*/, store.addDocuments([doc])];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error("Problem adding document to vector store: ", error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    EmbeddingsManager.prototype.forceStringIntoUtf8 = function (text) {
        var enc = new TextEncoder();
        return new TextDecoder("utf-8").decode(enc.encode(text));
    };
    EmbeddingsManager.prototype.parseText = function (case_id, text) {
        return __awaiter(this, void 0, void 0, function () {
            var firstIndex, textSection, jsonBlob, parsedJson_1, keysToFilterOut_1, filteredJson, metadata, text_utf8, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        firstIndex = findNthLastIndexOf(text, "{", 5);
                        if (!text.substring(firstIndex).includes("@context")) {
                            firstIndex = findNthLastIndexOf(text, "{", 6);
                        }
                        if (!firstIndex) return [3 /*break*/, 5];
                        textSection = text.substring(0, firstIndex);
                        jsonBlob = text.substring(firstIndex);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        parsedJson_1 = JSON.parse(jsonBlob);
                        keysToFilterOut_1 = ["@context", "@type", "mainEntityOfPage", "publisher", "genre", "image", "dateCreated"];
                        filteredJson = Object.keys(parsedJson_1).reduce(function (result, key) {
                            if (!keysToFilterOut_1.includes(key)) {
                                result[key] = parsedJson_1[key];
                            }
                            return result;
                        }, {});
                        metadata = {
                            "case_id": case_id,
                            "author_name": filteredJson.author.name,
                            "keywords": filteredJson.keywords,
                            "date_published": filteredJson.datePublished,
                            "description": filteredJson.description
                        };
                        text_utf8 = this.forceStringIntoUtf8(textSection);
                        return [4 /*yield*/, this.addDocumentToVectorStore(text_utf8, metadata)];
                    case 2:
                        _a.sent();
                        console.log("Done: ", case_id);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Error parsing json blob, ", error_2);
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        console.log("No json blob found");
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return EmbeddingsManager;
}());
function findNthLastIndexOf(input, charToFind, n) {
    var lastIndex = input.lastIndexOf(charToFind);
    while (lastIndex !== -1 && n > 1) {
        lastIndex = input.lastIndexOf(charToFind, lastIndex - 1);
        n--;
    }
    return lastIndex;
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var embeddingsManager, supabaseCases, allData, _i, allData_1, row;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    embeddingsManager = new EmbeddingsManager();
                    supabaseCases = new supabaseWrapper_js_1.SupabaseWrapper("cases");
                    return [4 /*yield*/, supabaseCases.getData()];
                case 1:
                    allData = _a.sent();
                    _i = 0, allData_1 = allData;
                    _a.label = 2;
                case 2:
                    if (!(_i < allData_1.length)) return [3 /*break*/, 5];
                    row = allData_1[_i];
                    return [4 /*yield*/, embeddingsManager.parseText(row.case_id, row.case_text)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
main();
