import ReactDOM from "react-dom/client";
import React from 'react';
const focusableContent = new Array();
export function getWidgetTheme(themeID, _theme = null) {
    let theme;
    let esriTheme;
    esriTheme = null;
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    const themeID_node = document.getElementById(themeID);
    if (themeID_node && _theme) {
        esriTheme = _theme;
    }
    else if (themeID_node) {
        const ss = themeID_node.href;
        const _theme = ss.split('/assets/esri/themes/')[1].split('/')[0];
        if (_theme.toLocaleLowerCase() === 'light' || _theme.toLocaleLowerCase() === 'dark') {
            esriTheme = _theme;
        }
    }
    else {
        for (let i = 0; i < document.styleSheets.length; i++) {
            const ss = document.styleSheets[i].href;
            if (ss && ss.split('/assets/esri/themes/').length == 2) {
                const _theme = ss.split('/assets/esri/themes/')[1].split('/')[0];
                if (_theme.toLocaleLowerCase() === 'light' || _theme.toLocaleLowerCase() === 'dark') {
                    esriTheme = _theme;
                }
            }
        }
    }
    if (esriTheme) {
        if (esriTheme.toLowerCase() === 'light') {
            theme = 'light';
        }
        else {
            theme = 'dark';
        }
    }
    else {
        // Use the client browser preference
        if (darkThemeMq.matches) {
            theme = 'dark';
        }
        else {
            theme = 'light';
        }
        setStyleSheet(`https://js.arcgis.com/4.24/@arcgis/core/assets/esri/themes/${theme}/main.css`, themeID); // ESRI Themed CSS
    }
    return theme;
}
export function setStyleSheet(href, id = null) {
    const link_node = document.createElement("link");
    if (id) {
        const ss_node = document.getElementById(id);
        if (ss_node) {
            ss_node.href = href;
            return;
        }
        else {
            link_node.id = id;
        }
    }
    link_node.type = "text/css";
    link_node.rel = "stylesheet";
    document.head.appendChild(link_node);
    link_node.href = href;
}
export function ariaDisable(element, css_disable_class_list, disable = true) {
    element.setAttribute('aria-disabled', disable.toString());
    for (const css_disable_class of css_disable_class_list) {
        if (disable === true && !element.classList.contains(css_disable_class)) {
            element.classList.add(css_disable_class);
        }
        if (disable === false && element.classList.contains(css_disable_class)) {
            element.classList.remove(css_disable_class);
        }
    }
}
export function createReactDiv(parent_node, div_id, classNameList = [""]) {
    // Create the div structure under the parent widgetbar div.
    const classes = classNameList.join(' ');
    const _div = React.createElement('div', { id: div_id, className: classes });
    // ReactDOM.render(_div, parent_node); /deprecated
    const root = ReactDOM.createRoot(parent_node);
    root.render(_div);
}
export async function getClientCookie(name) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            const enc_string = c.substring(name.length + 1, c.length);
            // console.log(`_Map.getClientCookie() enc_string: ${enc_string}`);
            if (enc_string === "null") {
                return null;
            }
            else {
                return enc_string;
            }
        }
    }
    return null;
}
export function getElementPosition(elem) {
    let xMin = 0;
    let yMin = 0;
    let elemInit = false;
    let elemWidth = 0;
    let elemHeight = 0;
    while (elem) {
        if (elem.tagName == "BODY") {
            // deal with browser quirks with body/window/document and page scroll
            const xScroll = elem.scrollLeft || document.documentElement.scrollLeft;
            const yScroll = elem.scrollTop || document.documentElement.scrollTop;
            xMin += (elem.offsetLeft - xScroll + elem.clientLeft);
            yMin += (elem.offsetTop - yScroll + elem.clientTop);
        }
        else {
            // for all other non-BODY elements
            xMin += (elem.offsetLeft - elem.scrollLeft + elem.clientLeft);
            yMin += (elem.offsetTop - elem.scrollTop + elem.clientTop);
        }
        if (elemInit === false) {
            elemWidth = elem.offsetWidth;
            elemHeight = elem.offsetHeight;
            elemInit = true;
        }
        elem = elem.offsetParent;
    }
    return {
        xMax: xMin + elemWidth,
        xMin: xMin,
        yMax: yMin + elemHeight,
        yMin: yMin
    };
}
export function documentFocusTabEventSetup(document_node) {
    // console.log("documentFocusTabEventSetup()");
    document_node.addEventListener('keydown', function (e) {
        const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
        if (!isTabPressed) {
            return;
        }
        const firstFocusableElement = focusableContent[0];
        const lastFocusableElement = focusableContent[focusableContent.length - 1];
        if (e.shiftKey) {
            // if shift key pressed for shift + tab combination
            if (document.activeElement === firstFocusableElement) {
                // add focus for the last focusable element
                lastFocusableElement.focus();
                e.preventDefault();
            }
            else {
                const idx = Array.prototype.indexOf.call(focusableContent, document.activeElement) - 1;
                focusableContent[idx].focus();
                e.preventDefault();
            }
        }
        else {
            // if tab key is pressed
            if (document.activeElement === lastFocusableElement) {
                // if focused has reached to last focusable element then focus first focusable element after pressing tab
                // add focus for the first focusable element
                firstFocusableElement.focus();
                e.preventDefault();
            }
            else {
                const idx = Array.prototype.indexOf.call(focusableContent, document.activeElement) + 1;
                focusableContent[idx].focus();
                e.preventDefault();
            }
        }
    });
}
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
        rect.width > 0 &&
        rect.height > 0);
}
export async function getFocusableElements(document_node, calling_element_to_include = null, ignore_offpage_elements = true, focusable_elements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]):not(.esri-attribution__sources)') {
    // console.log("getFocusableElements()");
    const fc = document_node.querySelectorAll(focusable_elements);
    focusableContent.length = 0;
    if (calling_element_to_include) {
        focusableContent.push(calling_element_to_include);
    }
    // Remove the elements from focusable Content
    if (ignore_offpage_elements === true) {
        Array.prototype.forEach.call(fc, function (element) {
            const result = isInViewport(element);
            const style = window.getComputedStyle(element);
            if (result === true && style.display != 'none' && style.visibility != 'hidden') {
                // console.log(`Element (${element.id}) is within viewport.`);
                focusableContent.push(element);
            }
            else {
                // console.log(`Element (${element.id}) is NOT within viewport.`);
            }
        });
    }
    else {
        Array.prototype.forEach.call(fc, function (element) {
            focusableContent.push(element);
        });
    }
}
export async function returnConfig(filePath, defaultFilePath) {
    return new Promise(resolve => {
        // If the config file is not null, try and load it.
        const finalFilePath = filePath ? filePath : defaultFilePath;
        // console.log(`Config file path: ${finalFilePath}`);
        if (finalFilePath) {
            fetch(finalFilePath)
                .then(response => {
                if (response.status >= 200 && response.status <= 299) {
                    resolve(response.json());
                }
                else {
                    resolve(null);
                }
            })
                .catch(error => {
                resolve(null);
            });
        }
        else {
            resolve(null);
        }
    });
}
//# sourceMappingURL=web.js.map