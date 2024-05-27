const { timecodeToMicroseconds } = require('../shared/utils');
const {
  potentialIndexRegex,
  potentialTimecodeRegex,
  potentialSrtBlockRegex,
  untilFirstTimecodeRegex,
  validTimecodeRegex,
  noTextEntryRegex,
  validEntryRegexGroups,
  strictTimestampRegex,
} = require('./srtEntriesRegex');

/**
 * Functions for parseSrtEntries
 */
function standardizeTimestamp(timestamp) {
  if (strictTimestampRegex.test(timestamp)) return timestamp;
  return timestamp.replace(/[^\d]+/g, ':').replace(/:(?=\d{3})/, ','); // HH:MM:SS,mmm format
}

function pushInvalidEntry(acc, cur, options, invalidTimecodeFound, invalidIndexFound) {
  acc.status.success = false;

  const id = cur.match(potentialIndexRegex) ? cur.match(potentialIndexRegex)[0] : undefined;
  const timecode = cur.match(potentialTimecodeRegex)[0];
  const text = cur.split(potentialTimecodeRegex)[1]; // Split with timecode, 0 postion will be the 'id' or empty string
  const invalidEntry = { id, timecode, text };

  if (options.invalidEntries) acc.status.invalidEntries.push(invalidEntry);
  if (options.invalidIndices && invalidIndexFound) acc.status.invalidIndices.push({ id });
  if (options.invalidTimecodes && invalidTimecodeFound) acc.status.invalidTimecodes.push({ id, timecode });
  return acc;
}

function pushValidEntry(acc, cur) {
  // Capturing groups indicated in srtEntriesRegex.js
  const entryGroups = cur.match(validEntryRegexGroups);
  const start = standardizeTimestamp(entryGroups[1]);
  const end = standardizeTimestamp(entryGroups[2]);
  const text = entryGroups[3];

  acc.validEntries.push({
    id: acc.currentIndex.toString(),
    timecode: `${start} --> ${end}`,
    startMicro: timecodeToMicroseconds(start),
    endMicro: timecodeToMicroseconds(end),
    text,
  });
  acc.currentIndex += 1;
  return acc;
}

/**
 * Main function of srtEntries.js
 */
function parseSrtEntries(subtitleText, options = {
  invalidEntries: true,
  invalidTimecodes: true,
  invalidIndices: true,
}) {
  // Initalizing result object
  const result = {
    validEntries: [],
    status: {
      success: true,
      invalidEntries: [],
      invalidTimecodes: [],
      invalidIndices: [],
    },
  };

  // Standardizing line breaks from all OS -  MAC: '\r', UNIX: '\n', WIN '\r\n'
  subtitleText = subtitleText.replace(/(\r\n|\r)/g, '\n');

  // Creating an array with all potential entries
  const potentialBlocksArray = subtitleText.match(potentialSrtBlockRegex);
  if (!potentialBlocksArray) {
    result.validEntries.push('No entries found.');
    result.status.success = false;
    return result;
  }

  // Only potential index, whitespace or empty string allowed until first timecode
  const untilFirstTimecode = subtitleText.match(untilFirstTimecodeRegex)[0]; // Result '0' if empty
  const invalidFirstEntryFound = !(/^(\n*(.+\n)?|0)$/.test(untilFirstTimecode));
  if (invalidFirstEntryFound) {
    result.status.success = false;
    result.status.invalidEntries.push({
      id: '0',
      timecode: '00:00:00:000',
      text: untilFirstTimecode,
    });
  }

  // Validating all entries and creating return objects
  const { validEntries, status } = potentialBlocksArray.reduce((acc, cur) => {
    cur = cur.replace(/\n{2,}/g, '\n').trim(); // Remove excessive whitespace

    const potentialIndex = cur.match(potentialIndexRegex);
    const invalidIndexFound = potentialIndex && !(/^\d+$/.test(potentialIndex));
    const invalidTimecodeFound = !cur.match(validTimecodeRegex);

    if (invalidTimecodeFound || invalidIndexFound) {
      return pushInvalidEntry(acc, cur, options, invalidTimecodeFound, invalidIndexFound);
    }

    if (noTextEntryRegex.test(cur)) return acc;

    return pushValidEntry(acc, cur);
  }, { currentIndex: 1, ...result });

  return { validEntries, status };
}

module.exports = parseSrtEntries;
