var runBlocker = setInterval(blockerTimer, 1000);

const CSS_SCRIPT_BLOCK = `
html * {
  display: none;
}

@media (prefers-color-scheme: light) {
  html {
    background-color: white;
  }
}
@media (prefers-color-scheme: dark) {
  html {
    background-color: rgb(28, 27, 34);
  }
}
`;

browser.runtime.onMessage.addListener(request => {
  localStorage.clear();
  localStorage.setItem("sleepTime", request.sleep);
  localStorage.setItem("wakeTime", request.wake);
  localStorage.setItem("scriptAdded", "false");

});

function setStorage() {
  localStorage.setItem("sleepTime", sleepTime);
  localStorage.setItem("wakeTime", wakeTime);
}



function addScript(script, id) {
  var style = document.getElementById(id);
  if (style) style.innerText = script;
  else {
    style = document.createElement("style"); //create a html element
    style.innerText = script;
    style.setAttribute("id", id);
    document.head.appendChild(style);
  }

}

function removeScript(id) {
  var style = document.getElementById(id);
  if (style) { //if style exists on page
    style.disabled = true;
    style.parentNode.removeChild(style);
  }
}

browser.storage.onChanged.addListener(storageChanged);

function storageChanged() {
  browser.storage.local.get('hideScript', (result) => {
    if (result.hideScript == "false") { //show
      removeScript("blocking-css");
    } else if (result.hideScript == "true") {//hide
      addScript(CSS_SCRIPT_BLOCK, "blocking-css");
    }
  });

}

browser.storage.local.get('hideScript', (result) => {
  if (result.hideScript == "false") { //show
    removeScript("blocking-css");
  } else if (result.hideScript == "true") { //hide
    addScript(CSS_SCRIPT_BLOCK, "blocking-css");
  }
});


function blockerTimer() {
  var now = Date.now();

  if (localStorage.getItem("sleepTime") != null && localStorage.getItem("sleepTime") != "" &&
    localStorage.getItem("wakeTime") != null && localStorage.getItem("wakeTime") != "") {

    let sleepTime = localStorage.getItem("sleepTime");
    let wakeTime = localStorage.getItem("wakeTime");

    var start = new Date(sleepTime);
    var end = new Date(wakeTime);
    if (now >= start.getTime() && localStorage.getItem("scriptAdded") == "false") {

      browser.storage.local.set({ "hideScript": "true" });
      browser.storage.local.set({ "submittedSession": "false" });

      let url = window.location.href;
      // stop videos that are playing
      if (url.includes("youtube.com") ||
        url.includes("vimeo.com") ||
        url.includes("dailymotion.com")) {
        location.reload();
      }

      localStorage.setItem("scriptAdded", "true");

    } else if (now >= end.getTime()) {
      browser.storage.local.set({ "hideScript": "false" });
      localStorage.clear();
    }
  }
}