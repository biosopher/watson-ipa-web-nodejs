## Watson Intelligent Personal Assistant (Web Demo)
![](wiki/media/demo_screenshot.png)

An [intelligent personal assistant](https://en.wikipedia.org/wiki/Intelligent_personal_assistant) is a software agent that can perform tasks or services for an individual.  In this demo, we'll combine two Watson services to illustrate the basics of intelligent task performance:

1. Capture user input.
2. Classify this input into one of several supported tasks
3. Ask users for any additional information required to complete the task
4. Execute the task for the user (an exercise left for you to complete)

![](wiki/media/demo_architecture.png)

These are the tasks we'll attempt to classify:

* Schedule a meeting
* Send an email
* Set an alarm
* Numeric calculations
* Map directions
* Location recommendations
* Off-topic
* Unknown

[![Deploy to Bluemix](wiki/media/deploy_to_bluemix.png)](https://bluemix.net/deploy?repository=https://github.com/biosopher/watson-ipa-web-nodejs)

#### Getting Started
To act on our user's intent, we first need to classify it into one of our categories above.  To accomplish this, we'll rely on the [Watson Natural Language Classifier service](https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/nl-classifier/) which uses deep machine learning techniques to return the top matching predefined classes for short text inputs.  We'll train the NLC using various text examples of users making the requests above.  

Next, we'll need to ensure we have all the information required to complete the user's request.  To do this, we'll rely on the [Watson Dialog service](http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/dialog.html) which supports building conversations between a user and an application. The Dialog service will track and store information obtained during the conversation until we have all the info required to complete the task. 

Follow these sections to setup your services and host your app either in Bluemix or locally.
- [ ] [Setup Watson Natural Language Classifier and Dialog services on Bluemix](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Setup-Watson-Natural-Language-Classifier-and-Dialog-services-on-Bluemix)
- [ ] [Train the Natural Language Classifier service](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Train-the-Natural-Language-Classifier-service)
- [ ] [Configure your Dialog service with IBM's Dialog XML](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Configure-your-Dialog-service-with-IBM's-Dialog-XML)
- [ ] [Push app to Bluemix](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Push-App-to-Bluemix) 
- [ ] [optional] [Running the app locally at http://localhost:300](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Running-Locally)
- [ ] [Exercises for you to complete](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Exercises-for-you-to-complete)

#### Supporting Sections
* [Obtaining Service Credentials from the Command Line](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Obtaining-Service-Credentials-from-the-Command-Line)
* [Troubleshooting](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Troubleshooting)

#### More Details
For more details about developing applications that use Watson Developer Cloud services in Bluemix, see [Getting started with Watson Developer Cloud and Bluemix](http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/getting_started/).

#### License
This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](https://github.com/watson-developer-cloud/natural-language-classifier-nodejs/blob/master/LICENSE).
This sample uses [jquery](https://jquery.com/) which is MIT license.
