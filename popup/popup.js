$(document).ready(function() {
  $('.popup_form_wrapper').off('submit').on('submit', e => {
    e.preventDefault()
    const title = $('#id_title').val()
    const desc = $('#id_desc').val()
    const time = $('#id_time').val()
    const error_el =  $('#id_error')
    if(title && time) {
      error_el.text('')
      error_el.removeClass('show')
      const reminderObj = {
        title,
        description: desc || '',
        time
      }
      chrome.storage.local.get(['reminder'], function(result) {
        if(result) {
          let reminderData = {
            [title]: reminderObj
          }
          if(result.reminder && result.reminder && Object.keys(result.reminder).length) {
            reminderData = result.reminder
            reminderData[title] = reminderObj
          }
          chrome.storage.local.set({ reminder: reminderData }, function() {
            chrome.runtime.sendMessage({
              'type': 'add_reminder',
              'data': reminderObj
            },
            response => {
              if(response && response === 'success') {
                $('#id_title').val('')
                $('#id_desc').val('')
                $('#id_time').val('')
              }
            })
          });
        }
      });
    }
    else {
      error_el.text('Title and reminder date are mandatory')
      error_el.addClass('show')
    }
  })
})