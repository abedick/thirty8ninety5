var gmbh = require('gmbh');
var passwordHash = require('password-hash');
var MongoClient = require('mongodb').MongoClient;
var jwt = require('jsonwebtoken');

var client: any;
var mongoUsers: any;

const MongoURL = "mongodb://localhost:27017";
const MongoDB = "gmbh";
const MongoCollection = "user_accounts";

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
    console.log(request.getTextfields('user'));
    console.log(request.getTextfields('pass'));
    let retval = client.NewPayload();
    retval.appendTextfields("result", `hello from n2; returning same message; message=${request.getTextfields('test')}`)
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

function generateToken(user:any): any {

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