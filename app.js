/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express  = require('express'),
app         = express(),
request     = require('request'),
bluemix     = require('./config/bluemix'),
extend      = require('util')._extend,
url         = require('url'),
https       = require('https'),
fs          = require("fs"),
FormData    = require('form-data'),
Q           = require('q'); // for deferred requests

// Bootstrap application settings
require('./config/express')(app);

// if bluemix credentials exists, then override local
var dialogCredentials =  extend({
    url: "https://gateway.watsonplatform.net/dialog-beta/api",
    username: "53eebadd-bea8-4062-9fda-84d90f6f6091",
    password: "uFgKTZMGaVlr"
}, bluemix.getServiceCreds('dialog')); // VCAP_SERVICES

// if bluemix credentials exists, then override local
var nlcCredentials =  extend({
    "url": "https://gateway.watsonplatform.net/natural-language-classifier/api",
    "username": "b0ca94a4-c458-46f7-b5eb-65ebeefaa550",
    "password": "4jfd6dGAqxoh"
}, bluemix.getServiceCreds('nlc')); // VCAP_SERVICES

// Remove api as it will be passed from the web client
if (dialogCredentials.url.indexOf('/api') > 0)
    dialogCredentials.url = dialogCredentials.url.substring(0, dialogCredentials.url.indexOf('/api'));

// Pass user text to NLC to identify intent
app.use('/nlcIntent', function(req, res) {

    res.status(200);
    res.end("action-meeting-create");
    /*var classifierId = "";
    var serviceUrl = nlcCredentials.url + "/v1/classifier/" + classifierId + "/clasify";
    var options = {
        host: url.parse(serviceUrl).hostname,
        path: url.parse(serviceUrl).pathname,
        method: "GET",
        auth: _clientReq.body.username+":"+_clientReq.body.password, // http library base64 encodes for us
        headers:  headers
    };

    var body = {
        text: res.body.userIntentText
    };

    var request=https.request(options, function(response) {

        response.setEncoding('utf8');
        var data="";
        response.on('data',function(chunk) {
            data+=chunk;
        });
        response.on('end',function() {
            var json = JSON.parse(data);
            //res.status(response.statusCode);
            res.status(200);
            req.end("action-meeting-create");
            //req.end(json);
        });
        response.on('error',function(err) {
            // Fake it for now
            res.status(200);
            res.status("action-meeting-create");
        });
    });
    request.write(body);
    request.end();*/
});

// Upload the VPA dialog to the IBM Watson Dialog service
app.use('/uploadVpaDialog', function(req, res) {

    // set content length and other values to the header
    var filename = "VPA-v1.xml";
    var filePath = "dialogs/" + filename;

    var form = new FormData();
    form.append('name', "vpa_demo");
    form.append('file', fs.createReadStream(filePath));

    var serviceUrl = dialogCredentials.url + '/api/v1/dialogs';
    form.submit({
        protocol: 'https:',
        host: url.parse(serviceUrl).hostname,
        path: url.parse(serviceUrl).pathname,
        method: 'POST',
        auth: dialogCredentials.username+":"+dialogCredentials.password // http library base64 encodes for us
    }, function (err, response) {
        var data="";
        response.on('data',function(chunk) {
            data+=chunk;
        });
        response.on('end',function() {
            res.status(response.statusCode);
            if (response.statusCode == 200 || response.statusCode == 201) {
                res.end();
            }else{
                res.end(JSON.stringify(data));
            }
        });
        response.on('error',function(err) {
            console.log("response.statusCode: " + response.statusCode);
            res.status(response.statusCode);
            res.end(JSON.stringify(err));
        });
    });
});

// HTTP proxy to the API
app.use('/proxy', function(req, res) {
    var newUrl = dialogCredentials.url + req.url;
    req.pipe(request({
        url: newUrl,
        auth: {
            user: dialogCredentials.username,
            pass: dialogCredentials.password,
            sendImmediately: true
        }
    }, function(error){
        if (error)
            res.status(500).json({code: 500, error: errorMessage});
    })).pipe(res);
});

// render index page
app.get('/', function(req, res) {
    res.render('index');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.code = 404;
    err.message = 'Not Found';
    next(err);
});

// 500 error message
var errorMessage = 'There was a problem with the request, please try again';

// non 404 error handler
app.use(function(err, req, res, next) {
    var error = {
        code: err.code || 500,
        error: err.message || err.error || errorMessage
    };

    console.log('error:', error);
    res.status(error.code).json(error);
});

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);
