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

var CalculationPipeline = new Object();
var ERR_MESSAGE = "I'm unable to perform calculations of that type.";
CalculationPipeline.numericCalculation= function(calculationStr) {

    var result = ERR_MESSAGE;
    try {
        // For security and possibly additional text, strip anything other than digits, (), -+/* and .
        calculationStr = calculationStr.replace(/[^-()\d/*/^+.]/g, '');
        if (calculationStr.length > 0) {
            result = math.eval(calculationStr);
            if (result != undefined) {
                result = math.format(result, 3);
            }
        }
    } catch(err) {
    }
    return result;
}

CalculationPipeline.conversionCalculation= function(calculationStr) {
    var result = ERR_MESSAGE;;
    try {
        // SHOULD BE MORE SECURE!  See the String.replace() in numericCalculation()
        var conversion = math.eval(calculationStr);
        if (conversion != undefined) {
            result = math.format(conversion,3);
        }
    } catch(err) {
    }
    return result;
}
