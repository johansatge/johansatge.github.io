(function(window, document)
{

    'use strict';

    var site = {};
    var backgroundNode = null;
    var backgroundRatio = 0;
    var backgroundMarginRatio = 1 / 10;
    var backgroundDelay = 1;
    var targetPositions = [];

    /**
     * Inits background
     */
    site.initBackground = function()
    {
        backgroundNode = document.querySelector('.js-background');
        backgroundRatio = parseInt(backgroundNode.getAttribute('data-width')) / parseInt(backgroundNode.getAttribute('data-height'));
        window.addEventListener('mousemove', _onMouseMove);
        window.addEventListener('resize', _onWindowResize);
        _onWindowResize();
        _animate();
    };

    /**
     * Background animation
     */
    var _animate = function()
    {
        var images = backgroundNode.querySelectorAll('img');
        for (var index = 0; index < targetPositions.length; index += 1)
        {
            var image_x = images[index].style.left.length > 0 ? parseInt(images[index].style.left) : 0;
            var image_y = images[index].style.top.length > 0 ? parseInt(images[index].style.top) : 0;
            images[index].style.left = (image_x + ((targetPositions[index].x - image_x) / backgroundDelay)) + 'px';
            images[index].style.top = (image_y + ((targetPositions[index].y - image_y) / backgroundDelay)) + 'px';
        }
        requestAnimationFrame(_animate);
    };

    /**
     * Updates background position on mousemove
     * @param evt
     */
    var _onMouseMove = function(evt)
    {
        _updateBackgroundPosition(evt.clientX, evt.clientY);
    };

    /**
     * Updates the position of the background, depending on user input
     * @param user_x
     * @param user_y
     */
    var _updateBackgroundPosition = function(user_x, user_y)
    {
        var images = backgroundNode.querySelectorAll('img');
        targetPositions = [];
        for (var index = 0; index < images.length; index += 1)
        {
            var max_x = -(images[index].offsetWidth - window.innerWidth);
            var max_y = -(images[index].offsetHeight - window.innerHeight);
            targetPositions.push({x: user_x / window.innerWidth * max_x, y: user_y / window.innerHeight * max_y});
        }
    };

    /**
     * Updates background size on resize
     */
    var _onWindowResize = function()
    {
        var win_width = window.innerWidth;
        var win_height = window.innerHeight;
        var target_width;
        var target_height;
        if (win_width / win_height > backgroundRatio)
        {
            target_width = win_width;
            target_height = target_width / backgroundRatio;
        }
        else
        {
            target_height = win_height;
            target_width = target_height * backgroundRatio;
        }
        var images = backgroundNode.querySelectorAll('img');
        var original_margin = window.innerWidth * backgroundMarginRatio;
        var margin = original_margin;
        for (var index = 0; index < images.length; index += 1)
        {
            images[index].style.width = (target_width + margin) + 'px';
            images[index].style.height = (target_height + (margin / backgroundRatio)) + 'px';
            margin -= original_margin / images.length;
        }
        _updateBackgroundPosition(window.innerWidth / 2, window.innerHeight / 2);
    };

    window.Site = site;

})(window, document);