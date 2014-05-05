var Site = (function()
{
    'use strict';
    function Site()
    {
    };
    Site.init = function()
    {
        $('.bg').animate({opacity: 1}, 1000);
        var steps = $('.js-step').get();
        var delay = 0;
        for(var index in steps)
        {
            $(steps[index]).delay(delay).animate({opacity: 1, left: 0}, 400);
            delay += 50;
        }
        $(window).on('resize', $.proxy(this, 'onWindowResize')).trigger('resize');
    };
    Site.onWindowResize = function()
    {
        var $content = $('.content');
        var $window = $(window);
        $content.css({top: (($window.height() - $content.height()) / 2) + 'px', left: (($window.width() - $content.width()) / 2) + 'px'});
    };
    return Site;
})();