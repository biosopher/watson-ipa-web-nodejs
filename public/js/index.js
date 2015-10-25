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

$(document).ready(function() {
    var vpaDialog = null;
    var conversation = {};

    var $dialogsLoading = $('.dialogs-loading');
    var $dialogsError = $('.dialogs-error');

    // conversation nodes
    var $conversationDiv = $('.conversation-div');
    var $conversation = $('.conversation-container');
    var $information = $('.information-container');
    var $profile = $('.profile-container');
    var $userInput = $('.user-input');

    /**
     * Loads the dialog-container
     */
    var getDialogs = function() {
        $dialogsLoading.show();
        $dialogsError.hide();

    $.get('/proxy/api/v1/dialogs')
        .done(function(data) {
            if (data === '')
                return;

            // If VPA dialog not uploaded then upload
            data.dialogs.forEach(function(dialog, index) {
                if (dialog.name == "vpa_demo") {
                    vpaDialog = dialog;
                }
            });

            if (vpaDialog == null) {
                uploadVpaDialog();
            }else{
                startConversation();
            }
        }).fail(function() {
            $dialogsLoading.hide();
            $dialogsError.show();
            $dialogsError.find('.errorMsg').html('Error getting the dialogs.');
        })
    };
    // initial load
    getDialogs();

    var startConversation = function() {

        $conversation.empty();
        $conversationDiv.show();

        $.post('/proxy/api/v1/dialogs/' + vpaDialog.dialog_id + '/conversation', {input: ''})
            .done(function(data) {
                console.log("startConversation: " + JSON.stringify(data));
                $conversation.empty();
                $information.empty();
                $dialogsLoading.hide();

                // save dialog, client and conversation id
                conversation.conversation_id = data.conversation_id;
                conversation.client_id = data.client_id;
                conversation.dialog_id = vpaDialog.dialog_id;
                $('<div/>').text('Dialog name: ' + vpaDialog.name).appendTo($information);
                $('<div/>').text('Dialog id: ' + conversation.dialog_id).appendTo($information);
                $('<div/>').text('Conversation id: ' + conversation.conversation_id).appendTo($information);
                $('<div/>').text('Client id: ' + conversation.client_id).appendTo($information);

                var text = data.response.join('&lt;br/&gt;');
                $('<p class="chat-watson"/>')
                        .html($('<div/>').html(text).text())
                        .appendTo($conversation);
            });
    }

    /**
     * Let Watson Dialog Services help us out
     */
    function handOffToDialog(userIntentText) {

        var path = '/proxy/api/v1/dialogs/' + conversation.dialog_id + '/conversation';
        var params = {
            input: userIntentText,
            conversation_id: conversation.conversation_id,
            client_id: conversation.client_id
        };

        $.post(path, params).done(function(data) {
            var text = data.response.join('&lt;br/&gt;');
            $('<p class="chat-watson"/>')
                .html($('<div/>').html(text).text())
                .appendTo($conversation);

            getProfile();
            scrollToBottom();
        }).fail(function(response){
            displayWatsonChat("I'm unable to process your request at the moment.");
            scrollToBottom();
        });
    }
    
    /**
     * Determine how we shoudl respond
     */
    var conductConversation = function(){

        var userIntentText = $userInput.val();
        if (userIntentText == "") {
            displayWatsonChat("Please speak up.  I can't hear you");
        }else{
            $userInput.val('').focus();

            $('<p class="chat-human"/>')
                .html(userIntentText)
                .appendTo($conversation);

            scrollToBottom();

            if (isCreatingMeetingViaDialog) {
                handOffToDialog(userIntentText);
            }else{
                determineUserIntent(userIntentText);
            }
        }
    };

    $('.input-btn').click(conductConversation);
    $userInput.keyup(function(event){
        if(event.keyCode === 13) {
            conductConversation();
        }
    });

    var getProfile = function() {
        var path = '/proxy/api/v1/dialogs/' + conversation.dialog_id + '/profile';
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
                    if (par.name == "MeetingAttendee1") {
                        attendeeFound = true;
                    }else if (par.name == "MeetingTime") {
                        timeFound = true;
                    }else if (par.name == "MeetingDate") {
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
    };

    function getReplyToIntent(userIntent) 
    {
        var replyText = null;
        isCreatingMeetingViaDialog = false;
        switch (userIntent) {
            case "action-email-create":
                replyText = "Sorry.  Email creation is not supported.";
                break;
            case "action-meeting-create":
                isCreatingMeetingViaDialog = true;
                break;
            case "action-task-create":
                replyText = "Sorry.  Task creation is not supported.";
                break;
            case "respond-off-topic-joke-or-riddle":
                replyText = "Very funny.  Good to see you have a sense of humor";
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
        $('<p class="chat-watson"/>')
            .html($('<div/>').html(text).text())
            .appendTo($conversation);
        scrollToBottom();
    }
    
    function determineUserIntent(userIntentText) {

        var params = {
            userIntentText: userIntentText
        };

        var path = '/nlcIntent';
        $.post(path, params).done(function(data) {
            var replyText = getReplyToIntent(data);
            if (isCreatingMeetingViaDialog) {
                handOffToDialog(userIntentText);
            }else {
                displayWatsonChat(replyText);
                displayWatsonChat("Is there anything else I can help you with?");
            }
        }).fail(function(response){
            displayWatsonChat("I'm unable to process your request at the moment.");
        });

    }

    /**
     * Must be first launch of the app as no VPA dialog present.  Ask the server to
     * upload the dialog XML to the Watson Dialog service
     */
    function uploadVpaDialog() {
        $.ajax({
            type: 'GET',
            url: '/uploadVpaDialog',
            processData: false,
            contentType: false
        }).done(function(response){
            getDialogs();
        }).fail(function(response){
            $dialogsError.show();
            $dialogsError.find('.errorMsg').html('Error creating the dialogs: ' + response.responseText);
        }).always(function(response){
            $('#new-dialog-loading').hide();
            $('#new-dialog').show();
        });
    };

    var scrollToBottom = function(){
        $('body, html').animate({ scrollTop: $('body').height() + 'px' });
    };

});
