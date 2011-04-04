/// <reference path="../../jquery/jquery-1.4.1-vsdoc.js" />
/*
Requires dateformat.js
Requires maskedinput
*/

(function ($) {
    //this is just for intellisense purposes, you can comment it out
    var $ = jQuery;

    $.fn.stso_timepicker = function () {
        var options = $.fn.stso.mergeOptions($.fn.stso_timepicker.defaults)
        , resources = options.resources
        , isBuilt = false
        , timeList = []
        , timeListFormatted = []
        , mode = getMode();

        function getMode() {
            if (resources.timeFormat.toLowerCase().indexOf('tt') != (-1)) return 'ampm';
            else return '24h';
        } //getMode()


        function build(/*jQuery*/context) {
            addMask(context);
            buildDropDown(context);
            hookupFocus(context);
            isBuilt = true;
        } //build()


        function buildDropDown(/*jQuery*/element) {
            var currTimeMins = 0
            , dayMins = 60 * 23 + 59
            , format = (mode == 'ampm') ? resources.timeFormat + ' TT' : resources.timeFormat
            , html = new StringBuffer();

            timeList = []; //reset
            do {
                var newDate = new Date(0);
                newDate.setHours(newDate.getHours() - 1);
                newDate.setMinutes(currTimeMins);
                timeList.push(newDate);
                currTimeMins += options.step;
            }
            while (currTimeMins <= dayMins);

            html.append('<div class="timePicker hidden">');
            for (var i = 0, l = timeList.length; i < l; i++) {
                var timeFormatted = timeList[i].format(format);
                html.append('<div class="item timePickerItem" data-value="' + timeList[i].format('HH:MM') + '">' + timeFormatted + '</div>');
            }
            html.append('</div>');

            element.wrap('<div class="timePickerWrapper">');
            var wrapper = element.parents('.timePickerWrapper');
            wrapper.append(html.toString());

            $('.timePickerItem', wrapper).click(function () {
                element.val($(this).text());
                hideDropdowns();
                element.trigger('change');
            });
        } //buildDropDown()


        function addMask(/*jQuery*/element) {
            var maskFormat = 'nn:nn';
            element.mask(maskFormat, { placeholder: ' ' });
            // clear input field on blur (build-in fn in $.mask doesnt work .. dont know why
            element.blur(function () {
                var v = this.value;
                if (maskFormat.replace(/n/g, ' ') == v) {
                    this.value = '';
                }
            });
        } //addMask()

        function hookupFocus(/*jQuery*/element) {
            //TODO: doesnt work on 100% with focus event
            element.click(function () {
                var dropdown = $('.timePicker', $(this).parent());
                if (dropdown.is(':visible')) hideDropdowns();
                else showGivenDropdown(dropdown);
            });
        } //hookupFocus();


        function hideDropdowns(/*jQuery*/except) {
            if (except == undefined) $('.timePicker').hide();
            else $('.timePicker').not(except).hide();
        } //hideDropdowns()


        function showGivenDropdown(/*jQuery*/dropdown) {
            if (dropdown.is(':visible')) dropdown.hide();
            else dropdown.show();
            //hide other dropdowns
            hideDropdowns(dropdown);
        }; //showGivenDropDown()


        //hide dropdowns when clicking outside of them
        $('html').click(function (e) {
            if ($(e.target).parents('.timePickerWrapper').length == 0) {
                hideDropdowns();
            }
        });


        return this.each(function () {
            build($(this));
        });
    }; //stso_timepicker

    $.fn.stso_timepicker.defaults = {
        step: 30 /* in minutes. Should be fraction of 60. Or greater (120, 180 etc) */
        , mode: '24h' /* 24h | ampm */
        , resources: {
            timeFormat: 'HH:MM' //'hh:MM' for ampm
            , am: 'AM'
            , pm: 'PM'
        }
    }
})(jQuery);