const { Parser } = require('xml2js');
const R = require('ramda');
const Joi = require('joi-browser');
const { SUBTITLE_SCHEMA } = require('../shared/constants');
const { timecodeToMicroseconds, cleanUpText } = require('../shared/utils');

function standardize(subtitleJSON, options) {
  const { removeTextFormatting } = options;
  const global = R.path(['tt', '$'], subtitleJSON);
  const body = R.path(['tt', 'body', '0', 'div', '0', 'p'], subtitleJSON);
  return {
    global: {
      language: global['xml:lang'],
    },
    body: body.map((line, index) => ({
      id: index.toString(),
      startMicro: timecodeToMicroseconds(R.path(['$', 'begin'], line)),
      endMicro: timecodeToMicroseconds(R.path(['$', 'end'], line)),
      text: cleanUpText(line._, removeTextFormatting),
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

function ttml(subtitleText, options) {
  const status = {
    success: true,
    invalidEntries: [],
  };
  const parser = new Parser({ async: false });

  let subtitleJSON;
  parser.parseString(subtitleText, (err, result) => {
    if (err) status.invalidEntries.push(err);
    subtitleJSON = result;
  });

  const { error, value } = Joi.validate(standardize(subtitleJSON, options), SUBTITLE_SCHEMA, { abortEarly: false });
  if (error) {
    throw Error(error);
  }

  if (status.invalidEntries.length) status.success = false;
  return { data: value, status };
}


module.exports = ttml;
