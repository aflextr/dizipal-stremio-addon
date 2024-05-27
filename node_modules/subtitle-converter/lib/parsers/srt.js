const Joi = require('joi-browser');
const { SUBTITLE_SCHEMA } = require('../shared/constants');
const parseEntries = require('./srtEntries');
const { cleanUpText } = require('../shared/utils');

function standardize(subtitleJSON, options) {
  const { removeTextFormatting } = options;
  return {
    global: {},
    body: subtitleJSON
      .map(line => ({
        id: line.id,
        timecode: line.timecode,
        startMicro: line.startMicro,
        endMicro: line.endMicro,
        text: cleanUpText(line.text, removeTextFormatting),
      }))
      .filter(line => line.text)
      .map((line, index) => {
        // if empty lines were deleted, we need to make sure the id is in sequential order
        line.id = (index + 1).toString();
        return line;
      }),
    source: subtitleJSON,
  };
}

function srt(subtitleText, options) {
  const { validEntries, status } = parseEntries(subtitleText);

  const { error, value } = Joi.validate(standardize(validEntries, options), SUBTITLE_SCHEMA, { abortEarly: false });
  if (error) {
    throw Error(error);
  }
  return { data: value, status };
}

module.exports = srt;
