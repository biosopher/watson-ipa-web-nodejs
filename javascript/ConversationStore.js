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

// require nano - lightweight cloudant access.
var cloudant = require('cloudant'),
bluemix     = require('../config/bluemix'),
extend      = require('util')._extend;

var CONVERSATIONS_DATABASE = 'ipa_conversations';

// if bluemix credentials exists, then override local
var cloudantCredentials =  extend({
    url: "https://cd27023a-13b8-4e54-b65c-da92c09e1be9-bluemix:67c20ddada4d3f10b6fee20be87314f7c044cafb9429c7e21f82d3731784da68@cd27023a-13b8-4e54-b65c-da92c09e1be9-bluemix.cloudant.com",
    username: "<username>",
    password: "<password>"
}, bluemix.getServiceCreds('cloudantNoSQLDB')); // VCAP_SERVICES


var conversationsDB;
var cloudantService = cloudant({account:cloudantCredentials.username, password:cloudantCredentials.password});
cloudantService.db.list(function(err, allDbs) {

    //destroyDatabase();
    if(typeof allDbs != 'undefined'){
        for (var i = 0; i < allDbs.length; i++) {
            if (allDbs[0] == CONVERSATIONS_DATABASE) {
                conversationsDB = cloudantService.db.use(CONVERSATIONS_DATABASE)
                console.log('Cloudant database ready');
                return;
            }
        }
    }
    createDatabase();
});

exports.storeConversation = function(conversationObj) {

    // if{} here has two effects:
    // 1. Avoid errors if cloudant service not enabled
    // 2. database creation can take awhile first time app launches so prevent errors
    if (conversationsDB) {
        conversationObj._id = conversationObj.dialog_id + "_" + conversationObj.conversation_id;
        conversationsDB.insert(conversationObj,function(err, body, header) {
            if (err) {
                updateConversation(conversationObj);
            }else{
                var conversationJson = JSON.stringify(conversationObj, null, 2);
                console.log('Inserted conversation: ' + conversationJson);
            }
        });
    }
}

function updateConversation(conversationObj) {

    conversationsDB.get(conversationObj._id,{ revs_info: true },function(err, body, header) {
        if (err) {
            console.log('conversationsDB.get failed', JSON.stringify(err));
            module.exports.storeConversation(conversationObj);
        }else{
            conversationObj._rev = body._rev;
            module.exports.storeConversation(conversationObj);
        }
    });
}

exports.printConversations = function() {

    var conversations = initDatabase();

    // fetch the primary index
    conversations.list(function(err, body){
        if (err) {
            // something went wrong!
            throw new Error(err);
        } else {
            // print all the documents in our database
            console.log(body);
        }
    });
}

function createDatabase() {
    cloudantService.db.create(CONVERSATIONS_DATABASE, function(err) {
        if (err) {
            console.log('Failure to create the cloudant database', JSON.stringify(err));
        } else {
            conversationsDB = cloudantService.db.use(CONVERSATIONS_DATABASE)
            console.log('Created Cloudant database');
        }
    });
}

function destroyDatabase() {
    cloudantService.db.destroy(CONVERSATIONS_DATABASE, function(err) {
        console.log('Destroyed Cloudant database');
        createDatabase();
    });
}

