// moon icon image credit to https://www.flaticon.com/free-icon/sleep_1075302?related_id=1075404&origin=search
document
  .querySelector('#submit-btn')
  .addEventListener('click', () => {

    const sleepTime = document.getElementById("sleepTime").value;

    const wakeTime = document.getElementById("wakeTime").value;

    let sleep = new Date(sleepTime);
    let wake = new Date(wakeTime);

    if (sleepTime == "" || wakeTime == "") {
      window.alert("Ensure you input a value in both fields!");
    } else if (wake.getTime() <= sleep.getTime()) {
      window.alert("Please enter a valid wake time.");
    } else {
      let message = "Once you submit, you cannot change your time interval" +
        " until it is your wake time. Press 'Cancel' to go back or 'OK'" +
        " to confirm.";
      if (confirm(message)) {
        //make sure storage is empty
        localStorage.clear();

        browser.storage.local.set({ "submittedSession": "true" });


        let sleepString = convertToStandardTime(sleep);
        let wakeString = convertToStandardTime(wake);

        localStorage.setItem("sleepTime", sleepString);
        localStorage.setItem("wakeTime", wakeString);

        localStorage.setItem("sleepTimeInput", sleepTime);
        localStorage.setItem("wakeTimeInput", wakeTime);
        browser.tabs.query({}, tabs => {
          tabs.forEach(tab =>
            browser.tabs.sendMessage(tab.id, { sleep: sleepTime, wake: wakeTime })
          );
        });
      }
    }

  });


browser.storage.onChanged.addListener(storageChanged);
browser.storage.onChanged.addListener(removeSubmitted);

function storageChanged() {
  browser.storage.local.get('hideScript', (result) => {
    if (result.hideScript == "false") {//show
      show();
    } else if (result.hideScript == "true") { //hide
      hide();
    }
  });

}

browser.storage.local.get('hideScript', (result) => {
  if (result.hideScript == "false") {//show
    show();
  } else if (result.hideScript == "true") {//hide
    hide();
  }
});

function removeSubmitted() {
  browser.storage.local.get('submittedSession', (result) => {
    if (result.submittedSession == "true") {
      disableInput(true);
    } else {
      disableInput(false);
    }
  });
}

browser.storage.local.get('submittedSession', (result) => {
  if (result.submittedSession == "true") {
    disableInput(true);
  } else {
    disableInput(false);
  }
});

function disableInput(value) {
  if (value == true) {
    // set inputted times
    document.getElementById("sleepTime").disabled = true;
    document.getElementById("wakeTime").disabled = true;
    document.getElementById("submit-btn").disabled = true;

    document.getElementById('sleepTime').value = localStorage.getItem("sleepTimeInput");
    document.getElementById("wakeTime").value = localStorage.getItem("wakeTimeInput");


  } else if (value == false) {
    document.getElementById("sleepTime").disabled = false;
    document.getElementById("wakeTime").disabled = false;
    document.getElementById("submit-btn").disabled = false;

  }
}

function hide() {
  document.querySelector("#submitTimes").classList.add("hidden");
  document.querySelector("#blocked-message").classList.remove("hidden");
  let enteredSleep = document.getElementById("entered-sleep");
  let enteredWake = document.getElementById("entered-wake");
  enteredSleep.innerText = localStorage.getItem("sleepTime");
  enteredWake.innerText = localStorage.getItem("wakeTime");
}

function show() {
  document.querySelector("#blocked-message").classList.add("hidden");
  document.querySelector("#submitTimes").classList.remove("hidden");
}


function convertToStandardTime(date) {
  let hours = date.getHours();
  let mins = date.getMinutes();
  let session = "AM";

  if (hours == 0) {
    hours = 12;
  }
  if (hours > 12) {
    hours = hours - 12;
    session = "PM";
  }
  //format for single digit if hours/mins less than 10
  hours = (hours < 10) ? "0" + hours : hours;
  mins = (mins < 10) ? "0" + mins : mins;

  let time = hours + ":" + mins + " " + session;
  return time;
}

window.addEventListener('load', () => {
  // set placeholder sleep time
  var now = convertToDate(1);
  document.getElementById('sleepTime').value = now.toISOString().slice(0, -1);

  // set placeholder wake time to 8 hours later
  var later = convertToDate(481);
  document.getElementById('wakeTime').value = later.toISOString().slice(0, -1);
});

function convertToDate(offset) {
  var date = new Date();
  date.setMinutes((date.getMinutes() - date.getTimezoneOffset()) + offset);
  date.setMilliseconds(null)
  date.setSeconds(null)
  return date;
}