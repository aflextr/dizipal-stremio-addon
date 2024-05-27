const { describe, it } = require('mocha');
const { expect } = require('chai');
const validate = require('../validators');
const goodSRT = require('./mocks/goodSRT');
const goodSCC = require('./mocks/goodSCC');
const goodVTT = require('./mocks/goodVTT');
const goodDFXP = require('./mocks/goodDFXP');
const goodTTML = require('./mocks/goodTTML');
const badTimecodeReversed = require('./mocks/badTimecodeReversed');
const badTimecodeOverlap = require('./mocks/badTimecodeOverlap');
const badTextFormatted = require('./mocks/badTextFormatted');
const badAllEmpty = require('./mocks/badAllEmpty');

describe('#validate', () => {
  it('should validate srt files', () => {
    const status = validate(goodSRT, '.srt');
    expect(status.success).to.be.true;
  });
  it('should show reversed timecodes', () => {
    const status = validate(badTimecodeReversed, '.srt', { reversedTimecodes: true });
    expect(status.success).to.be.false;
    expect(status.reversedTimecodes).to.not.be.empty;
  });
  it('should show overlapping timecodes', () => {
    const status = validate(badTimecodeOverlap, '.srt', { overlappingTimecodes: true });
    expect(status.success).to.be.false;
    expect(status.overlappingTimecodes).to.not.be.empty;
  });
  it('should show formatted text', () => {
    const status = validate(badTextFormatted, '.srt', { formattedText: true });
    expect(status.success).to.be.false;
    expect(status.formattedText).to.not.be.empty;
  });

  it('should validate scc files', () => {
    const status = validate(goodSCC, '.scc', { formattedText: false });
    expect(status.success).to.be.true;
  });
  it('should validate vtt files', () => {
    const status = validate(goodVTT, '.vtt');
    expect(status.success).to.be.true;
  });
  it('should validate dfxp files', () => {
    const status = validate(goodDFXP, '.dfxp');
    expect(status.success).to.be.true;
  });
  it('should validate ttml files', () => {
    const status = validate(goodTTML, '.ttml');
    expect(status.success).to.be.true;
  });

  it('should throw an error when all entries are empty', () => {
    expect(() => validate(badAllEmpty, '.srt')).to.throw('Parsed file is empty');
  });
});
