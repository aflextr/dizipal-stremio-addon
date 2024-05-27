const { describe, it } = require('mocha');
const { expect } = require('chai');
const { fromSrt } = require('subtitles-parser');
const { head, pipe, split } = require('ramda');
const convert = require('../converters');
const badTextMultipleReturns = require('./mocks/badTextMultipleReturns');
const badIndexSequence = require('./mocks/badIndexSequence');
const badIndexNotNumerical = require('./mocks/badIndexNotNumerical');
const badTimecodeSyntax = require('./mocks/badTimecodeSyntax');
const badTimecodeOverlap = require('./mocks/badTimecodeOverlap');
const badTimecodeStartsAtZero = require('./mocks/badTimecodeStartsAtZero');
const badTimecodeReversed = require('./mocks/badTimecodeReversed');
const badTextFormatted = require('./mocks/badTextFormatted');
const badTextBlank = require('./mocks/badTextBlank');
const badFirstEntry = require('./mocks/badFirstEntry');
const goodSrt = require('./mocks/goodSRT');
const goodSrtTextWithNums = require('./mocks/goodSRTTextWithNums');
const goodSCC = require('./mocks/goodSCC');
const goodTTML = require('./mocks/goodTTML');
const goodVTT = require('./mocks/goodVTT');
const goodVTT2 = require('./mocks/goodVTT2');
const goodDFXP = require('./mocks/goodDFXP');
const goodASS = require('./mocks/goodASS');
const badASSkeys = require('./mocks/badASSkeys');
const badAllEmpty = require('./mocks/badAllEmpty');

