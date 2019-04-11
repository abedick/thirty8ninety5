var gmbh = require('gmbh');
var passwordHash = require('password-hash');
var MongoClient = require('mongodb').MongoClient;

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
    console.log("incoming auth request");

    let user = request.getTextfields('user');
    let email = request.getTextfields('email');
    let pass = passwordHash.generate(request.getTextfields('pass'));

    let CheckDatabase = ():Promise<any>=>{
        return new Promise<any>((resolve:any,reject:any)=>{
            mongoUsers.findOne({username:user}, (err:any, item:any)=>{
                if(err != null){
                    console.log(err);
                    let p = client.NewPayload();
                    p.appendTextfields("error", "internal server error: 1");
                    resolve(p);
                    return;
                } 
                if(item && item.username){
                    let p = client.NewPayload();
                    p.appendTextfields("data", "user already exists");
                    resolve(p);
                    return;
                } else {
                    // add user to database
                    mongoUsers.insertOne(createUser(user,email,pass), (err:any, item:any)=>{
                        if(err != null){
                            console.log(err);
                            let p = client.NewPayload();
                            p.appendTextfields("error", "internal server error: 2");
                            resolve(p);
                            return;
                        }

                        let p = client.NewPayload();
                        p.appendTextfields("data", "user-added");
                        resolve(p);

                    });
                }
            });
        });
    };
    return await CheckDatabase();
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