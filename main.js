const sendNotification = (title, options={}) => {
  if(Notification.permission && Notification.permission.toLowerCase() === 'granted') {
    new Notification(title, options)
  }
  else {
    Notification.requestPermission()
    .then(permission => {
      if(permission && permission === 'granted') {
        new Notification(title, options)
      }
      else {
        console.log('No Permission to push notification')
      }    
    })
    .catch(err => console.log(err))
  }
}

const setNotification = data => {
  const title = data.title || ''
  if(data.time) {
    const date_diff = (new Date(data.time) - new Date())
    if(date_diff && date_diff > 0) {
      chrome.alarms.create(title, { delayInMinutes: date_diff / 60000 })
    }
  }
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.get('reminder', function(result) {
    alert(JSON.stringify(result))
    if(result && result.reminder && Object.keys(result.reminder).length) {
      Object.keys(result.reminder).map(key => {
        const data = result.reminder
        if(key && data && data[key] && data[key].time) {
          setNotification(data[key])
        }
      })
    }
  });
})

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if(message && message.type) {
    switch(message.type) {
      case 'add_reminder': {
        if(message && message.data) {
          setNotification(message.data)
          sendResponse('success')
        }
        break
      }
    }
  }
})

chrome.alarms.onAlarm.addListener(function( alarm ) {
  const key = alarm && alarm.name || ''
  if(key) {
    chrome.storage.local.get('reminder', function(result) {
      if(result && result.reminder && result.reminder[key]) {
        const title = result.reminder[key].title || ''
        const desc = result.reminder[key].description || ''
        sendNotification(title, {
          body: desc || '',
          icon: './assets/img/icon.png'
        })
      }
    });
  }
});