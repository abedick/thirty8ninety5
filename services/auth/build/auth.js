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
var shortid = require('shortid');
var client;
var mongoUsers;
var MongoURL = process.env.MONGOURL != undefined ? process.env.MONGOURL : "";
var MongoDB = "gmbh";
var MongoCollection = "user_accounts";
var tmpSecret = process.env.RAILWAYAUTH != undefined ? process.env.RAILWAYAUTH : "";
function main() {
    console.log("starting auth server");
    if (tmpSecret == "") {
        console.log("could not parse RAILWAYAUTH env var");
        process.exit(1);
    }
    client = new gmbh.gmbh();
    client.opts.service.name = "auth";
    client.opts.runtime.verbose = true;
    client.Route("grant", grantAuth);
    client.Route("register", register);
    client.Route("read", read);
    client.Route("readMany", readMany);
    client.Route("update", update);
    client.Route("delete", del);
    client.Start().then(function () {
        console.log("gmbh started");
    });
    MongoClient.connect(MongoURL, { useNewUrlParser: true }, function (err, client) {
        if (err != null) {
            console.log("error connecting to mongo");
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
                    user = request.get('user');
                    pass = request.get('pass');
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
                    retval.append(result[0], result[1]);
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
                        var user = request.get('user');
                        var email = request.get('email');
                        var time = request.get('time');
                        var pass = passwordHash.generate(request.get('pass'));
                        mongoUsers.findOne({ username: user }, function (err, item) {
                            if (err != null) {
                                resolve(["error", "internal server error: 1"]);
                            }
                            else if (item && item.username) {
                                resolve(["error", "user already exists"]);
                            }
                            else {
                                // add user to database
                                var usr_1 = createUser(user, email, pass, time);
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
                    p = client.NewPayload();
                    p.append(result[0], result[1]);
                    return [2 /*return*/, p];
            }
        });
    });
}
function read(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var action, p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        var id = request.get("id");
                        mongoUsers.findOne({ id: id }, function (err, result) {
                            if (err != null) {
                                resolve(["error", "internal server error: 1"]);
                                return;
                            }
                            if (result && result._id) {
                                delete result._id;
                                delete result.password;
                                resolve(["account", result]);
                            }
                            else {
                                resolve(["error", "not found"]);
                            }
                        });
                    })];
                case 1:
                    action = _a.sent();
                    p = new gmbh.payload();
                    p.append(action[0], action[1]);
                    return [2 /*return*/, p];
            }
        });
    });
}
function readMany(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var action, p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        var num = request.get("range");
                        mongoUsers.find({}, { projection: { _id: 0, password: 0 } }).toArray(function (err, result) {
                            if (err != null) {
                                resolve(["error", "internal server error: 1"]);
                                return;
                            }
                            resolve(["users", result]);
                        });
                    })];
                case 1:
                    action = _a.sent();
                    p = new gmbh.payload();
                    p.append(action[0], action[1]);
                    return [2 /*return*/, p];
            }
        });
    });
}
function update(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var action, p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        var id = request.get("id");
                        var email = request.get("email");
                        var perm = request.get("perm");
                        mongoUsers.updateOne({ id: id }, { $set: { email: email, perm: perm, active: true } }, function (err, res) {
                            if (err != null) {
                                console.log(err);
                                resolve(["error", "internal server error: 3"]);
                                return;
                            }
                            resolve(["data", "success"]);
                        });
                    })];
                case 1:
                    action = _a.sent();
                    p = new gmbh.payload();
                    p.append(action[0], action[1]);
                    return [2 /*return*/, p];
            }
        });
    });
}
function del(sender, request) {
    return __awaiter(this, void 0, void 0, function () {
        var action, p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        var id = request.get("id");
                        if (id == "") {
                            resolve(["error", "id must not be empty"]);
                            return;
                        }
                        mongoUsers.updateOne({ id: id }, { $set: { active: false } }, function (err, res) {
                            if (err != null) {
                                console.log(err);
                                resolve(["error", "internal server error: 3"]);
                                return;
                            }
                        });
                        resolve(["data", "success"]);
                    })];
                case 1:
                    action = _a.sent();
                    p = new gmbh.payload();
                    p.append(action[0], action[1]);
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
function createUser(user, email, passHash, time) {
    return {
        id: shortid.generate(),
        active: true,
        username: user,
        password: passHash,
        email: email,
        created: time,
        updated: time,
        perm: "user",
    };
}
main();
