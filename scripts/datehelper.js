/*
Simple function for extracting Date object from formatted dateString
It takes in account only date, month, year not hours or minutes
*/

var dateHelper = function (/*String*/dateFormat, /*String optional*/formattedDate, /*String optional*/separator) {
    if (arguments.length > 0) {
        this.init(dateFormat);
        if (separator != undefined && separator != '') this.positions.separator = separator;
    }
    else console.error('dateHelper was not given any parameters');

    if (formattedDate != undefined) return this.getDate(formattedDate);
};

dateHelper.prototype.init = function (/*String*/dateFormat) {
    // get date separator
    if (dateFormat.indexOf(".") > 0) this.positions.separator = ".";
    else if (dateFormat.indexOf("/") > 0) this.positions.separator = "/";
    else if (dateFormat.indexOf(" ") > 0) {
        this.positions.separator = " ";
        console.log("dateHelper - Unusual date separator: space");
    }
    else {
        this.positions.separator = undefined;
        console.error("dateHelper error: unknown date separator. Use '.' or '/' or 'space'. Or specify it in constructor as 3rd parameter.");
    }

    // get year / month / date positions
    var dateFormatItems = dateFormat.split(this.positions.separator);
    for (var i = 0; i < dateFormatItems.length; i++) {
        if (dateFormatItems[i].indexOf('d') > (-1)) this.positions.date = i;
        if (dateFormatItems[i].indexOf('m') > (-1)) this.positions.month = i;
        if (dateFormatItems[i].indexOf('y') > (-1)) this.positions.year = i;
    }

}   //init()

dateHelper.prototype.positions = {
    separator: null
    , year: null
    , month : null
    , date : null
} //positions {}

dateHelper.prototype.getDate = function (/*String*/formattedDate, /*optional string*/separator) {
    if (formattedDate == undefined || formattedDate == '') return new Date();
    var dateItems = formattedDate.split(separator || this.positions.separator);
    return new Date(parseInt(dateItems[this.positions.year], 10), parseInt(dateItems[this.positions.month], 10), parseInt(dateItems[this.positions.date], 10));
} //getDate()

dateHelper.prototype.dateDiff = function (/*String*/formattedDateFrom, /*String*/formattedDateTo) {
    dayMs = 1000 * 60 * 60 * 24;
    return Math.floor((this.getDate(formattedDateTo) - this.getDate(formattedDateFrom)) / dayMs);
} //dateDiff()