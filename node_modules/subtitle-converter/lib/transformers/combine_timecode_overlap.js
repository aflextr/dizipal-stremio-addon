const {
  last, update, assoc,
} = require('ramda');

function combineTimecodeOverlap(data) {
  if (!data.length) return data;

  // combine text with newline character
  // if previous and next timecodes overlap
  const combinedData = data.reduce((acc, next) => {
    const prev = last(acc) || {};

    if (next.startMicro < prev.endMicro) {
      const combined = {
        startMicro: prev.startMicro,
        endMicro: next.endMicro,
        text: `${prev.text}\n${next.text}`,
      };
      return update(-1, combined, acc);
    }

    return acc.concat(next);
  }, []);

  // reset index values
  return combinedData.map((entry, id) => assoc('id', id + 1, entry));
}

module.exports = combineTimecodeOverlap;
