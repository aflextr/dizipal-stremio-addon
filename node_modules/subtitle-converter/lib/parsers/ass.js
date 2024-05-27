const Joi = require('joi-browser');
const toJSON = require('./ass_to_json');
const { SUBTITLE_SCHEMA } = require('../shared/constants');
const { cleanUpText, timecodeToMicroseconds } = require('../shared/utils');

// ASS timecodes are of the format h:MM:SS:ss
// adding trailing zero to account for missing milliseconds
const assTimecodeToStandardTimecode = timecode => `${timecode}0`;

function standardize(subtitleJSON, options) {
  const { removeTextFormatting } = options;
  return {
    global: {},
    body: subtitleJSON
      .map(line => ({
        // id: line.id,
        timecode: line.Start,
        startMicro: timecodeToMicroseconds(assTimecodeToStandardTimecode(line.Start)),
        endMicro: timecodeToMicroseconds(assTimecodeToStandardTimecode(line.End)),
        text: cleanUpText(line.Text, removeTextFormatting),
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


function ass(subtitleText, options) {
  const status = {
    success: true,
    invalidEntries: [],
  };

  const subtitleJSON = toJSON(subtitleText);

  const { error, value } = Joi.validate(standardize(subtitleJSON, options), SUBTITLE_SCHEMA, { abortEarly: false });
  if (error) {
    throw Error(error);
  }

  if (status.invalidEntries.length) status.success = false;
  return { data: value, status };
}

module.exports = ass;
