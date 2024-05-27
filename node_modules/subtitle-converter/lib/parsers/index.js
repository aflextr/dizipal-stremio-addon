const scc = require('./scc');
const srt = require('./srt');
const ttml = require('./ttml');
const vtt = require('./vtt');
const ass = require('./ass');

// eslint-disable-next-line complexity
function parse(subtitleText, inputExtension, options = {}) {
  switch (inputExtension) {
    case '.srt':
      return srt(subtitleText, options);
    case '.scc':
      return scc(subtitleText, options);
    case '.vtt':
      return vtt(subtitleText, options);
    case '.ass':
      return ass(subtitleText, options);
    case '.dfxp':
    case '.ttml':
      return ttml(subtitleText, options); // Use .ttml for dfxp as well
    default:
      throw Error(
        `File type ${inputExtension} is not supported. Supported input file types include:\n`
          + 'dfxp, scc, srt, ttml, vtt, and ass',
      );
  }
}

module.exports = parse;
