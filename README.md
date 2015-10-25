## Watson Intelligent Personal Assistant (Web Demo)
According to Wikipeida, "an [intelligent personal assistant](https://en.wikipedia.org/wiki/Intelligent_personal_assistant) is a software agent that can perform tasks or services for an individual."  In this demo, we'll combine two Watson services to illustrate the basics of intelligent task performance:

1. Capture user input.
2. Classify this input into one of several supported tasks
3. Ask user for any additional information required to complete the task
4. Execute the task for the user (an exercise left for you to complete)

These are the tasks we'll attempt to classify:

* Schedule a meeting
* Send an email
* Set an alarm
* Numeric calculations
* Map directions
* Location recommendations
* Off-topic
* Unknown

![https://bluemix.net/deploy?repository=https://github.com/biosopher/watson-ipa-web-nodejs](https://github.com/biosopher/watson-ipa-web/blob/master/wiki/media/deploy_to_bluemix.png)

### Getting Started
To act on our user's intent, we first need to classify it into one of our categories above.  The [Watson Natural Language Classifier service](https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/nl-classifier/) uses deep machine learning techniques to return the top matching predefined classes for short text inputs.  We'll train the NLC using various text examples of users making the requests above.  Next, we'll need to ensure we have all the information required to complete the user's request.  To do this, we'll rely on the [Watson Dialog service](http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/dialog.html) which supports building conversations between a user and an application. The Dialog service will track and store information obtained during the conversation until we have all the additional information required to complete the task. 

### Getting Started
Following these sections to setup your services and host your app either in Bluemix or locally.

1) [Setup Watson Natural Language Classifier and Dialog services on Bluemix](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Setup-Watson-Natural-Language-Classifier-and-Dialog-services-on-Bluemix)
Setup your Bluemix account and login from the command line using Cloud Foundry in order to launch your Watson services.

2) [Train the Natural Language Classifier service](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Train-the-Natural-Language-Classifier-service)
Train an NLC service using a long list of training pairs consisting of user test queries matched to our pre-defined classes     your Bluemix account and login from the command line using Cloud Foundry in order to launch your Watson services.

3) [Configure your Dialog service with IBM's Dialog XML](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Configure-your-Dialog-service-with-IBM's-Dialog-XML)

4) Connect the NodeJS app to your Natural Language Classifier service

5) Connect the NodeJS app to your Dialog service

6) [Running the app at http://localhost:300](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Running-Locally)

_[**Troubleshooting**](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Troubleshooting)_

### License
This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](https://github.com/watson-developer-cloud/natural-language-classifier-nodejs/blob/master/LICENSE).
This sample uses [jquery](https://jquery.com/) which is MIT license.
