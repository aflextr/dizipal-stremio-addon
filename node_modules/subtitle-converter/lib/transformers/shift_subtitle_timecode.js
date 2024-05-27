const { secondsToMicroseconds } = require('../shared/utils');

/**
 * Shift subtitle timecode based on seconds value passed in
 * @param data (object) - required
 * @param shiftAmountInSeconds (integer or float in seconds) - positive value adds time, negative values removes time
 * @returns shifted data
 */

function shiftTimecodeBySeconds(data, shiftAmountInSeconds) {
  const shiftAmountInMicroSeconds = secondsToMicroseconds(shiftAmountInSeconds);
  return data.map(line => {
    line.startMicro += shiftAmountInMicroSeconds;
    line.endMicro += shiftAmountInMicroSeconds;
    if (line.startMicro < 0 || line.endMicro < 0) throw Error(`shift by ${shiftAmountInSeconds} failed`);
    return line;
  });
}

module.exports = shiftTimecodeBySeconds;
