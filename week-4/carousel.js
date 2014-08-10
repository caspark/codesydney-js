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

        slides.each(function(i, slide) {
            slide = $(slide)
            width = Math.max(slide.width(), width)
            height = Math.max(slide.height(), height)
            if (i != 0) {
                slide.addClass('hidden')
            }
        })

        slides.each(function(i, slide) {
            slide = $(slide)
            slide.width(width)
            slide.height(height)
        })

        var prevButton = $('<input type="button">')
            .addClass('carousel-prev')
            .attr('value', 'Prev')
            .click(function() {
                showPrev()
            })
        carousel.prepend(prevButton)
        prevButton.css('top', height / 2 + prevButton.height() / 2)
        var nextButton = $('<input type="button">')
            .addClass('carousel-next')
            .attr('value', 'Next')
            .click(function(e) {
                showNext()
            })
        carousel.append(nextButton)
        nextButton.css('top', height / 2 + nextButton.height() / 2)

        console.log('locked width & height:', width, height)

        var showSlide = function(num, old) {
            console.debug('Going from', old, 'to', num)
            var newSlide = $(slides.get(num))
            var oldSlide = $(slides.get(old))
            oldSlide.hide()
            newSlide.show()
        }
        
        var showNext = function() {
            var prev = current
            current = (current + 1) % slides.length
            showSlide(current, prev)
        }

        var showPrev = function() {
            var prev = current
            current = current - 1
            if (current < 0) {
                current = slides.length - 1 + current
            }
            showSlide(current, prev)
        }

        c.showNext = showNext
        c.showPrev = showPrev
    })
})
