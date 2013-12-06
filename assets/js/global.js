jQuery(document).ready(function($)
{
	
	/**
	 * Zooms
	 */
	$('.zoomable').on('mouseover', function(evt)
	{
		var item = $(evt.currentTarget);
		item.stop().animate(
		{
			'width': 	item.data('maxzoom'),
			'height': 	item.data('maxzoom'),
			'top': 		item.data('maxpos'),
			'left': 	item.data('maxpos')
		},
		100);
	});
	$('.zoomable').on('mouseout', function(evt)
	{
		var item = $(evt.currentTarget);
		item.stop().animate(
		{
			'width': 	'100%',
			'height': 	'100%',
			'top': 		'0',
			'left': 	'0'
		},
		100);
	});
	
	/**
	 * Tooltips
	 */
	$('*[rel="tooltip"]').on('mouseover', function(evt)
	{
		var target = 	$(evt.currentTarget);
		var tooltip = 	$('.tooltip');
		var position = 	target.data('tooltip');
		tooltip.find('.corner').hide();
		tooltip.find('.corner-' + position).show();
		var left = 	position == 'left' ? target.offset().left + target.width() : target.offset().left + (target.width() / 2) - 20;
		var top = 	position == 'left' ? target.offset().top + (target.height() / 2) - 16 : target.offset().top + target.height() + 22;
        if (target.attr('title') != '')
        {
            target.data('title', target.attr('title'));
            target.attr('title', '');
        }
		tooltip.css(
		{
			'top': 		top + 'px',
			'left': 	left + 'px',
			'opacity': 	0
		}).show().find('.content').html(target.data('title'));
		tooltip.stop().animate((position == 'left' ? {left: '+=10', opacity: 1} : {top: '-=10', opacity: 1}), 200);
	});
	$('*[rel="tooltip"]').on('mouseout', function(evt)
	{
		$('.tooltip').stop().fadeOut(100);
	});

	/**
	 * Company hovers
	 */
    $('.col-3').on('mouseenter', function(evt)
    {
        var speed = 200;
        var amplitude = 20;
        var hover = $(this).find('.hover');
        hover.css(
		{
			'opacity': 	0,
			'top': 		amplitude + '%',
			'left': 	amplitude + '%',
			'width': 	((100 - (amplitude * 2)) + '%'),
			'height': 	((100 - (amplitude * 2)) + '%')
		}).show();
        hover.stop().animate(
		{
			'opacity': 	1,
			'top': 		0,
			'left': 	0,
			'width': 	'100%',
			'height': 	'100%'
		}, speed);
        hover.find('.title, .dates').stop().css({'opacity': 0}).show().delay(speed).animate({'opacity': 1}, speed);
        hover.find('.date-up').stop().css({'marginTop': '-10px', 'opacity': 0}).show().delay(speed).animate({'marginTop': 0, 'opacity': 1}, speed);
        hover.find('.date-down').stop().css({'marginTop': '10px', 'opacity': 0}).show().delay(speed).animate({'marginTop': 0, 'opacity': 1}, speed);
    });
    $('.col-3').on('mouseleave', function(evt)
    {
        var speed = 200;
        var amplitude = 20;
        var hover = $(this).find('.hover');
        hover.stop().animate(
		{
			'opacity': 	0,
			'top': 		amplitude + '%',
			'left': 	amplitude + '%',
			'width': 	((100 - (amplitude * 2)) + '%'),
			'height': 	((100 - (amplitude * 2)) + '%')
		}, speed);
        hover.find('.title, .dates, .date-up, .date-down').hide();
    });

    /**
     * Flickr
     */
    $('.flickr .picture').on('mouseover', function(evt)
    {
        $(this).fadeTo(200, 1);
    });
    $('.flickr .picture').on('mouseout', function(evt)
    {
        $(this).fadeTo(200, 0.7);
    });
    $('.flickr .picture').on('mousemove', function(evt)
    {
        var $current =          $(this);
        var $picture =          $current.find('img');
        var current_offset =    $current.offset();
        var $this_width =       $current.width();
        var $this_height =      $current.height();

        var dest_x = (100 / ($this_width / (evt.pageX - current_offset.left))) * (-($picture.width() - $this_width) / 100);
        var dest_y = (100 / ($this_height / (evt.pageY - current_offset.top))) * (-($picture.height() - $this_height) / 100);

        $picture.css(
        {
            'top':  dest_y + 'px',
            'left': dest_x + 'px'
        });
    });

    /**
     * Form
     */
    $('form').on('submit', function(evt)
    {
        evt.preventDefault();
        var $form = $(this);
        $form.find('input[type="submit"]').hide();
        $form.find('.loader').show();
        $.ajax(
        {
            url:        'index.php',
            type:       'post',
            dataType:   'json',
            data:       $form.serialize(),
            success:    function(answer)
            {
                $form.find('.loader').hide();
                $form.find('input[type="submit"]').show();
                var errors = 0;
                for(var index in answer.errors)
                {
                    $form.find('*[name="' + index + '"]').addClass('required');
                    errors += 1;
                }
                $form.find('.confirmation').html(answer.message).show().delay(5000).fadeOut(500);
                if (errors == 0)
                {
                    $form.find('input[type="text"],textarea').val('');
                }
            }
        });
    });
    $('input,textarea').on('blur', function(evt)
    {
        var $target = $(evt.currentTarget);
        $target.toggleClass('required', $target.val() == '');
    });

});