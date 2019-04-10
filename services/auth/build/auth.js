"use strict";
var gmbh = require('gmbh');
var client;
function main() {
    console.log("starting auth server");
    client = new gmbh.gmbh();
    client.opts.service.name = "auth";
    client.Route("grant", grantAuth);
    client.Start().then(function () { });
}
function grantAuth(sender, request) {
    console.log("incoming auth request");
    console.log(request.getTextfields('user'));
    console.log(request.getTextfields('pass'));
    var retval = client.NewPayload();
    retval.appendTextfields("result", "hello from n2; returning same message; message=" + request.getTextfields('test'));
    return retval;
}
main();
