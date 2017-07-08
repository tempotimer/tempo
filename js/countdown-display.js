const moment = require('moment')

const countdownToString = function(secondsRemaining) {
  duration = moment.duration(secondsRemaining, 'seconds')
  return `${duration.minutes()}:${duration.seconds()}`
}

exports.countdownToString = countdownToString
