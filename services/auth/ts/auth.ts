var gmbh = require('gmbh');
var passwordHash = require('password-hash');
var MongoClient = require('mongodb').MongoClient;
var jwt = require('jsonwebtoken');

var client: any;
var mongoUsers: any;

const MongoURL = "mongodb://localhost:27017";
const MongoDB = "gmbh";
const MongoCollection = "user_accounts";

var tmpSecret = process.env.RAILWAYAUTH;

function main(){
    console.log("starting auth server");
    
    client = new gmbh.gmbh();
    client.opts.service.name = "auth";
    
    client.Route("grant", grantAuth);
    client.Route("register", register);

    client.Start().then(()=>{
        console.log("gmbh started");
    });

    MongoClient.connect(MongoURL, { useNewUrlParser: true },(err:any, client:any) => {
        if(err != null){
            console.log(err);
            return;
        } 
        console.log("mongo started");
        mongoUsers = client.db(MongoDB).collection(MongoCollection);
    });
}

async function grantAuth(sender: string, request: any){
    console.log("incoming auth request");
    let user = request.getTextfields('user');
    let pass = request.getTextfields('pass');
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
    retval.appendTextfields(result[0], result[1]);
    return retval;
}

async function register(sender: string, request: any) {
    let result = await new Promise<any>((resolve:any,reject:any)=>{
        let user = request.getTextfields('user');
        let email = request.getTextfields('email');
        let pass = passwordHash.generate(request.getTextfields('pass'));
        mongoUsers.findOne({username:user}, (err:any, item:any)=>{
            if(err != null){
                resolve(["error","internal server error: 1"]);
            } else if(item && item.username){
                resolve(["error","user already exists"]);
            } else {
                // add user to database
                let usr = createUser(user,email,pass);
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
    console.log("registration-request: result="+result[0]+", "+result[1]);
    let p = client.NewPayload();
    p.appendTextfields(result[0],result[1]);
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

function createUser(user:string, email:string, passHash:string): object {
    let t = new Date();
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