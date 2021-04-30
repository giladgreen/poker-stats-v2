function dateToString(date, timeDate) {
  const isoDate = date.toISOString();
  const year = parseInt(isoDate.substr(0, 4), 10);
  const month = parseInt(isoDate.substr(5, 2), 10) - 1;
  const day = parseInt(isoDate.substr(8, 2), 10);
  const time = timeDate.toTimeString();
  const hours = parseInt(time.substr(0, 2), 10);
  const minutes = parseInt(time.substr(3, 2), 10);
  return new Date(year, month, day, hours, minutes, 0);
}

function addSeconds(date, s) {
  const seconds = typeof s === 'string' ? parseInt(s, 10) : s;
  const newDate = new Date(dateToString(date, date));
  newDate.setTime(newDate.getTime() + (seconds * 1000));
  return newDate;
}
function addHours(date, h) {
  const hour = typeof h === 'string' ? parseInt(h, 10) : h;
  const newDate = new Date(dateToString(date, date));
  newDate.setTime(newDate.getTime() + (hour * 60 * 60 * 1000));
  return newDate;
}

export default {
  dateToString,
  addSeconds,
  addHours,
};
