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

        var nextButton = $('<input type="button">').addClass('carousel-next').text('Next')
        console.log(nextButton)
        carousel.prepend(nextButton)
        var prevButton = $('<input type="button">').addClass('carousel-prev').text('Prev')
        carousel.append(prevButton)

        console.log('locked width & height:', width, height)

        var showSlide = function(num, old) {
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
                current = slides - current
            }
            showSlide(current, prev)
        }

        c.showNext = showNext
        c.showPrev = showPrev
    })
})
