'use strict';

// Service names
var IPA_DIALOG_NAME = "demo_ipa3"; // REPLACE with your own name
var IPA_CLASSIFIER_NAME = "demo_ipa";  // NO NEED TO RENAME THIS ONE unless you want to

// Intent Types
var INTENT_TYPE_DIALOG_EMAIL = "action-email-create";
var INTENT_TYPE_DIALOG_MEETING = "action-meeting-create";
var INTENT_TYPE_DIALOG_SMS = "action-sms-create";

var intentType = null;
var ipaDialog = null;
var ipaNlcClassifier = null;
var conversation = null;

var $dialogsLoading = $('.dialogs-loading');
var $dialogsError = $('.dialogs-error');

// conversation nodes
var $conversationDiv = $('.conversation-div');
var $conversation = $('.conversation-container');
var $information = $('.information-container');
var $profileContainer = $('.profile-container');
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
                $dialogsError.find('.errorMsg').html('No NLC classifier named "' + IPA_CLASSIFIER_NAME + '" found in the NLC service');
                $dialogsError.show();
            }else{
                initConversation(true);
            }
        }).fail(function() {
            $dialogsLoading.hide();
            $dialogsError.show();
            $dialogsError.find('.errorMsg').html('Error getting the NLC classifier.');
        })
}

function initConversation(isFirstConversation) {

    intentType = null;
    conversation = {};
    conversation.user = {};
    conversation.watson = {};
    conversation.user.inputs = [];
    conversation.user.intents = [];
    conversation.watson.replies = [];

    var conversationStartText = "";
    if (!isFirstConversation) {
        // Results in different starting text for dialog.  E.g. "What else can I help with?" vs "Hello! How can I help you?".
        conversationStartText = "DIALOG_START_OVER";
    }
    $.post('/proxy/api/v1/dialogs/' + ipaDialog.dialog_id + '/conversation?proxyType=dialog', {input: conversationStartText})
        .done(function(data) {
            //$conversation.empty();
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

function saveConversation(userIntentText,userIntentType,watsonReply) {

    // Update conversation store
    conversation.user.inputs[conversation.user.inputs.length] = userIntentText;
    conversation.user.intents[conversation.user.intents.length] = userIntentType;
    conversation.watson.replies[conversation.watson.replies.length] = watsonReply;

    var conversationJson = JSON.stringify(conversation);
    $.ajax( {
        url: '/saveConversation',
        type: 'POST',
        data: conversationJson,
        contentType: 'application/json',
        processData: false,
        success: function (response) {
            console.log("conversationJson sent to server");
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Error: " + xhr.status + "\n" + xhr.responseText + "\n" + JSON.stringify(thrownError));
        }
    } );
}

/**
 * Let Watson Dialog Services help us out
 */
function handOffToDialog(userIntentText) {

    var dialogInput = userIntentText;
    if (isDialogRequiredIntent()) {
        // Use the invite type to redirect the Dialog flow to the current intent.
        dialogInput = intentType + " " + userIntentText;
    }

    var path = '/proxy/api/v1/dialogs/' + conversation.dialog_id + '/conversation?proxyType=dialog';
    var params = {
        input: dialogInput,
        conversation_id: conversation.conversation_id,
        client_id: conversation.client_id
    };

    $.post(path, params).done(function(data) {
        var replyText = data.response.join('<br/>');

        // Determine if current dialog completed
        var index = replyText.indexOf("DIALOG_COMPLETED");
        var dialogCompleted = index >= 0;
        if (dialogCompleted) {
            replyText = replyText.substring(0,index-5); // also remove the "<br/>"
        }
        displayWatsonChat(replyText);
        getProfile();
        saveConversation(userIntentText,intentType,replyText);

        if (dialogCompleted) {
            initConversation(false);
        }
        scrollToBottom();
    }).fail(function(response){
        displayWatsonChat("I'm unable to process your request at the moment.");
        scrollToBottom();
    });
}

/**
 * Determine how we should respond
 */
function conductConversation() {

    var userIntentText = $userInput.val();
    $userInput.val('').focus();
    if (userIntentText == "") {
        displayWatsonChat("Please speak up.  I can't hear you");
    }else{
        displayHumanChat(userIntentText);

        if (isDialogRequiredIntent()) {
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

    var attendee1Found = false;
    var timeFound = false;
    var dateFound = false;
    $.get(path, params).done(function(data) {
        $profileContainer.empty();
        data.name_values.forEach(function(par) {
            if (par.value !== '') {
                $('<div/>').text(par.name + ': ' + par.value).appendTo($profileContainer);
            }
        });
    });
}

function getReplyToIntent(nlcResponse, userText)
{
    var replyText = null;
    intentType = nlcResponse.top_class;
    console.log(userText + ": " + nlcResponse.top_class);
    switch (intentType) {
        case INTENT_TYPE_DIALOG_EMAIL:
            break;
        case INTENT_TYPE_DIALOG_MEETING:
            break;
        case INTENT_TYPE_DIALOG_SMS:
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

function isDialogRequiredIntent() {
    return intentType == INTENT_TYPE_DIALOG_EMAIL || intentType == INTENT_TYPE_DIALOG_MEETING || intentType == INTENT_TYPE_DIALOG_SMS;
}

function determineUserIntent(userIntentText) {

    var encodedText = encodeURIComponent(userIntentText);
    $.get('/proxy/api/v1/classifiers/' + ipaNlcClassifier.classifier_id + '/classify?proxyType=nlc&text=' + encodedText)
        .done(function(data) {

            var replyText = getReplyToIntent(data, userIntentText);
            if (isDialogRequiredIntent()) {
                handOffToDialog(userIntentText);
            }else {
                displayWatsonChat(replyText);
                displayWatsonChat("Is there anything else I can help you with?");
                saveConversation(userIntentText,intentType,replyText);
            }
        }).fail(function(response){
            console.log("StatusCode (" + response.status + "): " + response.statusText);
            displayWatsonChat("I'm unable to process your request at the moment.");
        });
}

function scrollToBottom (){
    $('body, html').animate({ scrollTop: $('body').height() + 'px' });
}

