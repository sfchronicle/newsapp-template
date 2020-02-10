#!/usr/bin/env node

var { google } = require("googleapis");
var chalk = require("chalk");
var opn = require("opn");

var http = require("http");
var os = require("os");
var path = require("path");
var url = require("url");
var fs = require("fs");
var writeFile = require('write');

var tokenLocation = path.join(os.homedir(), ".google_oauth_token");

var authenticate = function() {
  // If it's coming from EC2, pull from project
  if (process.env.GOOGLE_OAUTH_SYSTEM === "EC2"){
    tokenLocation = "../.google_oauth_token";
  }

  var tokens = fs.readFileSync(tokenLocation, "utf-8");
  tokens = JSON.parse(tokens);
  auth = new google.auth.OAuth2(process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_OAUTH_CONSUMER_SECRET);
  auth.setCredentials(tokens);

  auth.on("tokens", function(update) {
    Object.assign(tokens, update);
    fs.writeFileSync(tokenLocation, JSON.stringify(tokens, null, 2));
  });

  return auth;
};

var task = function() {
  // var done = this.async();

  var clientID = process.env.GOOGLE_OAUTH_CLIENT_ID;
  var secret = process.env.GOOGLE_OAUTH_CONSUMER_SECRET;

  var client = new google.auth.OAuth2(clientID, secret, "http://localhost:8000/authenticate/");
  google.options({
    auth: client
  });

  var scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets"
  ];

  var authURL = client.generateAuthUrl({
    access_type: "offline",
    scope: scopes.join(" "),
    prompt: "consent"
  });

  var onRequest = function(request, response) {
    response.setHeader("Connection", "close");
    if (request.url.indexOf("authenticate") > -1) {
      return onAuthenticated(request, response);
    } else if (request.url.indexOf("authorize") > -1) {
      response.setHeader("Location", authURL);
      response.writeHead(302);
    } else {
      response.writeHead(404);
    }
    response.end();
  };

  var onAuthenticated = async function(request, response) {
    var requestURL = request.url[0] == "/" ? "localhost:8000" + request.url : request.url;
    var query = new url.URL(requestURL).searchParams;
    var code = query.get("code");
    if (!code) return;
    try {
      var token = await client.getToken(code);
      var tokens = token.tokens;
      writeFile(tokenLocation, JSON.stringify(tokens, null, 2), function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Authenticated " + filename);
        }
      });
    } catch (err) {
      response.end(err);
    }


  };

  var server = http.createServer(onRequest);
  //server.listen(8000, () => opn("http://localhost:8000/authorize"));

}

task.authenticate = authenticate;
module.exports = task;
