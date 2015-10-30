/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

var isCreatingMeetingViaDialog = false;
var IPA_DIALOG_NAME = "ipa_demo";
var IPA_CLASSIFIER_NAME = "ipa_demo";
var ipaDialog = null;
var ipaNlcClassifier = null;
var conversation = {};

var $dialogsLoading = $('.dialogs-loading');
var $dialogsError = $('.dialogs-error');

// conversation nodes
var $conversationDiv = $('.conversation-div');
var $conversation = $('.conversation-container');
var $information = $('.information-container');
var $profile = $('.profile-container');
var $userInput = $('.user-input');

// initial load
$(document).ready(function() {

    retrieveDialogs();

    $('.input-btn').click(conductConversation);
    $userInput.keyup(function(event){
        if(event.keyCode === 13) {
            conductConversation();
        }
    });
});

function retrieveDialogs() {
    $dialogsLoading.show();
    $dialogsError.hide();

    $.get('/proxy/api/v1/dialogs?proxyType=dialog')
        .done(function(data) {
            if (data != '') {
                data.dialogs.forEach(function(dialog, index) {
                    if (dialog.name == IPA_DIALOG_NAME) {
                        ipaDialog = dialog;
                    }
                });
            }

            if (ipaDialog == null) {
                $dialogsLoading.hide();
                $dialogsError.find('.errorMsg').html('No dialog named "' + IPA_DIALOG_NAME + '" found in the Dialog service');
                $dialogsError.show();
            }else{
                retrieveClassifiers();
            }
        }).fail(function() {
            $dialogsLoading.hide();
            $dialogsError.show();
            $dialogsError.find('.errorMsg').html('Error getting the dialogs.');
        })
}

function retrieveClassifiers() {

    $.get('/proxy/api/v1/classifiers?proxyType=nlc')
        .done(function(data) {
            if (data != '') {
                data.classifiers.forEach(function(classifier, index) {
                    if (classifier.name == IPA_CLASSIFIER_NAME) {
                        ipaNlcClassifier = classifier;
                    }
                });
            }

            if (ipaNlcClassifier == null) {
                $dialogsLoading.hide();
                $dialogsError.find('.errorMsg').html('No classifier named "' + IPA_CLASSIFIER_NAME + '" found in the NLC service');
                $dialogsError.show();
            }else{
                initConversation();
            }
        }).fail(function() {
            $dialogsLoading.hide();
            $dialogsError.show();
            $dialogsError.find('.errorMsg').html('Error getting the dialogs.');
        })
}

function initConversation() {

    $.post('/proxy/api/v1/dialogs/' + ipaDialog.dialog_id + '/conversation?proxyType=dialog', {input: ''})
        .done(function(data) {
            $conversation.empty();
            $information.empty();
            $dialogsLoading.hide();

            // save dialog, client and conversation id
            conversation.conversation_id = data.conversation_id;
            conversation.client_id = data.client_id;
            conversation.dialog_id = ipaDialog.dialog_id;
            $('<div/>').text('Dialog name: ' + ipaDialog.name).appendTo($information);
            $('<div/>').text('Dialog id: ' + conversation.dialog_id).appendTo($information);
            $('<div/>').text('Conversation id: ' + conversation.conversation_id).appendTo($information);
            $('<div/>').text('Client id: ' + conversation.client_id).appendTo($information);

            var text = data.response.join('<br/>');
            displayWatsonChat(text);
        });
}

/**
 * Let Watson Dialog Services help us out
 */
function handOffToDialog(userIntentText) {

    var path = '/proxy/api/v1/dialogs/' + conversation.dialog_id + '/conversation?proxyType=dialog';
    var params = {
        input: userIntentText,
        conversation_id: conversation.conversation_id,
        client_id: conversation.client_id
    };

    $.post(path, params).done(function(data) {
        var text = data.response.join('<br/>');
        displayWatsonChat(text);

        getProfile();
        scrollToBottom();
    }).fail(function(response){
        displayWatsonChat("I'm unable to process your request at the moment.");
        scrollToBottom();
    });
}

/**
 * Determine how we should respond
 */
