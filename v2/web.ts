// @ts-check
const focusableContent = new Array<HTMLElement>();

export function getTheme(themeID: string, theme=null as string|null, targetAPIversion='4.28' as string) {
  let _theme: 'light'|'dark';
  let esriTheme: string | null;
  esriTheme = null;
  const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");

  const themeID_node = document.getElementById(themeID) as HTMLLinkElement;

  if (themeID_node && theme) {
    esriTheme = theme;
  } else if (themeID_node) {
    const ss = themeID_node.href
    const _theme = ss.split('/assets/esri/themes/')[1].split('/')[0]
    if (_theme.toLocaleLowerCase() === 'light' || _theme.toLocaleLowerCase() === 'dark') {
      esriTheme = _theme;
    }
  } else {
    for (let i = 0; i < document.styleSheets.length; i++) {
      const ss = document.styleSheets[i].href;
      if (ss && ss.split('/assets/esri/themes/').length == 2) {
        const _theme = ss.split('/assets/esri/themes/')[1].split('/')[0]
        if (_theme.toLocaleLowerCase() === 'light' || _theme.toLocaleLowerCase() === 'dark') {
          esriTheme = _theme;
        }
      }
    }
  }

  if (esriTheme) {
    if (esriTheme.toLowerCase() === 'light') {
      _theme = 'light';
    } else {
      _theme = 'dark'
    }
  } else {
    // Use the client browser preference
    if (darkThemeMq.matches) {
      _theme = 'dark';
    } else {
      _theme = 'light';
    }
    setStyleSheet(`https://js.arcgis.com/${targetAPIversion}/@arcgis/core/assets/esri/themes/${_theme}/main.css`, themeID); // ESRI Themed CSS
  }
  return _theme;
}

export function setStyleSheet(href: string, id=null as string|null): void {
  const link_node = document.createElement( "link" );
  if (id) {
    const ss_node = document.getElementById(id) as HTMLLinkElement;
    if (ss_node) {
      ss_node.href = href;
      return;
    } else {
      link_node.id = id;
    }
  }
  link_node.type = "text/css";
  link_node.rel = "stylesheet";
  document.head.appendChild(link_node);
  link_node.href = href;
}

export function ariaDisable(element: HTMLElement, css_disable_class_list: Array<string>, disable=true as boolean) {
  element.setAttribute('aria-disabled', disable.toString());
  for (const css_disable_class of css_disable_class_list) {
    if (disable === true && !element.classList.contains(css_disable_class)) {
      element.classList.add(css_disable_class);
    }
    if (disable === false && element.classList.contains(css_disable_class)){
      element.classList.remove(css_disable_class);
    }
  }
}

export async function getClientCookie(name: string): Promise<string|null> {
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        const enc_string = c.substring(name.length+1, c.length);
          // console.log(`_Map.getClientCookie() enc_string: ${enc_string}`);
          if (enc_string === "null") {
              return null;
          } else {
              return enc_string;
          }
      }
  }
  return null;
}

export function getElementPosition(elem: HTMLElement) {
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
    } else {
      // for all other non-BODY elements
      xMin += (elem.offsetLeft - elem.scrollLeft + elem.clientLeft);
      yMin += (elem.offsetTop - elem.scrollTop + elem.clientTop);
    }

    if (elemInit === false) {
      elemWidth = elem.offsetWidth;
      elemHeight = elem.offsetHeight;
      elemInit = true;
    }

    elem = elem.offsetParent as HTMLElement;
  }
  return {
    xMax: xMin + elemWidth,
    xMin: xMin,
    yMax: yMin + elemHeight,
    yMin: yMin
  };
}

