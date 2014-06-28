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
    chrome.storage.sync.get("windowSize", function(items) {
        var params = {};
        if (items.windowSize) {
            var windowSize = items.windowSize;
            var state = "normal";
            if (windowSize.isFullscreen) {
                state = "fullscreen";
            } else if (windowSize.isMaximized) {
                state = "maximized";
            }
            params.bounds = windowSize.bounds;
            params.state = state;
        } else {
            params.bounds = {
                width: 800,
                height: 600
            };
            params.state = "normal";
        }
        params.minWidth = 800;
        params.minHeight = 600;
        params.resizable = true;
        params.frame = "none";
        chrome.app.window.create("window.html", params);
    });
}

chrome.app.runtime.onLaunched.addListener(function() {
    createWindow();
});
