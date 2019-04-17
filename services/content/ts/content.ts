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
    p.append(action[0], action[1]);
    return p;
}

async function readArticles(sender: string, request: any){
    let action = await new Promise<any>((resolve:any, reject:any)=>{
        let num = request.get("range");
        let type = request.get("type");
        let active = request.get("active");

        let std: any = {
            _id: 0,
            revisions: 0,
        }

        if(type == "headline"){
            std["body"] = 0;
            std["revisions"] = 0;
        }

        let a = {};
        if(active == "true"){
            a = {active:true};
        }

        mongoArticles.find(a, {
            projection: std,
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
    let action = await new Promise<any>((resolve:any, reject:any)=>{
        let id = request.get("id");
        mongoArticles.findOne({id:id}, (err:any, item:any)=>{
            if(err != null){
                resolve(["error","internal server error: 1"]);
                return;
            } else if(item && item.id){
                let updatedArticle = formalizeUpdatedArticle(
                    item,
                    request.get("date"),
                    request.get("body"),
                    request.get("tags"),
                    request.get("title"),
                    );
                
                mongoArticles.updateOne({id:id}, {$set: updatedArticle}, (err:any, res:any)=>{
                    if(err != null){
                        console.log(err);
                        resolve(["error","internal server error: 3"]);
                        return;
                    }
                    resolve(["data","success"]);
                });
            } else {
                resolve(["error","internal server error: 2"]);
                return;
            }
        });
    });
    let p = new gmbh.payload();
    p.append(action[0], action[1]);
    return p;
}

async function deleteArticle(sender: string, request: any){
    let action = await new Promise<any>((resolve:any, reject:any)=>{
        let id = request.get("id");
        mongoArticles.updateOne({id:id}, {$set: {active: false}}, (err:any, res:any)=>{
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

async function deleteArticles(sender: string, request: any){
    let p = new gmbh.payload();
    p.append("error", "unimp");
    return p;
}

function formalizeUpdatedArticle(article: any, newTime: string, newBody: string, newTags: string, newTitle: string){
    article.title = newTitle;
    article.tags = newTags;
    article.lastUpdate = newTime;
    article.revisions.push(article.body);
    article.body = newBody;
    article.active = true;
    return article;
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
        active: true,
        date: date,
        lastUpdate: lastUpdate,
        authors: authors,
        title: title,
        tags: tags,
        body: body,
        revisions: revisions,
    };
}