describe('#convert', () => {
  it('should remove multiple returns on a line', () => {
    expect(badTextMultipleReturns.match(/\n\n+/g)).to.not.be.empty;
    const { subtitle, status } = convert(badTextMultipleReturns, '.srt');
    expect(subtitle.match(/\n\n+/g)).to.be.null;
    expect(status.success).to.be.true;
  });

  // INDEX
  it('should resequence indices', () => {
    const { subtitle } = convert(badIndexSequence, '.srt');
    const parsed = fromSrt(subtitle, true);
    expect(parsed[0].text).to.equal('Beijing, hazy sky');
    expect(parsed[1].text).to.equal('Can’t see original dreams');
  });

  it('should catch non numerical indices', () => {
    const { status } = convert(badIndexNotNumerical, '.srt');
    expect(status.success).to.be.false;
    expect(status.invalidIndices).to.not.be.empty;
  });

  // TIMECODE
  it('should shift timecode by seconds', () => {
    const initial = fromSrt(goodSrt, true);
    expect(initial[0].startTime).to.equal(5446);
    expect(initial[0].endTime).to.equal(10817);

    expect(initial[50].startTime).to.equal(348395);
    expect(initial[50].endTime).to.equal(351059);

    expect(initial[100].startTime).to.equal(553090);
    expect(initial[100].endTime).to.equal(556710);

    const { subtitle } = convert(goodSrt, '.srt', { shiftTimecode: 3 });
    const parsed = fromSrt(subtitle, true);

    expect(parsed[0].startTime).to.equal(8446);
    expect(parsed[0].endTime).to.equal(13817);

    expect(parsed[50].startTime).to.equal(351395);
    expect(parsed[50].endTime).to.equal(354059);

    expect(parsed[100].startTime).to.equal(556090);
    expect(parsed[100].endTime).to.equal(559710);
  });
  it('should shift timecode by fps', () => {
    const initial = fromSrt(goodSrt, true);
    expect(initial[0].startTime).to.equal(5446);
    expect(initial[0].endTime).to.equal(10817);

    expect(initial[50].startTime).to.equal(348395);
    expect(initial[50].endTime).to.equal(351059);

    expect(initial[100].startTime).to.equal(553090);
    expect(initial[100].endTime).to.equal(556710);

    const { subtitle } = convert(goodSrt, '.srt', { sourceFps: 30, outputFps: 24 });
    const parsed = fromSrt(subtitle, true);

    expect(parsed[0].startTime).to.equal(6807);
    expect(parsed[0].endTime).to.equal(13521);

    expect(parsed[50].startTime).to.equal(435493);
    expect(parsed[50].endTime).to.equal(438823);

    expect(parsed[100].startTime).to.equal(691362);
    expect(parsed[100].endTime).to.equal(695887);
  });
  it('should fix timecode overlap', () => {
    const { status } = convert(badTimecodeOverlap, '.srt', { timecodeOverlapLimiter: 1 });
    expect(status.overlappingTimecodes).to.be.empty;
  });
  it('should combine overlapping timecodes', () => {
    const { status } = convert(badTimecodeOverlap, '.srt', { combineOverlapping: true });
    expect(status.overlappingTimecodes).to.be.empty;
  });
  it('should start timecode at zero hour', () => {
    const { status } = convert(badTimecodeStartsAtZero, '.srt', { startAtZeroHour: true });
    expect(status.startsAtZeroHour).to.be.true;
  });
  it('should find bad timecode syntax', () => {
    const { status } = convert(badTimecodeSyntax, '.srt');
    expect(status.invalidTimecodes).to.not.be.empty;
  });
  it('should find bad timecode reversed', () => {
    const { status } = convert(badTimecodeReversed, '.srt');
    expect(status.reversedTimecodes).to.not.be.empty;
  });

  // TEXT
  it('should remove text formatting', () => {
    const { status } = convert(badTextFormatted, '.srt', { removeTextFormatting: true });
    expect(status.formattedText).to.be.empty;
  });
  it('should remove blank text', () => {
    const { subtitle, status } = convert(badTextBlank, '.srt');
    const parsed = fromSrt(subtitle, true);
    expect(status.success).to.be.true;
    expect(parsed).to.have.lengthOf(5);
  });
  it('should pass text starting with numbers', () => {
    const { status } = convert(goodSrtTextWithNums, '.srt');
    expect(status.success).to.be.true;
  });
  it('should catch entry without timecode', () => {
    const { status } = convert(badFirstEntry, '.srt');
    expect(status.success).to.be.false;
    expect(status.invalidEntries).to.be.not.empty;
  });
  it('should throw an error when all entries are empty', () => {
    expect(() => convert(badAllEmpty, '.srt')).to.throw('Parsed file is empty');
  });

  // FORMATS
  it('should convert SCC to SRT', () => {
    const { status } = convert(goodSCC, '.srt');
    expect(status.success).to.be.true;
  });
  it('should convert TTML to SRT', () => {
    const { status } = convert(goodTTML, '.srt');
    expect(status.success).to.be.true;
  });
  it('should convert VTT to SRT', () => {
    const { status } = convert(goodVTT, '.srt');
    expect(status.success).to.be.true;
  });
  it('should convert DFXP to SRT', () => {
    const { status } = convert(goodDFXP, '.srt');
    expect(status.success).to.be.true;
  });
  it('should convert ASS to SRT', () => {
    const { status } = convert(goodASS, '.srt');
    expect(status.success).to.be.true;
  });

  it('should convert SCC to VTT', () => {
    const { status } = convert(goodSCC, '.vtt');
    expect(status.success).to.be.true;
  });
  it('should convert TTML to VTT', () => {
    const { status } = convert(goodTTML, '.vtt');
    expect(status.success).to.be.true;
  });
  it('should convert VTT to VTT', () => {
    const { status } = convert(goodVTT2, '.vtt');
    expect(status.success).to.be.true;
  });
  it('should convert DFXP to VTT', () => {
    const { status } = convert(goodDFXP, '.vtt');
    expect(status.success).to.be.true;
  });
  it('should convert ASS to VTT', () => {
    const { status } = convert(goodASS, '.vtt');
    expect(status.success).to.be.true;
  });
});

describe('ASS', () => {
  it('should throw an error when it cannot parse the keys', () => {
    expect(() => convert(badASSkeys, '.srt')).to.throw('Failed to parse keys in .ass file');
  });
  it('should have a first entry with index 1', () => {
    const { subtitle } = convert(goodASS, '.srt', { combineOverlapping: true });
    const firstEntry = pipe(split(/(?:\r\n|\r|\n)/gm), head);
    expect(firstEntry(subtitle)).to.eq('1');
  });
});
