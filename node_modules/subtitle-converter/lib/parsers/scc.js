const Joi = require('joi-browser');
const { SUBTITLE_SCHEMA } = require('../shared/constants');
const { cleanUpText } = require('../shared/utils');
const { toJSON } = require('./scc_to_json');

function standardize(subtitleJSON, options) {
  const { removeTextFormatting } = options;
  return {
    global: {},
    body: subtitleJSON
      .map(line => ({
        id: line.id,
        startMicro: line.startTimeMicro,
        endMicro: line.endTimeMicro,
        captions: {
          frames: line.frames,
          popOn: line.popOn,
          paintOn: line.paintOn,
          rollUpRows: line.rollUpRows,
          commands: line.commands,
        },
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

function scc(subtitleText, options) {
  const status = {
    success: true,
    invalidEntries: [],
  };
  const lines = subtitleText.split(/\r\n|\n|\r/);
  const subtitleJSON = toJSON(lines);
  const { error, value } = Joi.validate(standardize(subtitleJSON, options), SUBTITLE_SCHEMA, { abortEarly: false });
  if (error) {
    throw Error(error);
  }

  if (status.invalidEntries.length) status.success = false;
  return { data: value, status };
}

module.exports = scc;
