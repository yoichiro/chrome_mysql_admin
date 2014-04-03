/*
 * Copyright (c) 2014 Yoichiro Tanaka. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

function createWindow() {
    chrome.app.window.create("window.html", {
        bounds: {
            top: 0,
            left: 0,
            width: 800,
            height: 600
        },
        minWidth: 800,
        minHeight: 600,
        resizable: true
    });
}

chrome.app.runtime.onLaunched.addListener(function() {
    createWindow();
});
