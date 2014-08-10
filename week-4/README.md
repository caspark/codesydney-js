Carousel
========

This is a very basic implementation of a carousel (aka image slider) written with basic JQuery only.

Implementation notes:

* Width of the whole carousel (and each slide in it) is set to the width of the biggest slide. Hence, content of slides should either support being upsized or all be the same size.
* Supports text, images, whatever in the slides. Just be aware that the slides will be positioned using absolute positioning.
* Transitions using a slide effect. Wrap around is handled correctly; clicking to see the next slide when on the last slide will slide the first slide in from the right (and similar for viewing the previous slide when on the first slide).
* Transitions to the next slide every 2 seconds. This counter is reset whenever you manually move between slides, to avoid the annoying behaviour of switching to the next slide when the current slide has only just been transitioned to.
* Trying to transition to a slide if a transition is already in progress will do nothing, to prevent many slides appearing at once / a queue of transition animations building up.
* Slider controls are buttons, so can be tabbed to and would have some basic amount of accessibility (though I didn't go ahead and add alt-text and such).
