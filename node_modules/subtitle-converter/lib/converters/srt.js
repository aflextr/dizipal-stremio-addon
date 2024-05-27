const { toSrt } = require('subtitles-parser');
const { microsecondsToMilliseconds } = require('../shared/utils');

function format(subtitleJSON) {
  return subtitleJSON.body.map(line => ({
    id: line.id,
    startTime: microsecondsToMilliseconds(line.startMicro),
    endTime: microsecondsToMilliseconds(line.endMicro),
    text: line.text,
  }));
}

function srt(subtitleJSON) {
  const formattedJSON = format(subtitleJSON);
  return toSrt(formattedJSON);
}

module.exports = srt;
