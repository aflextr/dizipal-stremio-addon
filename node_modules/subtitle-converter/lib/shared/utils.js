const { VALID_EXT_REGEX_ARRAY } = require('./extensionRegex');

function microsecondsToMilliseconds(microseconds) {
  return microseconds / 1000;
}

function microsecondsToSeconds(microseconds) {
  return microsecondsToMilliseconds(microseconds / 1000);
}

function millisecondsToMicroseconds(milliseconds) {
  return milliseconds * 1000;
}

function secondsToMicroseconds(seconds) {
  return millisecondsToMicroseconds(seconds * 1000);
}

function minutesToMicroseconds(minutes) {
  return secondsToMicroseconds(minutes * 60);
}

function hoursToMicroseconds(hours) {
  return minutesToMicroseconds(hours * 60);
}

function framesToMicroseconds(frames, fps) {
  if (!frames || !fps) {
    return 0;
  }
  const seconds = frames / fps;
  return secondsToMicroseconds(seconds);
}

function timecodeToMicroseconds(timecode, fps) {
  const [hours, minutes, secondsAndMilliseconds, other] = timecode.replace(',', '.').split(':');
  const seconds = secondsAndMilliseconds.split('.')[0] || 0;
  const milliseconds = secondsAndMilliseconds.split('.')[1] || 0;
  const frames = seconds.split(';')[1] || other;

  if (frames && !fps) {
    throw Error(`Timecode (${timecode}) contains frames, but no fps was specified.`);
  }

  return hoursToMicroseconds(parseInt(hours))
  + minutesToMicroseconds(parseInt(minutes))
  + secondsToMicroseconds(parseInt(seconds))
  + millisecondsToMicroseconds(parseInt(milliseconds))
  + framesToMicroseconds(parseInt(frames), parseFloat(fps));
}

function extractStyling(text) {
  const regexReplace = [
    { regex: /^<br>/m, value: '' }, // remove <br> from beginning of every line
    { regex: /<br>/g, value: '\n' }, // replace all other <br> with new line
    { regex: /<.*?>/g, value: '' }, // remove all <...> tags
    { regex: /{.*?}/g, value: ' ' }, // replace all '{...}' with a white space
    { regex: /(>|<|{|})/g, value: '' }, // remove all remaining '<', '>', '{', '}' characters
    { regex: / {2,}/g, value: ' ' }, // replace all 2+ length white space with a single whitespace
    { regex: /^\s+|\s+$/gm, value: '' }, // trim every line
  ];
  return regexReplace.reduce((newText, { regex, value }) => newText.replace(regex, value), text);
}

function cleanUpText(text, removeTextFormatting = false) {
  let newText = text.replace(/[\n]+/g, '\n').trim();
  if (removeTextFormatting) {
    newText = extractStyling(newText);
  }
  return newText;
}

/**
 * @function Checks if input file is potentially any of the following
 *           subitle files: .srt, .vtt, .scc, .ttml(same as .dfxp).
 * @param {string}  subtitle  The utf-8 buffer of any file type.
 * @return {string} One of the extensions from description or undefined
 * @access public
 */

function getExtension(subtitle) {
  let result;

  VALID_EXT_REGEX_ARRAY.some(extension => {
    if (extension.regex.test(subtitle)) result = extension.extension;
    return !!result;
  });
  return result;
}

module.exports = {
  timecodeToMicroseconds,
  secondsToMicroseconds,
  millisecondsToMicroseconds,
  microsecondsToMilliseconds,
  microsecondsToSeconds,
  hoursToMicroseconds,
  cleanUpText,
  getExtension,
};
