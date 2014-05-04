var Site = (function()
{
    'use strict';
    function Site()
    {
    }
    Site.init = function()
    {
        $('.bg').animate({opacity: 1}, 1000);
        var steps = $('.js-step').get();
        var delay = 0;
        for(var index in steps)
        {
            $(steps[index]).delay(delay).animate({opacity: 1, left: 0}, 200);
            delay += 50;
        }
    };
    return Site;
})();