const { describe, it } = require('mocha');
const { expect } = require('chai');
const combineTimecodeOverlap = require('../transformers/combine_timecode_overlap');

describe('#combineTimecodeOverlap', () => {
  it('should not change anything if timecodes do not overlap', () => {
    const mock = [
      {
        id: 1,
        startMicro: 0,
        endMicro: 1,
        text: 'Entry A',
      },
      {
        id: 2,
        startMicro: 2,
        endMicro: 3,
        text: 'Entry B',
      },
    ];
    const res = combineTimecodeOverlap(mock);
    expect(res).to.eql(mock);
  });
  it('should combine entries of overlapping timecodes with a newline between the text', () => {
    const mock = [
      {
        id: 1,
        startMicro: 0,
        endMicro: 1,
        text: 'Entry A',
      },
      {
        id: 2,
        startMicro: 0,
        endMicro: 3,
        text: 'Entry B',
      },
    ];
    const expected = [
      {
        id: 1,
        startMicro: 0,
        endMicro: 3,
        text: 'Entry A\nEntry B',
      },
    ];
    const res = combineTimecodeOverlap(mock);
    expect(res).to.eql(expected);
  });
  it('should update the ids when entries are combined', () => {
    const mock = [
      {
        id: 1,
        startMicro: 0,
        endMicro: 1,
        text: 'Entry A',
      },
      {
        id: 2,
        startMicro: 1,
        endMicro: 2,
        text: 'Entry B',
      },
      {
        id: 3,
        startMicro: 1,
        endMicro: 3,
        text: 'Entry C',
      },
      {
        id: 4,
        startMicro: 3,
        endMicro: 4,
        text: 'Entry D',
      },
    ];
    const expected = [
      {
        id: 1,
        startMicro: 0,
        endMicro: 1,
        text: 'Entry A',
      },
      {
        id: 2,
        startMicro: 1,
        endMicro: 3,
        text: 'Entry B\nEntry C',
      },
      {
        id: 3,
        startMicro: 3,
        endMicro: 4,
        text: 'Entry D',
      },
    ];
    const res = combineTimecodeOverlap(mock);
    expect(res).to.eql(expected);
  });
});
