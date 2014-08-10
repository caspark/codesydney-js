// handy controls for debugging
var c = {}

$(function() {
    $('.carousel').each(function(i, carousel) {
        carousel = $(carousel)
        var slides = carousel.children('.slide')

        var width = 0
        var height = 0
        var current = 0
        var count = slides.length
        var animating = false

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

        /** If newFromRight is true: old slide is leaving left, new slide is coming from right */
        var switchToSlide = function(num, old, newFromRight) {
            if (animating) {
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

        c.showNext = showNext
        c.showPrev = showPrev
    })
})
