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
var passwordHash = require('password-hash');
var MongoClient = require('mongodb').MongoClient;
var jwt = require('jsonwebtoken');
var client;
var mongoUsers;
var MongoURL = "mongodb://localhost:27017";
var MongoDB = "gmbh";
var MongoCollection = "user_accounts";
// store a different secret in an env file...
var tmpSecret = "a7FH7LxBwBCzt0XbWc3kVQJYS5ENZ97LOpM6MnN2gH2JsmIXwct0cLetIXGe7Od27s8BIaGmI7qiQNlUDKi3ptyMKz4gKpwbtqJrAPrZbcZ9i6e35TQFoBE8ngA/ehYphNARjKSogo3EU/eFi/6lizp+8s5fJU7O/t82MQSfTS2oRHdaEILS3fl32s1ryDm+tR+VGT3RqvNynYW0WQb5GN2RLYwZ+liAgrb5MbljACOMtulcWrPYJpWLR9fKGs/Azj5JGdhReVket/CBJ0SFhW9EtW6e2YkNv9rTQpZNqB9yA1pOLPKQJPefux2K86/efTRIfTPgc5q8ERtP1s4ZyA==";
function main() {
    console.log("starting auth server");
    client = new gmbh.gmbh();
    client.opts.service.name = "auth";
    client.Route("grant", grantAuth);
    client.Route("register", register);
    client.Start().then(function () {
        console.log("gmbh started");
    });
    MongoClient.connect(MongoURL, { useNewUrlParser: true }, function (err, client) {
        if (err != null) {
            console.log(err);
            return;
        }
        console.log("mongo started");
        mongoUsers = client.db(MongoDB).collection(MongoCollection);
    });
}
function grantAuth(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var user, pass, result, retval;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("incoming auth request");
                    user = request.getTextfields('user');
                    pass = request.getTextfields('pass');
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            mongoUsers.findOne({ username: user }, function (err, item) {
                                if (err != null) {
                                    resolve(["error", "internal server error: 1"]);
                                }
                                else if (item && item.username) {
                                    if (passwordHash.verify(pass, item.password)) {
                                        resolve(["data", generateToken(item)]);
                                    }
                                    else {
                                        resolve(["error", "user or password is incorrect"]);
                                    }
                                }
                                else {
                                    resolve(["error", "user or password is incorrect"]);
                                }
                            });
                        })];
                case 1:
                    result = _a.sent();
                    retval = client.NewPayload();
                    retval.appendTextfields(result[0], result[1]);
                    return [2 /*return*/, retval];
            }
        });
    });
}
function register(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var result, p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        var user = request.getTextfields('user');
                        var email = request.getTextfields('email');
                        var pass = passwordHash.generate(request.getTextfields('pass'));
                        mongoUsers.findOne({ username: user }, function (err, item) {
                            if (err != null) {
                                resolve(["error", "internal server error: 1"]);
                            }
                            else if (item && item.username) {
                                resolve(["error", "user already exists"]);
                            }
                            else {
                                // add user to database
                                var usr_1 = createUser(user, email, pass);
                                mongoUsers.insertOne(usr_1, function (err, item) {
                                    if (err != null) {
                                        resolve(["error", "internal server error: 2"]);
                                    }
                                    else {
                                        resolve(["data", generateToken(usr_1)]);
                                    }
                                });
                            }
                        });
                    })];
                case 1:
                    result = _a.sent();
                    console.log("registration-request: result=" + result[0] + ", " + result[1]);
                    p = client.NewPayload();
                    p.appendTextfields(result[0], result[1]);
                    return [2 /*return*/, p];
            }
        });
    });
}
function generateToken(user) {
    var str = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        data: {
            username: user.username,
            perm: user.perm,
        },
    }, tmpSecret);
    return str;
}
function createUser(user, email, passHash) {
    var t = new Date();
    return {
        username: user,
        password: passHash,
        email: email,
        created: t.toString(),
        updated: t.toString(),
        perm: "user",
    };
}
main();