function conductConversation(){

    var userIntentText = $userInput.val();
    if (userIntentText == "") {
        displayWatsonChat("Please speak up.  I can't hear you");
    }else{
        $userInput.val('').focus();

        displayHumanChat(userIntentText);

        if (isCreatingMeetingViaDialog) {
            handOffToDialog(userIntentText);
        }else{
            determineUserIntent(userIntentText);
        }
    }
}

function getProfile() {
    var path = '/proxy/api/v1/dialogs/' + conversation.dialog_id + '/profile?proxyType=dialog';
    var params = {
        conversation_id: conversation.conversation_id,
        client_id: conversation.client_id
    };

    var attendeeFound = false;
    var timeFound = false;
    var dateFound = false;
    $.get(path, params).done(function(data) {
        $profile.empty();
        data.name_values.forEach(function(par) {
            if (par.value !== '') {
                $('<div/>').text(par.name + ': ' + par.value).appendTo($profile);
                if (par.name == "invite_attendee1") {
                    attendeeFound = true;
                }else if (par.name == "invite_time") {
                    timeFound = true;
                }else if (par.name == "invite_date") {
                    dateFound = true;
                }
            }
        });

        // Test if meeting ready to schedule
        if (attendeeFound && timeFound && dateFound) {
            // meetingReadyToSchedule = true;
            // Process scheduling of meeting here
            isCreatingMeetingViaDialog = false;
        }
    });
}

function getReplyToIntent(nlcResponse, userText)
{
    var replyText = null;
    isCreatingMeetingViaDialog = false;
    console.log(userText + ": " + nlcResponse.top_class);
    switch (nlcResponse.top_class) {
        case "action-meeting-create":
            isCreatingMeetingViaDialog = true;
            break;
        case "respond-off-topic-joke-or-riddle":
            replyText = JokesPipeline.nextJoke();
            break;
        case "respond-calculation-numeric":
            replyText = CalculationPipeline.numericCalculation(userText);
            break;
        case "respond-calculation-conversion":
            replyText = CalculationPipeline.conversionCalculation(userText);
            break;
        case "action-email-create":
            replyText = "Sorry.  Email creation is not supported.";
            break;
        case "action-task-create":
            replyText = "Sorry.  Task creation is not supported.";
            break;
        case "respond-off-topic-math":
            replyText = "Oops...my calculator's batteries are dead.";
            break;
        case "respond-off-topic-nonsense-input":
            replyText = "Looks like your keyboard isn't functioning properly.";
            break;
        case "respond-off-topic-science":
            replyText = "Sorry, my science cartridge isn't installed yet.";
            break;
        case "respond-off-topic-philosophy":
            replyText = "Ahhh...such are the mysteries of life";
            break;
        case "respond-off-topic-user-focus":
            replyText = "Sounds like you've had a very busy day.";
            break;
        case "respond-off-topic-watson-focus":
            replyText = "Are you trying to figure out if I'm a robot or a human?";
            break;
        case "respond-server-error":
            replyText = "Sorry. One of my cognitive systems is not working at the moment.";
            break;
        default:
            replyText = "Sorry.  I don't understand your question.";
            break;
    }
    return replyText;
}

function displayWatsonChat(text) {

        $('<div class="bubble-watson"/>').html(text)
        .appendTo($conversation);
    scrollToBottom();
}

function displayHumanChat(text) {

    $('<p class="bubble-human"/>').html(text)
        .appendTo($conversation);

    $('<div class="clear-float"/>')
        .appendTo($conversation);

    scrollToBottom();
}

function determineUserIntent(userIntentText) {

    var encodedText = encodeURIComponent(userIntentText);
    $.get('/proxy/api/v1/classifiers/' + ipaNlcClassifier.classifier_id + '/classify?proxyType=nlc&text=' + encodedText)
        .done(function(data) {

            var replyText = getReplyToIntent(data, userIntentText);
            if (isCreatingMeetingViaDialog) {
                handOffToDialog(userIntentText);
            }else {
                displayWatsonChat(replyText);
                displayWatsonChat("Is there anything else I can help you with?");
            }
        }).fail(function(response){
            console.log("StatusCode (" + response.status + "): " + response.statusText);
            displayWatsonChat("I'm unable to process your request at the moment.");
        });
}

function scrollToBottom (){
    $('body, html').animate({ scrollTop: $('body').height() + 'px' });
}

