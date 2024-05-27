const { trim, zipObj, reduce } = require('ramda');

const dialogueKeysRegex = /\[Events\]\nFormat:(.*)\n/;
const dialogueLineRegex = /Dialogue:/;

const getKeys = (subtitleText) => {
  const [, keysLine] = subtitleText.match(dialogueKeysRegex) || [];
  if (!keysLine) throw new Error('Failed to parse keys in .ass file');

  const keys = keysLine.split(',').map(trim);
  return keys;
};


const isDialogueLine = (line) => dialogueLineRegex.test(line);

const ASStoJSON = (subtitleText) => {
  // Standardizing line breaks from all OS -  MAC: '\r', UNIX: '\n', WIN '\r\n'
  subtitleText = subtitleText.replace(/(\r\n|\r)/g, '\n');

  // split file by line
  const lines = subtitleText.split(/\n/);

  // get the keys of the dialogue lines
  const keys = getKeys(subtitleText);

  const zipDialogueReducer = (acc, line) => {
    if (!isDialogueLine(line)) return acc;

    // eslint-disable-next-line no-useless-escape
    const fixedNewlines = line.replace(/\\N/, '\n');

    // split line
    // NOTE: Text can have commas so use negative lookahead to avoid ", "
    const values = fixedNewlines.split(/,(?! )/).map(trim);

    // zip
    const obj = zipObj(keys, values);
    return acc.concat(obj);
  };

  const parsed = reduce(zipDialogueReducer, [], lines);
  return parsed;
};

module.exports = ASStoJSON;
