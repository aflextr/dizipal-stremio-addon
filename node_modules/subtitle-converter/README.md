# subtitle-converter

Convert and modify subtitle files with NodeJS.

There are many subtitle tools written in node, but there are none that support all popular subtitle and caption formats. `subtitle-converter` builds off of the work of others (most notably `node-captions`, `node-webvtt`, and `subtitles-parser`) in order to ultimately become the only subtitle module necessary to include in your node project.

Currently supported input file types: `dfxp, scc, srt, ttml, vtt, ssa, ass`

Currently supported output file types: `srt, vtt`

All output files are encoded with `UTF-8`. In the future we may support more encoding types.

## Install

`npm install subtitle-converter`

## Convert

NodeJS:
```javascript
const fs = require('fs')
const { convert } = require('subtitle-converter');

const filepath = '/Users/test/Downloads/english_subtitle.srt';
const subtitleText = fs.readFileSync(filepath, 'utf-8');
const outputExtension = '.vtt'; // conversion is based on output file extension
const options = {
  removeTextFormatting: true,
};

const { subtitle, status } = convert(subtitleText, outputExtension, options)

if (status.success) console.log(subtitle);
else console.log(status);
```

Browser:
```javascript
const { convert } = require('subtitle-converter');

function convertFile(fileObject) {
  const reader = new FileReader();
  let converted = '';
  reader.readAsText(fileObject);
  reader.onload = () => {
    const text = reader.result;
    const { subtitle, status } = convert(text, '.vtt');
    if(status.success) converted = subtitle;
    else console.log(status);
  };
  return converted;
}
```

## Options

**startAtZeroHour** (boolean) - Pass in `true` to make sure the timecodes start within

**shiftTimecode** (number) - Pass in the amount of seconds to shift the timecode. If undefined the output timecode will match the input.
- For example: `5`, `-5`, `5.2`

**sourceFps** (number) - Pass in the FPS of the video file used to create the input subtitle file. If `outputFps` is also included, `subtitle-converter` will shift the timecode accordingly to fit the output FPS.
- For example: `25`, `23.976`, `29.97`

**outputFps** (number) - Pass in the FPS desired for the output subtitle file. `sourceFps` is a required field in order to do FPS conversion.
- For example: `25`, `23.976`, `29.97`

**removeTextFormatting** (boolean) - Default is `false`. If set to `true`, tags such as `<b>` and `{bold}` will be stripped from the text. This may be useful when converting to formats that do not support styling in this manner.

**timecodeOverlapLimiter** (number, boolean) - Default is `false`, allowing overlapping timecode. If a number (in seconds) is included `subtitle-converter` will automatically fix overlapping timecode if the amount of seconds the text overlaps is less than the `timecodeOverlapLimiter`.
- If this value is set to `1` and your SRT looks like:
```
1
00:00:15,448 --> 00:00:18,000
Hello

2
00:00:17,417 --> 00:00:19,252
World
```
- Then the output would become:
```
1
00:00:15,448 --> 00:00:18,000
Hello

2
00:00:18,000 --> 00:00:19,252
World
```

**combineOverlapping** (boolean) - Default is `false`. If set to `true`, timecodes that are overlapping will be combined into one entry with a newline separating the text.

## Validate

Returns a `status` object with the following format.

```javascript
status = {
  success: true/false,
  startsAtZeroHour: true/false,
  reversedTimecodes: [{id, timecode}],
  overlappingTimecodes: [{id, timecode}],
  formattedText: [{id, text}],
  invalidEntries: [{id, timecode, text}],
  invalidTimecodes: [{id, timecode}],
  invalidIndices: [{id}],
}
```

Example:
```javascript
// Validate with defaults
const { validate } = require('subtitle-converter');
const status = validate(text, '.srt');

console.log(status);

// Validate with options
const { validate } = require('subtitle-converter');
const status = validate(text, '.srt', {
    startsAtZeroHour: true,
    overlappingTimecodes: true
  });

console.log(status.succes);
```

## Options

**Please Note:** If no options are passed, all checks will take place.  If options are specified, only those checks that are set to `true` will take place.

---
**startsAtZeroHour** (boolean) - checking if the first timecode starts at hour zero.

**reversedTimecodes** (boolean) - checking if there are any timecodes where the start time is after the end time.

**overlappingTimecodes** (boolean) - checking if there are any timecodes where a start time occurs before the previous end time.

**formattedText** (boolean) - checking if there is any formatted text. (`{an 1}`,`<i>This text is italicized</i>`).

---
**invalidEntries**  (Always detected) - checking if there are any odd entries or errors.

**invalidTimecodes** (Always detected) [`.srt`] - checking if there are any timecodes that are not in a valid format.

**invalidIndices** (Always detected) [`.srt`] - checking if there are any non-digit indices before timecodes.
