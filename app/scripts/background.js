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

var windows = [];

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
        params.frame = "chrome";
        params.id = String((new Date()).getTime());
        chrome.app.window.create("window.html", params, function(createdWindow) {
            createdWindow.onClosed.addListener((function(closedWindow) {
                return function() {
                    for (var i = 0; i < windows.length; i++) {
                        var window = windows[i];
                        if (window.id === closedWindow.id) {
                            windows.splice(i, 1);
                            break;
                        }
                    }
                };
            })(createdWindow));
            windows.push(createdWindow);
            var storePosition = ((function(window) {
                return function() {
                    var windowSize = {
                        bounds: {
                            top: window.innerBounds.top,
                            left: window.innerBounds.left,
                            width: window.innerBounds.width,
                            height: window.innerBounds.height
                        },
                        isFullscreen: window.isFullscreen(),
                        isMaximized: window.isMaximized()
                    };
                    chrome.storage.sync.set({windowSize: windowSize}, function() {
                    });
                };
            })(createdWindow));
            createdWindow.onBoundsChanged.addListener(storePosition);
            createdWindow.onFullscreened.addListener(storePosition);
            createdWindow.onMaximized.addListener(storePosition);
            createdWindow.onMinimized.addListener(storePosition);
            createdWindow.onRestored.addListener(storePosition);
        });
    });
}

function getWindows() {
    var result = [];
    for (var i = 0; i < windows.length; i++) {
        result.push({
            id: windows[i].id,
            title: windows[i].contentWindow.document.title
        });
    }
    return result;
}

function focusWindow(id) {
    for (var i = 0; i < windows.length; i++) {
        if (windows[i].id === id) {
            windows[i].focus();
            break;
        }
    }
}

chrome.app.runtime.onLaunched.addListener(function() {
    createWindow();
});
