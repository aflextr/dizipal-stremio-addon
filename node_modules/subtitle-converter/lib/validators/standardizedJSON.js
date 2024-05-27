/* eslint-disable complexity */
function buildStatusObject(options) {
  const status = {
    success: true,
  };

  if (options.startsAtZeroHour) status.startsAtZeroHour = true;
  if (options.reversedTimecodes) status.reversedTimecodes = [];
  if (options.overlappingTimecodes) status.overlappingTimecodes = [];
  if (options.formattedText) status.formattedText = [];

  return status;
}

function validateStandardized(standardizedText, options = {
  startsAtZeroHour: true,
  reversedTimecodes: true,
  overlappingTimecodes: true,
  formattedText: true,
}) {
  const status = buildStatusObject(options);

  let prevEndTime = 0;
  standardizedText.forEach((entry, index) => {
    const {
      id,
      timecode,
      startMicro,
      endMicro,
      text,
    } = entry;

    // VALIDATE IDS

    // VALIDATE TIMECODES
    // Check starts at zero hour
    const oneHourMicro = 3600000000;
    if (options.startsAtZeroHour && index === 0 && startMicro >= oneHourMicro) {
      status.startsAtZeroHour = false;
      status.success = false;
    }

    // Check overlapping times
    if (options.overlappingTimecodes && startMicro < prevEndTime) {
      status.overlappingTimecodes.push({ id, timecode });
      status.success = false;
    }

    // Check reversed time
    if (options.reversedTimecodes && startMicro > endMicro) {
      status.reversedTimecodes.push({ id, timecode });
      status.success = false;
    }

    // VALIDATE TEXT
    // Check for formatted text
    if (options.formattedText && text.match(/{|}|<|>/)) {
      status.formattedText.push({ id, text });
      status.success = false;
    }

    // UPDATE PREVIOUS
    prevEndTime = endMicro;
  });

  return status;
}

module.exports = validateStandardized;
