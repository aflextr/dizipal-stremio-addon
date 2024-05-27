/**
 * Regex string variables
 */
// Entry Detection
const potentialTimecode = '.*\\d.*-->.*\\d.*';
const potentialIndex = `^\\n*?.+(?=\\n${potentialTimecode})`;
const blockTerminator = `(?=(?:\\n(?:\\n.+\\n||\\n)${potentialTimecode}|$))`;

// Entry Validation
const validHours = '\\d{2}';
const validMinutes = '[0-5]\\d';
const validSeconds = '[0-5]\\d';
const validMilliseconds = '\\d{3}';
const any = '[^\\n\\d]+?'; // Any character but digit or newline
const validTimestamp = `${validHours}${any}${validMinutes}${any}${validSeconds}${any}${validMilliseconds}`;
const validTimecode = `${validTimestamp}[^\\n\\d]+?${validTimestamp}(?=(\\n|$))`;
const textOfEntry = '[^]+';

// Capturing Groups for entries
const group1Start = `(${validTimestamp})`;
const group2End = `(${validTimestamp})`;
const group3Text = `(${textOfEntry})`;

/**
 * Assembling Regex from variables
 */
const potentialIndexRegex = new RegExp(potentialIndex, 'g');
const potentialTimecodeRegex = new RegExp(potentialTimecode, 'g');
const potentialSrtBlockRegex = new RegExp(`(\\n*)(?:.+\\n)?${potentialTimecode}[^]+?${blockTerminator}`, 'g');
const untilFirstTimecodeRegex = new RegExp(`^[^]+?(?=${potentialTimecode})`, 'g');
const validTimecodeRegex = new RegExp(validTimecode);
const validEntryRegexGroups = new RegExp(`${group1Start}[^\\n\\d]+?${group2End}[^\\n\\d]*?\\n${group3Text}`);
const noTextEntryRegex = new RegExp(`${validTimecode}\\s*$`);
const strictTimestampRegex = new RegExp(`${validHours}:${validMinutes}:${validSeconds},${validMilliseconds}`);

module.exports = {
  potentialIndexRegex,
  potentialTimecodeRegex,
  potentialSrtBlockRegex,
  strictTimestampRegex,
  validEntryRegexGroups,
  noTextEntryRegex,
  validTimecodeRegex,
  untilFirstTimecodeRegex,
};
