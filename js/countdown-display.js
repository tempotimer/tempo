const moment = require('moment')

const countdownToString = function(secondsRemaining) {
  duration = moment.duration(secondsRemaining, 'seconds')
  minutes = zeroPad(duration.minutes())
  seconds = zeroPad(duration.seconds())
  return `${minutes}:${seconds}`
}

function zeroPad(n) {
  const numberWithZeros = '00' + n
  return numberWithZeros.slice(-2)
}

exports.countdownToString = countdownToString
