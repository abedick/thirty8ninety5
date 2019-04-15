"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var gmbh = require('gmbh');
var MongoClient = require('mongodb').MongoClient;
var client;
var mongoArticles;
var MongoURL = "mongodb://localhost:27017";
var MongoDB = "gmbh";
var MongoCollection = "user_accounts";
function main() {
    console.log("starting content server");
    client = new gmbh.gmbh();
    client.opts.service.name = "content";
    client.Route("create", createArticle);
    client.Route("read", readArticle);
    client.Route("readMany", readArticles);
    client.Route("update", updateArticle);
    client.Route("delete", deleteArticle);
    client.Route("deleteMany", deleteArticles);
    client.Start().then(function () {
        console.log("gmbh started");
    });
    MongoClient.connect(MongoURL, { useNewUrlParser: true }, function (err, client) {
        if (err != null) {
            console.log(err);
            return;
        }
        console.log("mongo started");
        mongoArticles = client.db(MongoDB).collection(MongoCollection);
    });
}
main();
function createArticle(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var action, p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        var article = request.getJson('article');
                        console.log(article);
                        resolve("result");
                    })];
                case 1:
                    action = _a.sent();
                    p = new gmbh.payload();
                    return [2 /*return*/, p];
            }
        });
    });
}
function readArticle(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var p;
        return __generator(this, function (_a) {
            p = new gmbh.payload();
            return [2 /*return*/, p];
        });
    });
}
function readArticles(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var p;
        return __generator(this, function (_a) {
            p = new gmbh.payload();
            return [2 /*return*/, p];
        });
    });
}
function updateArticle(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var p;
        return __generator(this, function (_a) {
            p = new gmbh.payload();
            return [2 /*return*/, p];
        });
    });
}
function deleteArticle(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var p;
        return __generator(this, function (_a) {
            p = new gmbh.payload();
            return [2 /*return*/, p];
        });
    });
}
function deleteArticles(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var p;
        return __generator(this, function (_a) {
            p = new gmbh.payload();
            return [2 /*return*/, p];
        });
    });
}
function formalizeArticle(date, lastUpdate, authors, title, tags, body, revisions) {
    return {
        date: date,
        lastUpdate: lastUpdate,
        authors: authors,
        title: title,
        tags: tags,
        body: body,
        revisions: revisions,
    };
}