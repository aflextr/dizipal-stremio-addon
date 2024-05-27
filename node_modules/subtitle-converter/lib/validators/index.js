const { isEmpty } = require('ramda');
const parse = require('../parsers');
const validateStandardized = require('./standardizedJSON');
const { getExtension } = require('../shared/utils');

function validate(subtitleText, inputExtension, options) {
  // read inputFile, convert to standardized JSON format
  const { data, status: parseStatus } = parse(subtitleText, getExtension(subtitleText) || inputExtension, options);

  if (isEmpty(data.body)) throw Error('Parsed file is empty');

  const outputStatus = validateStandardized(data.body, options);

  const success = parseStatus.success && outputStatus.success;
  const status = { ...parseStatus, ...outputStatus, success };
  return status;
}

module.exports = validate;
