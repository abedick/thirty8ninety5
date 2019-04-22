var gmbh = require('gmbh');
var passwordHash = require('password-hash');
var MongoClient = require('mongodb').MongoClient;
var jwt = require('jsonwebtoken');
var shortid = require('shortid');

var client: any;
var mongoUsers: any;

const MongoURL = process.env.MONGOURL != undefined ? process.env.MONGOURL : "";
const MongoDB = "gmbh";
const MongoCollection = "user_accounts";

var tmpSecret = process.env.RAILWAYAUTH != undefined ? process.env.RAILWAYAUTH : "";

function main(){
    console.log("starting auth server");
    
    if(tmpSecret == ""){
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

    client.Start().then(()=>{
        console.log("gmbh started");
    });

    MongoClient.connect(MongoURL, { useNewUrlParser: true },(err:any, client:any) => {
        if(err != null){
            console.log("error connecting to mongo");
            console.log(err);
            return;
        } 
        console.log("mongo started");
        mongoUsers = client.db(MongoDB).collection(MongoCollection);
    });
}

async function grantAuth(sender: string, request: any){
    console.log("incoming auth request");
    let user = request.get('user');
    let pass = request.get('pass');
    let result = await new Promise<any>((resolve:any, reject:any)=>{
        mongoUsers.findOne({username:user}, (err:any, item:any)=>{
            if(err != null){
                resolve(["error","internal server error: 1"]);
            } else if(item && item.username){
                if(passwordHash.verify(pass, item.password)){
                    resolve(["data",generateToken(item)]);
                } else {
                    resolve(["error","user or password is incorrect"]);
                }
            } else {
                resolve(["error","user or password is incorrect"]);
            }
        });
    });
    let retval = client.NewPayload();
    retval.append(result[0], result[1]);
    return retval;
}

async function register(sender: string, request: any) {
    let result = await new Promise<any>((resolve:any,reject:any)=>{
        let user = request.get('user');
        let email = request.get('email');
        let time = request.get('time');
        let pass = passwordHash.generate(request.get('pass'));
        mongoUsers.findOne({username:user}, (err:any, item:any)=>{
            if(err != null){
                resolve(["error","internal server error: 1"]);
            } else if(item && item.username){
                resolve(["error","user already exists"]);
            } else {
                // add user to database
                let usr = createUser(user,email,pass,time);
                mongoUsers.insertOne(usr, (err:any, item:any)=>{
                    if(err != null){
                        resolve(["error","internal server error: 2"]);
                    } else {
                        resolve(["data", generateToken(usr)]);
                    }
                });
            }
        });
    });
    let p = client.NewPayload();
    p.append(result[0],result[1]);
    return p;
}

async function read(sender: string, request: any){
    let action = await new Promise<any>((resolve:any, reject:any)=>{
        let id = request.get("id");
        mongoUsers.findOne({id:id}, (err:any, result:any)=>{
            if(err != null){
                resolve(["error","internal server error: 1"]);
                return;
            }
            if(result && result._id){
                delete result._id;
                delete result.password;
                resolve(["account", result]);
            } else {
                resolve(["error", "not found"]);
            }
        });
    });
    let p = new gmbh.payload();
    p.append(action[0], action[1]);
    return p;
}

async function readMany(sender: string, request: any){
    let action = await new Promise<any>((resolve:any, reject:any)=>{
        let num = request.get("range");
        mongoUsers.find({},{projection:{_id: 0, password:0}}).toArray( (err:any, result:any)=>{
            if(err != null){
                resolve(["error","internal server error: 1"]);
                return;
            }
            resolve(["users", result]);
        });
    });
    let p = new gmbh.payload();
    p.append(action[0], action[1]);
    return p;
}


async function update(sender: string, request: any){
    let action = await new Promise<any>((resolve:any, reject:any)=>{
        let id = request.get("id");
        let email = request.get("email");
        let perm = request.get("perm");
        mongoUsers.updateOne({id:id}, {$set: {email:email, perm:perm, active: true}}, (err:any, res:any)=>{
            if(err != null){
                console.log(err);
                resolve(["error","internal server error: 3"]);
                return;
            }
            resolve(["data","success"]);
        });
    });
    let p = new gmbh.payload();
    p.append(action[0], action[1]);
    return p;
}

async function del(sender: string, request: any){
    let action = await new Promise<any>( (resolve:any, reject:any)=>{
        let id = request.get("id");
        if(id == ""){
            resolve(["error", "id must not be empty"]);
            return;
        }
        mongoUsers.updateOne({id:id}, {$set: {active:false}}, (err:any, res:any)=>{
            if(err != null){
                console.log(err);
                resolve(["error","internal server error: 3"]);
                return; 
            }
        });
        resolve(["data","success"]);
    });
    let p = new gmbh.payload();
    p.append(action[0], action[1]);
    return p;
}

function generateToken(user:any): string {
    let str = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        data: {
            username: user.username,
            perm: user.perm,
        },
    }, tmpSecret);
    return str;
}

function createUser(user:string, email:string, passHash:string, time:string): object {
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