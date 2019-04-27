var gmbh = require('gmbh');
var client;
function main() {
    console.log("starting logging server");
    client = new gmbh.gmbh();
    client.opts.service.name = "logger";
    client.Start().then(function () {
        console.log("gmbh started");
    });
}
main();