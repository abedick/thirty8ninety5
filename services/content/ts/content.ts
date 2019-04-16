var gmbh = require('gmbh');
var MongoClient = require('mongodb').MongoClient;
var shortid = require('shortid');

var client: any;
var mongoArticles: any;

const MongoURL = "mongodb://localhost:27017";
const MongoDB = "gmbh";
const MongoCollection = "articles";


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
        let article = formalizeArticle(
            request.get('date'),
            request.get('date'),
            request.get('author'),
            request.get('title'),
            request.get('tags'),
            request.get('body'),
            [""],
        );
        console.log(article);
        mongoArticles.insertOne(article, (err:any, item:any)=>{
            if(err != null){
                resolve(["error","internal server error: 1"]);
            } else {
                resolve(["data", article.id]);
            }
        });
    });
    let p = new gmbh.payload();
    p.append(action[0],action[1]);
    return p;
}

async function readArticle(sender: string, request: any){
    let action = await new Promise<any>((resolve:any, reject:any)=>{
        let id = request.get('id');
        mongoArticles.findOne({id:id}, (err:any, item:any)=>{
            if(err != null){
                resolve(["error","internal server error: 1"]);
            } else if(item && item.id){
                resolve(["data", item]);
            } else {
                resolve(["error","could not find article with specified id"]);
            }
        });
    });
    let p = new gmbh.payload();
    console.log(action);
    p.append(action[0], action[1]);
    return p;
}

async function readArticles(sender: string, request: any){
    let action = await new Promise<any>((resolve:any, reject:any)=>{
        mongoArticles.find({}, {
            projection: {
                _id: 0,
                revisions: 0,
            }
        }).toArray((err:any, result:any)=>{
            if(err != null){
                resolve(["error","internal server error: 1"]);
                return;
            }
            resolve(["articles", result]);
        });
    });
    let p = new gmbh.payload();
    p.append(action[0], action[1]);
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
        id: shortid.generate(),
        date: date,
        lastUpdate: lastUpdate,
        authors: authors,
        title: title,
        tags: tags,
        body: body,
        revisions: revisions,
    };
}