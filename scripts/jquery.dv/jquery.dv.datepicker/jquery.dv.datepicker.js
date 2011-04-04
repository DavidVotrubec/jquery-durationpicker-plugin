/// <reference path="../jquery/jquery-1.4.1-vsdoc.js" />
(function ($) {
    //this is just for intellisense purposes, you can comment it out
    var $ = jQuery;

    $.fn.dv_datepicker = function (params) {
		var options = (params) ? $.extend({}, $.fn.dv_datepicker.defaults, params.options) : {};
        
        return this.each(function () {
            var $el = $(this)
            , _dateFormat = $el.attr('data-dateFormat') || options.defaultDateFormat
            , dateFormat = _dateFormat.replace('yyyy', 'yy')
            , calOptions = { yearRange: "1900:2020", dateFormat: dateFormat, showOn:'button', buttonImageOnly:true};            
                
			$el.parent().addClass('hideCalImage');
			var calImgController = $('<div class="calImg"></div>').click(function () {
				if ($el.attr('data-hasDPVisible') == 'true') {
					$el.attr('data-hasDPVisible', 'false');
					$el.datepicker('hide');
				}
				else {
					$el.attr('data-hasDPVisible', 'true');
					$el.datepicker('show');
				}
			}).appendTo($el.parent());

            if ($el.attr('showyearmonthselection') == 'true') {
                calOptions.changeYear = true;
                calOptions.changeMonth = true;
            }

            // masked input
            var maskFormat = _dateFormat.toString().replace(/[a-zA-Z]/g, 'n'); /*n stands for [ 0-9]*/
            $el.mask(maskFormat, { placeholder: ' ' });

            $el.datepicker(calOptions);

            // clear input field on blur (build-in fn in $.mask doesnt work .. dont know why
            $el.blur(function () {
                var v = this.value;
                if (maskFormat.replace(/n/g, ' ') == v) {
                    this.value = '';
                }
            });
        });
    };

    $.fn.dv_datepicker.defaults = {
        uiCulture: 'en'
        , defaultDateFormat: 'dd.mm.yyyy'
    }
})(jQuery);