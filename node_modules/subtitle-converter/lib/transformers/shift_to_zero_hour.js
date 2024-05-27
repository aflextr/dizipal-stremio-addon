const { hoursToMicroseconds } = require('../shared/utils');

function shiftToZeroHour(data) {
  if (!data.length) return data;

  const oneHour = hoursToMicroseconds(1);
  const numHoursToShift = Math.floor(data[0].startMicro / oneHour);
  if (numHoursToShift < 1) return data;

  const timeToShift = numHoursToShift * oneHour;
  data.forEach(sub => {
    sub.startMicro -= timeToShift;
    sub.endMicro -= timeToShift;

    if (sub.startMicro < 0 || sub.endMicro < 0) throw Error('shift to zero hour failed');
  });

  return data;
}

module.exports = shiftToZeroHour;
