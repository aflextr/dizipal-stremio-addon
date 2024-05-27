const { parse } = require('node-webvtt');
const Joi = require('joi-browser');
const { SUBTITLE_SCHEMA } = require('../shared/constants');
const { secondsToMicroseconds, cleanUpText } = require('../shared/utils');

function standardize(subtitleJSON, options) {
  const { removeTextFormatting } = options;
  return {
    global: {},
    body: subtitleJSON.cues.map((line, index) => {
      const styles = line.styles ? line.styles.split(' ')
        .reduce((obj, style) => {
          const [key, value] = style.split(':');
          obj[key] = value;
          return obj;
        }, {}) : {};

      return {
        id: index.toString(),
        startMicro: secondsToMicroseconds(line.start),
        endMicro: secondsToMicroseconds(line.end),
        styles,
        text: cleanUpText(line.text, removeTextFormatting),
      };
    })
      .filter(line => line.text)
      .map((line, index) => {
        // if empty lines were deleted, we need to make sure the id is in sequential order
        line.id = (index + 1).toString();

        return line;
      }),
    source: subtitleJSON,
  };
}


function vtt(subtitleText, options) {
  const status = {
    success: true,
    invalidEntries: [],
  };
  const subtitleJSON = parse(subtitleText, { meta: true });
  const { error, value } = Joi.validate(standardize(subtitleJSON, options), SUBTITLE_SCHEMA, { abortEarly: false });
  if (error) {
    throw Error(error);
  }

  if (status.invalidEntries.length) status.success = false;
  return { data: value, status };
}

module.exports = vtt;
