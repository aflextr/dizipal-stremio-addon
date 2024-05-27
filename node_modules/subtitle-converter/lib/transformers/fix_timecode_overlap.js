const { secondsToMicroseconds } = require('../shared/utils');

function fixTimeCodeOverlap(data, limiter = false) {
  if (!data.length) return data;
  if (limiter === false) return data;

  const result = data.map((sub, index) => {
    if (index < 1) return sub; // skip first item

    const prevSub = data[index - 1];
    const { startMicro } = sub;
    const { endMicro } = prevSub;
    if (endMicro > startMicro) {
      if (endMicro - startMicro <= secondsToMicroseconds(limiter)) sub.startMicro = endMicro;
    }

    return sub;
  });

  return result;
}

module.exports = fixTimeCodeOverlap;
