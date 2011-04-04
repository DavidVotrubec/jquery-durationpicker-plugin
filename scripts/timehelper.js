var timeHelper = function () { };

timeHelper.prototype.resources = {
    /* DO NOT OVERWRITE THESE UNLESS YOU KNOW WHAT YOU ARE DOING !! */
    timeSeparator: ':'
    , am: 'am'
    , pm: 'pm'
    , defaultMode: 'ampm'
}

timeHelper.prototype.convertMinutesToTimeString = function (/*int*/minutes, /*optional string ampm|24h*/mode) {
    if (mode == undefined || mode == '') mode = this.resources.defaultMode;

    if (minutes == undefined) minutes = 0;
    var unit = 60
    , hours = Math.floor(minutes / unit)
    , mins = Math.floor(minutes - hours * 60);
    if (mins < 10) mins = '0' + mins;

    var ampmString = '';
    if (mode == '24h') {
        if (hours < 10) hours = '0' + hours;
    }
    else if (mode == 'ampm') {
        ampmString = this.resources.am;
        if (hours < 12) ampmString = this.resources.am;
        else if (hours > 24) { //yes i know ... but i am not genius
            hours = hours % 12;
        }
        if (hours > 12) {
            hours = hours - 12;
            ampmString = this.resources.pm;
        }
        if (hours == 0) hours = 12;
    }
    else {
        console.error('timeHelper.convertMinutesToTimeString : unknown mode: ' + mode);
    }

    return hours + this.resources.timeSeparator + mins + ' ' + ampmString;

}       //convertMinutesToTimeString()


timeHelper.prototype.getAmpm = function (/*string*/time) {
    // Returs either 'am' or 'pm'
    //this function should be called only if mode is ampm -- otherwise it makes no sense :)
    if (time.toLowerCase().indexOf('am') != (-1)) return 'am';
    else if (time.toLowerCase().indexOf('pm') != (-1)) return 'pm';
    else {
        console.error('timeHelper.getAmpm - Unknown time mode. No am|pm found.');
        return;
    }
} //getAmpm()

timeHelper.prototype.timeDiff = function (/*String*/fromTime, /*String*/toTime, /*optional string ampm|24h*/mode) {
    // Expects params in hh:mm (+ am|pm?) format
    // returns int minutes
    if (arguments.length == 0) return 0;

    if (mode == undefined || mode == '') mode = this.resources.defaultMode;
    //because of parseInt i dont really dont need mode argument. Just for future compactibility

    var fromMode = (mode == 'ampm') ? (this.getAmpm(fromTime)) : '24h'
    , toMode = (mode == 'ampm') ? (this.getAmpm(toTime)) : '24h'
    , fh = parseInt(fromTime.split(this.resources.timeSeparator)[0], 10)
    , th = parseInt(toTime.split(this.resources.timeSeparator)[0], 10)
    , fromMins = parseInt(fromTime.split(this.resources.timeSeparator)[1], 10)
    , fromHours = fh, toHours = th;

    // if in ampm mode -> convert hours back to 24h mode (so i am able to calculate with it)
    if (mode == 'ampm') {
        if (fromMode == 'pm' && fh < 12) {
            fromHours = fh + 12;
        }
        else if (fromMode == 'am' && fh == 12) {
            fromHours = 0;
        }

        if (toMode == 'pm' && th < 12) {
            toHours = th + 12;
        }
        else if (toMode == 'am' && th == 12) {
            toHours = 0;
        }
    }

    var toMins = parseInt(toTime.split(this.resources.timeSeparator)[1], 10)
    , fromDate = new Date(0)
    , toDate = new Date(0);

    fromDate.setHours(fromHours);
    fromDate.setMinutes(fromMins);
    toDate.setHours(toHours);
    toDate.setMinutes(toMins);

    return (toDate - fromDate) / 1000 / 60;
}  //timeDiff()


timeHelper.prototype.addTime = function (/*String*/oldTime, /*int (minutes)*/delta, /*optional string ampm|24h*/mode) {
    // returns string in hh:mm format
    if (mode == undefined || mode == '') mode = this.resources.defaultMode;

    var hoursOld = parseInt(oldTime.split(this.resources.timeSeparator)[0], 10);
    //if (mode == 'ampm' && this.getAmpm(oldTime) == 'am' && hoursOld == 12) hoursOld = 0;
    if (mode == 'ampm' && this.getAmpm(oldTime) == 'pm' && hoursOld < 12) hoursOld += 12;

    var minsOld = parseInt(oldTime.split(this.resources.timeSeparator)[1], 10)
    , unit = 60
    , addHours = (delta == 0) ? 0 : Math.floor(delta / unit)
    , addMins = (delta == 0) ? 0 : ((delta / unit) - addHours) * unit
    , newHours = (hoursOld + parseInt(addHours, 10))
    , newMins = (minsOld + parseInt(addMins, 10));

    if (newMins >= unit) {
        newMins = newMins - unit;
        newHours++;
    }

    var ampmString = '';
    if (mode == '24h') {
        if (newHours < 10) newHours = '0' + newHours;
    }
    else if (mode == 'ampm') {
        ampmString = this.resources.am;
        if (newHours == 0) newHours = 12; //just for formatting. Not a real value
        if (newHours < 12) ampmString = this.resources.am;
        else if (newHours > 12) {
            newHours = newHours - 12;
            ampmString = this.resources.pm
        }
        if (newHours < 10) newHours = '0' + newHours;
    }
    else {
        console.error('timeHelper.addTime : unknown mode: ' + mode);
    }

    if (newMins < 10) newMins = '0' + newMins;    

    return newHours + this.resources.timeSeparator + newMins + ' ' + ampmString;
}    //addTime()


timeHelper.prototype.isValid = function (/*string*/time, /*string*/mode) {
    //returns boolean
    if (mode == undefined || mode == '') mode = this.resources.defaultMode;
    var maxHours = (mode == 'ampm') ? 12 : 23
    , minHours = (mode == 'ampm') ? 1 : 0
    , maxMins = 59
    , arr = time.split(this.resources.timeSeparator)
    , h = arr[0]
    , m = arr[1];
    if (h > maxHours || h < minHours) return false;
    if (m > maxMins || m < 0) return false;
    return true;
} //isValid()