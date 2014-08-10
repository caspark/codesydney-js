$(function() {
    $('.carousel').each(function(i, carousel) {
        carousel = $(carousel)
        var slides = carousel.children('.slide')

        var width = 0
        var height = 0
        var current = 0
        var count = slides.length
        var animating = false
        var scheduleIntervalHandle = undefined

        slides.each(function(i, slide) {
            slide = $(slide)
            width = Math.max(slide.width(), width)
            height = Math.max(slide.height(), height)
            if (i != 0) {
                slide.hide()
            }
        })

        slides.each(function(i, slide) {
            slide = $(slide)
            slide.width(width)
            slide.height(height)
            slide.css({
                position: 'absolute',
                left: '0px'
            })

            // add a jump button for this slide
            var jumpWidth = 30
            var jumpHeight = jumpWidth // circular
            var jumpMargin = 10
            var jumpButton = $('<input type="button">')
                .addClass('carousel-jump carousel-button')
                .attr('value', i + 1)
                .width(jumpWidth)
                .height(jumpHeight)
                .css({
                    left: width / 2 - jumpWidth * slides.length + i * (jumpWidth + jumpMargin),
                    'top': height - jumpHeight - jumpMargin
                })
                .click(function (e) {
                    switchToSlide(i, current, current < i)
                })
                .insertAfter(slide)
        })
        carousel.height(height)
        carousel.width(width)
        console.log('locked width & height:', width, height)

        var prevButton = $('<input type="button">')
            .addClass('carousel-prev carousel-button')
            .attr('value', '<')
            .click(function() {
                showPrev()
            })
        carousel.prepend(prevButton)
        prevButton.css('top', height / 2 + prevButton.height() / 2)
        var nextButton = $('<input type="button">')
            .addClass('carousel-next carousel-button')
            .attr('value', '>')
            .click(function(e) {
                showNext()
            })
        carousel.append(nextButton)
        nextButton.css('top', height / 2 + nextButton.height() / 2)

        $('.carousel-button').each(function (i, e) {
            var button = $(e)
            button.width(button.height())
        })

        var updateJumpButtons = function() {
            var jumpButtons = $('.carousel-jump')
            jumpButtons.removeClass('carousel-jump-current')
            $(jumpButtons.get(current)).addClass('carousel-jump-current')
        }
        updateJumpButtons()

        /** If newFromRight is true: old slide is leaving left, new slide is coming from right */
        var switchToSlide = function(num, old, newFromRight) {
            if (num == old) {
                console.debug('Not transitioning because already on', num)
                return
            } else if (animating) {
                console.debug('Not transitioning', old, '->', num, 'because transition is in progress')
                return
            }
            console.debug('Transitioning', old, '->', num)
            var newSlide = $(slides.get(num))
            var oldSlide = $(slides.get(old))

            var onLeft = -width + 'px'
            var onCenter = '0px'
            var onRight = width + 'px'

            animating = true
            newSlide.css({
                left: newFromRight ? onRight : onLeft
            })
            newSlide.show()
            oldSlide.css({
                left: '0px'
            })
            newSlide.animate({
                left: '0px'
            })
            oldSlide.animate({
                left: newFromRight ? onLeft : onRight
            },
            {
                complete: function() {
                    oldSlide.hide()
                    current = num
                    updateJumpButtons()
                    scheduleShowNext() // make sure we don't switch straight after finishing
                    animating = false
                }
            })
        }
        
        var showNext = function() {
            var prev = current
            var newCurrent = (current + 1) % slides.length
            switchToSlide(newCurrent, prev, true)
        }

        var showPrev = function() {
            var prev = current
            var newCurrent = current - 1
            if (newCurrent < 0) {
                newCurrent = slides.length + newCurrent
            }
            switchToSlide(newCurrent, prev, false)
        }

        var scheduleShowNext = function() {
            if (scheduleIntervalHandle != undefined) {
                clearInterval(scheduleIntervalHandle)
            }
            scheduleIntervalHandle = setInterval(showNext, 2000)
        }
        scheduleShowNext()
    })
})
