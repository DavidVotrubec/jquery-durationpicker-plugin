/*
Requires jquery.dateformat.js
Requires dv.datepicker.js
*/

(function ($) {

    $.fn.durationpicker = function (params) {

		var options, resources;
		
		if (params) {
			options = $.extend({}, $.fn.durationpicker.defaults, params.options);
			resources = $.extend({}, $.fn.durationpicker.defaults.resources, params.resources);
		}
		else {
			options = $.fn.durationpicker.defaults;
			resources = $.fn.durationpicker.defaults.resources;
		}

        var values = {
            from: null /*Date*/
            , to: null /*Date*/
            , initialDuration: null
            , duration: null /* in minutes*/
            , timeFromList: []
            , timeToList: []
            , context: null
            , dateToField: null
            , dateFromField: null
            , timeToField: null
            , timeFromField: null
            , wholeDayField: null
            , timeFormat: null
        }
        var dateHelperObj = null;
        var timeHelperObj = null;

        function build(/*jQuery*/context) {
            //This is the main function
            initVariables(context);
            initDatePicker();
            initTimePicker(values.timeFromField);
            initTimePicker(values.timeToField);
            buildTimeFromDropDown(values.timeFromField);
            buildTimeToDropDown(values.timeToField);
            hookupInputClick();
            hookupDateFromChange();
            hookupDateToChange();
            hookupWholeDayChecked();
            hookupFieldsChanged();
        } //build()

        function initVariables(/*jQuery*/context) {
            /**
            Read values from html.
            If no values are given -> create them dynamicaly
            and store to 'global' values object
            */

            if (!context.hasClass('durationPicker')) context.addClass('durationPicker');

            values.context = context;
            values.dateFormat = context.attr('data-dateFormat') || resources.dateFormat;
            values.timeFormat = context.attr('data-timeFormat') || resources.timeFormat;            
            values.dateFromField = $('.' + options.dateFromClass, context);
            values.dateToField = $('.' + options.dateToClass, context);
            values.timeFromField = $('.' + options.timeFromClass, context);
            values.timeToField = $('.' + options.timeToClass, context);
            values.wholeDayField = $('.' + options.wholeDayClass, context);
            values.mode = getMode();
            
            dateHelperObj = new dateHelper(values.dateFormat);
            timeHelperObj = new timeHelper();

            //set timeFrom if not given
            if (!values.timeFromField.val()) {
                var val = new Date().format(values.timeFormat);
                values.timeFromField.val(val);
            }

            //set timeTo if not given
            if (!values.timeToField.val()) {
                var d = new Date().format(values.timeFormat);
                d = timeHelperObj.addTime(d, options.duration, values.mode);
                values.timeTo = d;
                values.timeToField.val(d);
            }

            //dateFrom
            var dateFrom = dateHelperObj.getDate(values.dateFromField.val(), '/')
            , timeFromArr = values.timeFromField.val().split(resources.timeSeparator)
            , hoursFrom = null
            , minutesFrom = null;

            //dateFrom.setMonth(dateFrom.getMonth() - 1) //human format

            if (values.mode == 'ampm') {
                var mt = timeFromArr[1], h = parseInt(timeFromArr[0]);
                if (timeHelperObj.getAmpm(mt) == resources.pm) {
                    if (h == 12) h = 0;
                    else h = h + 12;
                    hoursFrom = h;
                    minutesFrom = parseInt(timeFromArr[1], 10);
                }
                else {
                    hoursFrom = h;
                    minutesFrom = parseInt(timeFromArr[1], 10);
                }
            }
            else {
                hoursFrom = parseInt(timeFromArr[0], 10);
                minutesFrom = parseInt(timeFromArr[1], 10);
            }

            dateFrom.setHours(hoursFrom);
            dateFrom.setMinutes(parseInt(timeFromArr[1], 10));
            values.from = dateFrom;

            //dateTo
            var dateTo = dateHelperObj.getDate(values.dateToField.val(), '/')
            , timeToArr = values.timeToField.val().split(resources.timeSeparator)
            , hoursTo = null
            , minutesTo = null;
            
            //dateTo.setMonth(dateTo.getMonth() - 1) //human format

            if (values.mode == 'ampm') {
                var mt = timeToArr[1], h = parseInt(timeToArr[0]);
                if (timeHelperObj.getAmpm(mt) == resources.pm) {
                    if (h == 12) h = 0;
                    else h = h + 12;
                    hoursTo = h;
                    minutesTo = parseInt(timeToArr[1], 10);
                }
                else {
                    hoursTo = h;
                    minutesTo = parseInt(timeToArr[1], 10);
                }
            }
            else {
                hoursTo = parseInt(timeToArr[0], 10);
                minutesTo = parseInt(timeToArr[1], 10);
            }
            dateTo.setHours(hoursTo);
            dateTo.setMinutes(minutesTo);
            values.to = dateTo;

            if (!values.dateFromField.val()) values.dateFromField.val(dateFrom.format(values.dateFormat));
            if (!values.dateToField.val()) values.dateToField.val(dateTo.format(values.dateFormat));

            if (!values.duration) {
                values.duration = options.duration; // default 1 hour
            }
        } //initVariables()
			

        /************************************************************************
        * helper functions
        ************************************************************************/
        function getMode() {
            if (values.timeFormat.toLowerCase().indexOf('t') != (-1)) return 'ampm';
            else if (values.timeFormat.indexOf('hh')) return 'ampm';
            else if (values.timeFormat.indexOf('HH')) return '24h';
            else {
                console.warn('durationpicker - unknown timeformat');
                return '24h';
            }
        } //getMode()


        function formatDurationString(/*int*/duration) {
            if (duration < 0) duration = duration * (-1);

            if (duration == undefined) return '';
            var unit = 60
            , timeString = ''
            , timeCount = 0;

            if (duration < unit) {
                timeString = ' ' + resources.abbrMinutes;
                timeCount = duration; //just minutes
            }
            else if (duration == unit) {
                timeString = ' ' + resources.abbrHour;
                timeCount = 1; //one hour
            }
            else {
                //more than 1 hour
                var hours = Math.floor(duration / unit)
                , mins = duration - hours * unit
                , minStr = (mins > 0) ? (mins + resources.abbrMinutes) : ''
                , hourStr = hours + resources.abbrHours;
                return hourStr + ' ' + minStr;
            }

            return timeCount + timeString;
        } //formatDurationString()

        /************************************************************************
        * eof helper functions
        ************************************************************************/


        /************************************************************************
        * plugin functions
        ************************************************************************/
        function initDatePicker() {
			//wrapper is here just because for layout - in order to prevent calendar icon floating left or right -> keep it near the field			
			values.dateFromField.attr('data-dateFormat', values.dateFormat).wrap('<div class="wrapper"></div>').dv_datepicker();
			values.dateToField.attr('data-dateFormat', values.dateFormat).dv_datepicker();			
        } //initDatePicker()
        
        function initTimePicker(/*jQuery*/ element) {
			var _m = values.timeFormat.split(' ')
			, maskFormat = _m[0].replace(/[a-zA-Z]/g, '9');			
			if (_m.length > 1) { 
				maskFormat += ' ' + _m[1].replace(/[a-zA-Z]/g, 'a');
			}
			element.mask(maskFormat, {placeholder: ' '}).blur(function () {			
                var v = this.value;
                if (maskFormat.replace(/n/g, ' ') == v) {
                    this.value = '';
                }
            });
        } //initTimePicker()
        
        
        function createDateObject(/*int*/minutes) {
            var d = new Date(0);
            d.setMinutes(minutes);
            return d;
        } //createDateObject()


        function buildTimeFromDropDown(/*jQuery*/element, /*boolean*/rebuild) {
            var currTimeMins = 0
            , dayMins = 60 * 23 + 59
            , html = new StringBuffer()
            , format = values.timeFormat
            , dateFrom = dateHelperObj.getDate(values.dateFromField.val());
            
            dateFrom.setMonth(dateFrom.getMonth() - 1); //because of human format

            values.timeFromList = [];
            do {
                var newDate = new Date(dateFrom.valueOf());
                newDate.setMinutes(currTimeMins);
                values.timeFromList.push(newDate);
                currTimeMins += options.step;
            }
            while (currTimeMins <= dayMins);

            for (var i = 0, l = values.timeFromList.length; i < l; i++) {
                var timeFrom = values.timeFromList[i]
                , attrDateTime = timeFrom.format('dd.mm.yyyy H:M')
                , displayDateTime = timeFrom.format(format);
                html.append('<div class="item" data-value="' + attrDateTime + '">' + displayDateTime + '</div>');
            }

            if (!rebuild) element.wrap('<div class="timeFromContainer timeContainer inlineBlock"></div>');
            var container = $('.timeFromContainer', values.context);
            if (rebuild) $('.timeDropDown', container).remove();
            container.append('<div class="timeDropDown">' + html.toString() + '</div>');

            hookupTimeFromClick(container);
        } //buildTimeFromDropDown()


        function buildTimeToDropDown(/*jQuery*/element, /*boolean*/rebuild) {
            var dateTo = dateHelperObj.getDate(values.dateToField.val())
            , dateFrom = dateHelperObj.getDate(values.dateFromField.val());
            
            dateTo.setMonth(dateTo.getMonth() - 1); //human format
            dateFrom.setMonth(dateFrom.getMonth() - 1); //human format            
            
            var diff = dateTo - dateFrom;
            values.duration = (diff == 0) ? 0 : Math.floor(diff / 1000 / 60 / 60 / 24); //duration in days

            if (values.duration < 0) {
                console.error('jquery.duration.picker: dateFrom is greater than dateTo.');
                values.timeToList = values.timeFromList;
            }

            // long event
            if (values.duration > 0) {
                var currTimeMins = 0
                , dayMins = 60 * 23 + 59
                values.timeToList = [];
                do {
                    var newDate = new Date(dateTo.valueOf());
                    newDate.setMinutes(currTimeMins);
                    values.timeToList.push(newDate);
                    currTimeMins += options.step;
                }
                while (currTimeMins <= dayMins);
            }
            // one day event
            else if (values.duration == 0) {
                var ampmString = (values.mode == 'ampm') ? (' ' + resources.am) : '';
                values.timeToList = [];

                var val = values.timeFromField.val(), hh = val.split(resources.timeSeparator), h = hh[0], m = parseInt(hh[1], 10);
                if (values.mode == 'ampm') {
                    if (timeHelperObj.getAmpm(val.toLowerCase()) == 'am') {
                        if (h == 12) h = 0;
                    }
                    else {//pm
                        if (h < 12) h = parseInt(h, 10) + 12;
                    }
                }
                var currTimeMins = (h * 60) + m
                , dayMins = 23 * 59 + currTimeMins;

                while (currTimeMins <= dayMins) {
                    currTimeMins += options.step;
                    var dateTo = dateHelperObj.getDate(values.dateFromField.val());
                    dateTo.setMonth(dateTo.getMonth() - 1); //human format
                    dateTo.setMinutes(currTimeMins);
                    values.timeToList.push(dateTo);
                }
            }
            else if (isNaN(values.duration)) {
                console.error('jquery.durationpicker - duration is not a number.');
                values.duration = 1;
            }
            else {
                console.warn('jquery.durationpicker - value dateTo or dateFrom is probably in wrong format. ' + values.duration);
            }

            var html = new StringBuffer()
            , format = values.timeFormat
            , fromTime = values.timeFromField.val()
            , fromTimeArr = fromTime.split(resources.timeSeparator)
            , h = fromTimeArr[0]
            , hours = 0;
            if (values.mode == 'ampm') {
                if (timeHelperObj.getAmpm(fromTime).toLowerCase() == 'am') {
                    if (h == 12) hours = 0;
                    else hours = h;
                }
                else {//pm
                    if (h < 12) hours = parseInt(h, 10) + 12;
                }
            }
            else hours = h;

            dateFrom.setHours(hours);
            dateFrom.setMinutes(parseInt(fromTimeArr[1], 10));
            if (values.duration == 0) { //single day event
                for (var i = 0, l = values.timeToList.length; i < l; i++) {
                    var timeTo = values.timeToList[i]
                    , attrDateTime = timeTo.format('dd.mm.yyyy H:M')
                    , displayDateTime = timeTo.format(format)
                    , diff = Math.floor((timeTo - dateFrom) / 1000 / 60)
                    , durationDesc = (diff > 0) ? '&nbsp;(' + formatDurationString(diff) + ')' : ''
                    html.append('<div class="item" data-value="' + attrDateTime + '">' + displayDateTime + durationDesc + '</div>');
                }
            }
            else { //long event
                for (var i = 0, l = values.timeToList.length; i < l; i++) {
                    var timeTo = values.timeToList[i]
                    , attrDateTime = timeTo.format('dd.mm.yyyy H:M')
                    , displayDateTime = timeTo.format(format);
                    html.append('<div class="item" data-value="' + attrDateTime + '">' + displayDateTime + '</div>');
                }
            }

            if (!rebuild) element.wrap('<div class="timeToContainer timeContainer inlineBlock"></div>');
            var container = $('.timeToContainer', values.context);
            if (rebuild) $('.timeDropDown', container).remove();
            container.append('<div class="timeDropDown">' + html.toString() + '</div>');

            hookupTimeToClick(container);
        } //buildTimeToDropDown()


        function validateAllFields() {
            //reset errors:
            var fields = [values.dateFromField, values.timeFromField, values.timeToField, values.dateToField];
            for (var i = 0, l = fields.length; i < l; i++) {
                fields[i].removeClass('error');
            }

            //dateTo < dateFrom
            var duration = dateHelperObj.dateDiff(values.dateFromField.val(), values.dateToField.val());
            if (duration < 0) {
                values.dateFromField.addClass('error');
                values.dateToField.addClass('error');
            }

            //if duration > 0 && timeTo < timeFrom
            if (duration == 0 && (timeHelperObj.timeDiff(values.timeFromField.val(), values.timeToField.val(), values.mode) < 0)) {
                values.timeFromField.addClass('error');
                values.timeToField.addClass('error');
            }

            if (!timeHelperObj.isValid(values.timeFromField.val(), values.mode)) values.timeFromField.addClass('error');
            if (!timeHelperObj.isValid(values.timeToField.val(), values.mode)) values.timeToField.addClass('error');
        } //validateTimeFields()


        function addDaysToField(/*jQuery*/field, /*int*/days) {
            var date = dateHelperObj.getDate(field.val());
            date.setDate(date.getDate() + 1);
            
            date.setMonth(date.getMonth() - 1); //because of human readable format (months from 1)
            
            field.val(date.format(values.dateFormat));
            field.trigger('change');
        } //addDaysToField()


        function getDuration() {
            //returns event duration - in minutes
            var fromDate = dateHelperObj.getDate(values.dateFromField.val())
            , fromTime = values.timeFromField.val()
            , toDate = dateHelperObj.getDate(values.dateToField.val())
            , toTime = values.timeToField.val();
            
            fromDate.setMonth(fromDate.getMonth() - 1); //human format
            toDate.setMonth(toDate.getMonth() - 1); //human format

            //get timeFrom hours, minutes
            var oldFromHours = 0
            , h = parseInt(fromTime.split(resources.timeSeparator)[0], 10)
            , m = parseInt(fromTime.split(resources.timeSeparator)[1], 10);
            if (values.mode == 'ampm') {
                if (timeHelperObj.getAmpm(fromTime).toLowerCase() == 'am') {
                    if (h == 12) oldFromHours = 0;
                    else oldFromHours = h;
                }
                else {//pm
                    if (h < 12) oldFromHours = parseInt(h, 10) + 12;
                }
            }
            else oldFromHours = h;
            fromDate.setHours(oldFromHours);
            fromDate.setMinutes(m);

            //get timeTo hours, minutes
            var oldToHours = 0
            , hh = parseInt(toTime.split(resources.timeSeparator)[0], 10)
            , mm = parseInt(toTime.split(resources.timeSeparator)[1], 10);
            if (values.mode == 'ampm') {
                if (timeHelperObj.getAmpm(toTime).toLowerCase() == 'am') {
                    if (hh == 12) oldToHours = 0;
                    else oldToHours = hh;
                }
                else {//pm
                    if (hh < 12) oldToHours = parseInt(hh, 10) + 12;
                }
            }
            else oldToHours = hh;
            toDate.setHours(oldToHours);
            toDate.setMinutes(mm);

            var diff = Math.floor((toDate.valueOf() - fromDate.valueOf()) / 1000 / 60);
            return diff;
        } //getDuration()


        function hideDropDowns(/*jQuery*/except) {
            if (except == undefined) $('.timeDropDown').hide();
            else $('.timeDropDown').not(except).hide();
        } //hideDropDowns()
        

        function hookupTimeFromClick(/*jQuery*/container) {
            /* hookup click event on items in dropdown*/
            $('.item', container).click(function () {
                var el = $(this)
                , duration = getDuration()
                , dateAttr = el.attr('data-value')
                , newFromDate = dateHelperObj.getDate(dateAttr, '.')
                , timePart = dateAttr.split(' ')[1]
                , datesDuration = dateHelperObj.dateDiff(values.dateFromField.val(), values.dateToField.val());
                
                newFromDate.setMonth(newFromDate.getMonth() - 1);  //because of human format
                
                newFromDate.setHours(timePart.split(':')[0]);
                newFromDate.setMinutes(timePart.split(':')[1]);

                //update timeFromField
                values.timeFromField.val(newFromDate.format(values.timeFormat));
                values.timeFromField.trigger('change');

                //update timeToField if needed
                if (datesDuration == 0) {
                    var newToDate = new Date(newFromDate.valueOf());
                    var newToHour = Math.floor(duration / 60)
                    , newToMinutes = duration - (newToHour * 60);
                    newToDate.setMinutes(newToDate.getMinutes() + newToMinutes);
                    newToDate.setHours(newToDate.getHours() + newToHour);

                    values.timeToField.val(newToDate.format(values.timeFormat)).trigger('change');
                    values.dateToField.val(newToDate.format(values.dateFormat)).trigger('change');
                }

                hideDropDowns();
            });
        } //hookupTimeFromClick()


        function hookupTimeToClick(/*jQuery*/container) {
            /*hookup click event on items in dropdown*/
            $('.item', container).click(function () {
                var el = $(this)
                , dateAttr = el.attr('data-value')
                , oldDate = dateHelperObj.getDate(values.dateToField.val())
                , newDate = dateHelperObj.getDate(dateAttr, '.')
                , timePart = dateAttr.split(' ')[1];
                newDate.setHours(timePart.split(':')[0]);
                newDate.setMinutes(timePart.split(':')[1]);

                values.timeToField.val(newDate.format(values.timeFormat)).trigger('change');
                
                newDate.setMonth(newDate.getMonth() - 1);  //because of human format
                
                values.dateToField.val(newDate.format(values.dateFormat)).trigger('change');
                hideDropDowns();
            });
        } //hookupTimeToClick()


        function hookupInputClick() {
            var timeToField = values.timeToField
            , timeFromField = values.timeFromField
            values.timeFrom = timeFromField.val();
            values.timeTo = timeToField.val();

            timeFromField.focus(function () {
                buildTimeFromDropDown(timeFromField, true);
                showGivenDropDown($(this));
            });

            timeToField.focus(function () {
                buildTimeToDropDown(timeToField, true);
                showGivenDropDown($(this));
            });

            function showGivenDropDown(el) {
                var dropDown = $('.timeDropDown', el.parents('.timeContainer'));
                if (dropDown.is(':visible')) dropDown.hide();
                else dropDown.show();
                //hide other dropdowns
                hideDropDowns(dropDown);                
            };
        } //hookupInputClick()


        function hookupDateFromChange() {
            $('.' + options.dateFromClass, values.context).change(function () {
                values.dateFrom = $(this).val();
            });
        } //hookupDateFromChange()


        function hookupDateToChange() {
            $('.' + options.dateToClass, values.context).change(function () {
                values.dateTo = $(this).val();
                buildTimeToDropDown($('.' + options.timeToClass, values.context), true);
            });
        } //hookupDateToChange()

        function hookupFieldsChanged() {
            $('input', values.context).not(values.wholeDayField).change(function () {
                validateAllFields();
            });
        } //hookupFieldsChanged()

        function hookupWholeDayChecked() {
            var wholeDayCheckbox = values.wholeDayField

            if (wholeDayCheckbox.attr('checked')) $('.timeContainer', values.context).hide();

            wholeDayCheckbox.click(function (e) {
                if ($(this).attr('checked')) $('.timeContainer', values.context).hide();
                else $('.timeContainer', values.context).show();
            });
        } //hookupAllDayChecked()


        // hide dropDowns when clicking outside of them
        $('html').click(function (e) {
            if ($(e.target).parents('.timeContainer').length == 0) {
                hideDropDowns();
            }
        });
		
        return this.each(function () {
            build($(this));
        });

    }; //$.fn.durationpicker definition


    $.fn.durationpicker.defaults = {
        duration: 60 /* in minutes*/
        , step: 30 /* in minutes. Should be fraction of 60. Or greater (120, 180 etc) */
        , mode: '24h' /* 24h | ampm */
        , timeFromClass: 'timeFrom' /*selector*/
        , timeToClass: 'timeTo' /*selector*/
        , dateToClass: 'dateTo' /*selector*/
        , dateFromClass: 'dateFrom' /*selector*/
        , wholeDayClass: 'wholeDayCheckbox' /*selector*/
        , resources: {
            abbrMinutes: 'm'
            , abbrHour: 'h'
            , abbrHours: 'h'
            , dateFormat: 'dd/mm/yyyy'
            , timeFormat: 'hh:MM' //no 'tt' -> that means 24h mode.
            , timeSeparator: ':'
            , am: 'am'
            , pm: 'pm'
        }
    }

})(jQuery);