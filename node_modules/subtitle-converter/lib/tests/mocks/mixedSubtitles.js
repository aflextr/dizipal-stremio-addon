const goodSRT = require('./goodSRT');
const goodTTML = require('./goodTTML');
const goodSCC = require('./goodSCC');
const goodVTT = require('./goodVTT');
const goodVTT2 = require('./goodVTT2');
const goodDFXP = require('./goodDFXP');
const goodASS = require('./goodASS');
const goodSRTTextWithNums = require('./goodSRTTextWithNums');

const mixedSubtitles = [
  {
    type: '.srt',
    subtitleText: goodSRT,
  },
  {
    type: '.srt',
    subtitleText: goodSRTTextWithNums,
  },
  {
    type: '.ttml',
    subtitleText: goodTTML,
  },
  {
    type: '.scc',
    subtitleText: goodSCC,
  },
  {
    type: '.vtt',
    subtitleText: goodVTT,
  },
  {
    type: '.vtt',
    subtitleText: goodVTT2,
  },
  {
    type: '.ttml',
    subtitleText: goodDFXP,
  },
  {
    type: '.ass',
    subtitleText: '[Script Info]',
  },
  {
    type: '.ass',
    subtitleText: goodASS,
  },
  {
    type: '.srt',
    subtitleText: `
    Hello-->.
    `,
  },
  {
    type: undefined,
    subtitleText: `
    Lorem Ipsum is simply dummy text
    of the printing and typesetting 
    industry. Lorem Ipsum has been 
    the industry's standard dummy 
    text ever since the 1500.
    `,
  },
];

module.exports = { mixedSubtitles };