export function documentFocusTabEventSetup(document_node: HTMLElement) {
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
          } else {
            const idx = Array.prototype.indexOf.call(focusableContent, document.activeElement) - 1;
            focusableContent[idx].focus();
            e.preventDefault();
          }
      } else {
          // if tab key is pressed
          if (document.activeElement === lastFocusableElement) {
            // if focused has reached to last focusable element then focus first focusable element after pressing tab
            // add focus for the first focusable element
            firstFocusableElement.focus();
            e.preventDefault();
          } else {
            const idx = Array.prototype.indexOf.call(focusableContent, document.activeElement) + 1;
            focusableContent[idx].focus();
            e.preventDefault();
          }
      }
  });
}

export function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
      rect.width > 0 &&
      rect.height > 0
  );
}

export async function getFocusableElements(document_node: HTMLElement, calling_element_to_include=null as null|HTMLElement, ignore_offpage_elements=true, focusable_elements='button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]):not(.esri-attribution__sources)') {
  // console.log("getFocusableElements()");
  const fc = document_node.querySelectorAll(focusable_elements);
  focusableContent.length = 0;
  if (calling_element_to_include) {
      focusableContent.push(calling_element_to_include);
  }

  // Remove the elements from focusable Content
  if (ignore_offpage_elements === true) {
      Array.prototype.forEach.call(fc, function(element) {
          const result = isInViewport(element);
          const style = window.getComputedStyle(element)
          if (result === true && style.display != 'none' && style.visibility != 'hidden') {
              // console.log(`Element (${element.id}) is within viewport.`);
              focusableContent.push(element);
          } else {
              // console.log(`Element (${element.id}) is NOT within viewport.`);
          }
      });
  } else {
      Array.prototype.forEach.call(fc, function(element) {
          focusableContent.push(element);
      });
  }
}

export async function returnConfig (filePath: string|null, defaultFilePath: string|null){
  return new Promise(resolve => {
    // If the config file is not null, try and load it.
    const finalFilePath = filePath? filePath: defaultFilePath;
    // console.log(`Config file path: ${finalFilePath}`);

    if (finalFilePath) {
      fetch(finalFilePath)
      .then(response => {
        if (response.status >= 200 && response.status <= 299) {
          resolve(response.json());
        } else {
          resolve(null);
        }
      })
      .catch(error => {
        console.log(`ERROR: ${error}`);
        resolve(null);
      });
    } else {
      resolve(null);
    }
  });
}

export async function loadConfig(defaultFilePath=null as null|string, configValue=null as null|"config") {
  return new Promise(resolve => {
      let configparam = null as null|string;
      let finalFilePath: string;
      let message: string;

      if (configValue != null) {
          configparam = getQueryStringValue(configValue);
      }

      if (configparam != null) {
          if (configValue === "config") {
              finalFilePath = configparam;
          } else {
              message = `@dnrr_fd/util.web.loadConfig(): The configValue: ${configValue} is not valid!`;
              throw new Error(message);
          }
      } else {
          if (defaultFilePath != null) {
              finalFilePath = defaultFilePath;
          } else {
              message = `@dnrr_fd/util.web.loadConfig(): The jsonFilePath is null and the configValue: ${configValue} is not valid!`;
              throw new Error(message);
          }
      }

      // console.log(`Config file path: ${finalFilePath}`);

      fetch(finalFilePath)
      .then(response => {
          if (response.status >= 200 && response.status <= 299) {
              resolve(response.json());
          } else {
              message = `Config file ${finalFilePath} returned - HTTP${response.status} (${response.statusText})`;
              throw new Error(message);
          }
      })
      .catch(error => {
          message = `An error occured loading config file (${finalFilePath}). ${error}.`;
          window.alert(message);
          throw new Error(message);
      });
  });
}

export function getQueryStringValue(parameter: string) {
  const currentPageURL = window.location.search.substring(1);
  const queryString = currentPageURL.split('&');
  let getParameter;
  let i;
  for (i = 0; i < queryString.length; i++) {
      getParameter = queryString[i].split('=');
      if (getParameter[0] === parameter) {
          return getParameter[1] === undefined ? null : decodeURIComponent(getParameter[1]);
      }
  }
  return null;
}