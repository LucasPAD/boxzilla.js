var duration = 320;

function css(element, styles) {
    for(var property in styles) {
        element.style[property] = styles[property];
    }
}

function initObjectProperties(properties, value) {
    var newObject = {};
    for(var i=0; i<properties.length; i++) {
        newObject[properties[i]] = value;
    }
    return newObject;
}

function copyObjectProperties(properties, object) {
    var newObject = {}
    for(var i=0; i<properties.length; i++) {
        newObject[properties[i]] = object[properties[i]];
    }
    return newObject;
}

/**
 * Checks if the given element is currently being animated.
 *
 * @param element
 * @returns {boolean}
 */
function animated(element) {
    return !! element.getAttribute('data-animated');
}

/**
 * Toggles the element using the given animation.
 *
 * @param element
 * @param animation Either "fade" or "slide"
 */
function toggle(element, animation) {
    var nowVisible = element.style.display != 'none' || element.offsetLeft > 0;

    // create clone for reference
    var clone = element.cloneNode(true);

    // store attribute so everyone knows we're animating this element
    element.setAttribute('data-animated', "true");

    // toggle element visiblity right away if we're making something visible
    if( ! nowVisible ) {
        element.style.display = '';
    }

    var hiddenStyles, visibleStyles;

    // animate properties
    if( animation === 'slide' ) {
        hiddenStyles = initObjectProperties(["height", "borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"], 0);
        visibleStyles = {};

        if( ! nowVisible ) {
            var computedStyles = window.getComputedStyle(element);
            visibleStyles = copyObjectProperties(["height", "borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"], computedStyles);
            css(element, hiddenStyles);
        }

        // don't show a scrollbar during animation
        element.style.overflowY = 'hidden';
        animate(element, nowVisible ? hiddenStyles : visibleStyles);
    } else {
        hiddenStyles = { opacity: 0 };
        visibleStyles = { opacity: 1 };
        if( ! nowVisible ) {
            css(element, hiddenStyles);
        }

        animate(element, nowVisible ? hiddenStyles : visibleStyles);
    }

    // clean-up after animation
    window.setTimeout(function() {
        element.removeAttribute('data-animated');
        element.setAttribute('style', clone.getAttribute('style'));
        element.style.display = nowVisible ? 'none' : '';
    }, duration * 1.2);
}

function animate(element, targetStyles) {
    var last = +new Date();
    var initialStyles = window.getComputedStyle(element);
    var currentStyles = {};
    var propSteps = {};

    for(var property in targetStyles) {
        // make sure we have an object filled with floats
        targetStyles[property] = parseFloat(targetStyles[property]);

        // calculate step size & current value
        var to = targetStyles[property];
        var current = parseFloat(initialStyles[property]);
        propSteps[property] = ( to - current ) / duration; // points per second
        currentStyles[property] = current;
    }

    var tick = function() {
        var now = +new Date();
        var timeSinceLastTick = now - last;
        var done = true;

        var step, to, increment, newValue;
        for(var property in targetStyles ) {
            step = propSteps[property];
            to = targetStyles[property];
            increment =  step * timeSinceLastTick;
            newValue = currentStyles[property] + increment;

            if( step > 0 && newValue >= to || step < 0 && newValue <= to ) {
                newValue = to;
            } else {
                done = false;
            }

            // store new value
            currentStyles[property] = newValue;

            var suffix = property !== "opacity" ? "px" : "";
            element.style[property] = newValue + suffix;
        }

        last = +new Date();

        // keep going until we're done for all props
        if(!done) {
            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 32);
        }
    };

    tick();
}


module.exports = {
    'toggle': toggle,
    'animated': animated
}