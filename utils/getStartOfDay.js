/**
 * Returns a Date object set to the start (midnight) of a day, with optional offset
 * @param {number} daysOffset - Number of days to offset from today (negative for past, positive for future)
 * @returns {Date} Date object set to midnight of the specified day
 */
function getStartOfDay(daysOffset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(0, 0, 0, 0);
    return date;
}

module.exports = getStartOfDay; // Export the function
