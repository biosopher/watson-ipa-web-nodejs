## Watson Intelligent Personal Assistant (Web Demo)
![](wiki/media/demo_screenshot.png)
An [intelligent personal assistant](https://en.wikipedia.org/wiki/Intelligent_personal_assistant) is a software agent that can perform tasks or services for an individual.  In this demo, we'll combine two Watson services to illustrate the basics of intelligent task performance:

Check out the [working demo](http://ipa-demo-anthony.mybluemix.net/).

A. Capture user input.
B. Classify this input into one of several supported tasks
C. Ask users for any additional information required to complete the task
D. Execute the task for the user (an exercise left for you to complete)

![](wiki/media/demo_architecture.png)

These are the tasks we'll attempt to classify:

* Schedule a meeting
* Send an email
* Ask to perform a numeric calculations
* Request a joke

#### Getting Started
To act on our user's intent, we first need to classify it into one of our categories above.  To accomplish this, we'll rely on the [Watson Natural Language Classifier service](https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/nl-classifier/) which uses deep machine learning techniques to return the top matching predefined classes for short text inputs.  We'll train the NLC using various text examples of users making the requests above.  

Next, we'll need to ensure we have all the information required to complete the user's request.  To do this, we'll rely on the [Watson Dialog service](http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/dialog.html) which supports building conversations between a user and an application. The Dialog service will track and store information obtained during the conversation until we have all the info required to complete the task. 

Follow these sections to setup your services and host your app either in Bluemix or locally.
- [ ] [Step 1: Setup Watson Natural Language Classifier and Dialog services on Bluemix](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Setup-Watson-Natural-Language-Classifier-and-Dialog-services-on-Bluemix)
- [ ] [Step 2: Train the Natural Language Classifier service](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Train-the-Natural-Language-Classifier-service)
- [ ] [Step 3: Configure your Dialog service with IBM's Dialog XML](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Configure-your-Dialog-service-with-IBM's-Dialog-XML)
- [ ] [Step 4: Push app to Bluemix](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Push-App-to-Bluemix) 
- [ ] [Step 5 (optional): Running the app locally at http://localhost:300](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Running-Locally)
- [ ] [Step 6: Additional exercises for you to improve the app's functionality](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Exercises-for-you-to-complete)

#### How Does the Demo Work
Curious to know how the user text is classified to a specific intent and then mapped to a dialog flow?  Here's a brief overview of [how the Watson IPA Demo works?](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/How-Does-the-Watson-IPA-Demo-Work).


#### Supporting Sections
* [Obtaining Service Credentials from the Command Line](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Obtaining-Service-Credentials-from-the-Command-Line)
* [Troubleshooting](https://github.com/biosopher/watson-ipa-web-nodejs/wiki/Troubleshooting)

#### More Details
For more details about developing applications that use Watson Developer Cloud services in Bluemix, see [Getting started with Watson Developer Cloud and Bluemix](http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/getting_started/).

#### License
This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](https://github.com/watson-developer-cloud/natural-language-classifier-nodejs/blob/master/LICENSE).
This sample uses [jquery](https://jquery.com/) which is MIT license.
