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

### Getting to know the two Watson Services
To act on our user's intent, we first need to classify it into one of our categories above.  The [Watson Natural Language Classifier service](https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/nl-classifier/) uses deep machine learning techniques to return the top matching predefined classes for short text inputs.  We'll train the NLC using various text examples of users making the requests above.  Next, we'll need to ensure we have all the information required to complete the user's request.  To do this, we'll rely on the [Watson Dialog service](http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/dialog.html) which supports building conversations between a user and an application. The Dialog service will track and store information obtained during the conversation until we have all the additional information required to complete the task. 

The following sections will guide you through these tasks:

* Setting up a Bluemix account
* Start the Natural Language Classifier service on Bluemix
* Train the Natural Language Classifier service
* Start the Dialog service on Bluemix
* Configure your Dialog service with IBM's Dialog XML
* Connect the NodeJS app to your Natural Language Classifier service
* Connect the NodeJS app to your Dialog service

```
Create and train the NLC service using say the weather training data. Take a note of the "Classifier ID" that you get back when training the service.
```

### Getting Started
1. You need a Bluemix account. If you don't have one, [sign up](https://apps.admin.ibmcloud.com/manage/trial/bluemix.html).

2. Download and install the [Cloud-foundry CLI tool](https://github.com/cloudfoundry/cli) if you haven't already.

3. Edit the `manifest.yml` file and change `<application-name>` to something unique. The name you use determines the URL of your application. For example, `<application-name>.mybluemix.net`.
```
applications:
- services:
  - natural-language-classifier-service
  name: <application-name>
  command: node app.js
  path: .
  memory: 128M
```
4. Connect to Bluemix with the command line tool.  
```
$ cf api https://api.ng.bluemix.net
$ cf login -u <your user ID>
```

5. Create the Natural Language Classifier service in Bluemix.
```
$ cf create-service natural_language_classifier free natural-language-classifier-service
```

6. Update the app.js file with the classifier id in the response from the API when you create the classifier.

7. Update the app.js file with the classifier id in the response from the API when you create the classifier. 
```
$ cf push
```
For more details about developing applications that use Watson Developer Cloud services in Bluemix, see Getting started with Watson Developer Cloud and Bluemix.

8. To get the app to respond to input, you need to train the classifier. For information about how to train with the sample data, see the tutorial.

### Running locally
1. Download and install Node.js and npm.

2. Configure the code to connect to your service:
  i. Copy the credentials from your natural-language-classifier-service service in Bluemix. Run the following command:
  ```
  $ cf env <application-name>
  ```
  Example output:
  ```
  System-Provided:
  {
    "VCAP_SERVICES": {
      "natural_language_classifier": [
        {
          "credentials": {
            "password": "<password>",
            "url": "<url>",
            "username": "<username>"
          }
          "label": "natural-language-classifier",
          "name": "natural-language-classifier-service",
          "plan": "free",
          "tags": [
            ... 
          ]
        }
      ]
    }
  }
  ```
  ii. Copy `username`, `password`, and `url` from the credentials.
  iii. Open the app.js file and paste the username, password, and url credentials for the service.
  iv. In the app.js file paste the "Classifier ID". Save the app.js file.
  
5. Install all packages required by Node.JS
  i. Change to the new directory that contains the project.
  ii. Run the following command:node
  ```
  $ npm install
  ```
6. Run the following command to start the application:
```
node app.js
```
7. Point your browser to [http://localhost:3000](http://localhost:3000).

### Troubleshooting
* The main source of troubleshooting and recovery information is the Bluemix log. To view the log, run the following command:
```
$ cf logs <application-name> --recent
```

* For more details about the services, see the documentation for the [Natural Language Classifier](https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/nl-classifier/) and [Dialog Service](https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/dialog/).

### License
This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](https://github.com/watson-developer-cloud/natural-language-classifier-nodejs/blob/master/LICENSE).
This sample uses [jquery](https://jquery.com/) which is MIT license.
