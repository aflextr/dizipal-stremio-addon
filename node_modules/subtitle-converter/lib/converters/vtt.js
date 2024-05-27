const { compile } = require('node-webvtt');
const { microsecondsToSeconds } = require('../shared/utils');

function format(subtitleJSON) {
  return {
    valid: true,
    cues: subtitleJSON.body.map(line => {
      const styles = line.styles
        ? Object.keys(line.styles)
          .map(key => `${key}:${line.styles[key]}`)
          .join(' ')
        : '';
      return {
        identifier: line.id,
        start: microsecondsToSeconds(line.startMicro),
        end: microsecondsToSeconds(line.endMicro),
        text: line.text,
        styles,
      };
    }),
  };
}

function vtt(subtitleJSON) {
  const formattedJSON = format(subtitleJSON);
  return compile(formattedJSON);
}

module.exports = vtt;
