var gmbh = require('gmbh');
var MongoClient = require('mongodb').MongoClient;

var client: any;
var mongoArticles: any;

const MongoURL = "mongodb://localhost:27017";
const MongoDB = "gmbh";
const MongoCollection = "user_accounts";


function main(){
    console.log("starting content server");

    client = new gmbh.gmbh();
    client.opts.service.name = "content";

    client.Route("create", createArticle);
    client.Route("read", readArticle);
    client.Route("readMany", readArticles);
    client.Route("update", updateArticle);
    client.Route("delete", deleteArticle);
    client.Route("deleteMany", deleteArticles);

    client.Start().then(()=>{
        console.log("gmbh started");
    });

    MongoClient.connect(MongoURL, { useNewUrlParser: true },(err:any, client:any) => {
        if(err != null){
            console.log(err);
            return;
        } 
        console.log("mongo started");
        mongoArticles = client.db(MongoDB).collection(MongoCollection);
    });

}
main();

async function createArticle(sender: string, request: any){
    let action = await new Promise<any>((resolve: any, reject: any)=>{

        let article = request.getJson('article');
        console.log(article);
        resolve("result");
    });

    let p = new gmbh.payload();
    return p;
}

async function readArticle(sender: string, request: any){
    let p = new gmbh.payload();
    return p;
}

async function readArticles(sender: string, request: any){
    let p = new gmbh.payload();
    return p;
}

async function updateArticle(sender: string, request: any){
    let p = new gmbh.payload();
    return p;
}

async function deleteArticle(sender: string, request: any){
    let p = new gmbh.payload();
    return p;
}

async function deleteArticles(sender: string, request: any){
    let p = new gmbh.payload();
    return p;
}

function formalizeArticle(
    date: string, 
    lastUpdate: string, 
    authors: [string], 
    title: string, 
    tags:[string], 
    body: string, 
    revisions: [string]){

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