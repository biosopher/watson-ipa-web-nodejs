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

var JokesPipeline = new Object();

var index = 0;
var jokesArray =   ["How many programmers does it take to change a light bulb?\n\nAnswer: None. It’s a hardware problem.",
                    "What did the spider do on the computer?\n\nAnswer: A website!",
                    "Why did the computer keep sneezing?\n\nAnswer: It had a virus!",
                    "What does a baby computer call his father?\n\nAnswer: Data!",
                    "Why did the computer squeak?\n\nAnswer: Because someone stepped on it's mouse! ",
                    "Why is it that programmers always confuse Halloween with Christmas?\n\nAnswer: Because 31 OCT = 25 DEC."];

JokesPipeline.nextJoke = function() {

    var joke = jokesArray[index];
    index++;
    if (index == jokesArray.length) index = 0;
    return joke;
}

