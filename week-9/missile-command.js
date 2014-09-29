var canvasHelper = {
    /* draws a circle centered at the given coordinates. Defaults to filled, with no stroke. */
    drawCircle: function(ctx, x, y, radius, filled, stroked) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        if (filled || filled === undefined) {
            ctx.fill();
        }
        if (stroked) {
            ctx.stroke();
        }
    }
};

function Bunker(x, y) {
    this.x = x;
    this.y = y;

    this.draw = function(ctx) {
        ctx.fillStyle = "#39AB17";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 50, Math.PI, 2 * Math.PI);
        ctx.fill();
    };
}

function Missile(x, y, speed, destX, destY) {
    this.x = x;
    this.origX = x;
    this.y = y;
    this.origY = y;
    this.speed = speed;
    this.destX = destX;
    this.destY = destY;
    this.missileRadius = 4;

    this.draw = function(ctx) {
        if (this.isExploding()) {
            ctx.fillStyle = "#FFB000";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.explosionRadius, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.fillStyle = "#FF0000";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.missileRadius, 0, 2 * Math.PI);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(this.origX, this.origY);
            ctx.lineTo(this.x, this.y);
            ctx.setLineDash([1, 3]);
            ctx.stroke();
        }
    }
    
    this.move = function() {
        if (this.isExploding()) {
            this.explosionRadius = Math.min(this.explosionRadius + 2, MAX_EXPLOSION_RADIUS);
        } else {
            var xDiff = this.destX - this.origX;
            var yDiff = this.destY - this.origY;
            var angle = Math.atan2(yDiff, xDiff);

            this.x = this.x + speed * Math.cos(angle);
            this.y = this.y + speed * Math.sin(angle);
            var arrived = xDiff < 0 && this.x < this.destX 
                || xDiff > 0 && this.x > this.destX;
            if (arrived) {
                this.triggerExplosion();
            }
        }
    }

    this.isExploding = function() {
        return this.explosionRadius != undefined;
    }

    this.isDead = function() {
        if (this.x < 0 || this.x > WIDTH
                    || this.y < 0 || this.y > FLOOR_Y) {
            return true;
        }
        if (this.explosionRadius == MAX_EXPLOSION_RADIUS) {
            return true;
        }
    }

    this.radius = function() {
        if (this.isExploding()) {
            return this.explosionRadius;
        } else {
            return this.missileRadius;
        }
    }

    this.collidesWith = function(otherX, otherY, otherRadius) {
        var xDiff = Math.pow(this.x - otherX, 2);
        var yDiff = Math.pow(this.y - otherY, 2);
        var dist = Math.sqrt(xDiff + yDiff);
        return dist - otherRadius - this.radius() <= 0;
    }

    this.triggerExplosion = function() {
        if (!this.isExploding()) {
            this.explosionRadius = 0;
        }
    }
}

// config
var WIDTH = 800,
    HEIGHT = 600,
    FLOOR_Y = 550,
    INITIAL_BUNKER_COUNT = 3,
    BUNKER_MARGIN = 50,
    FRIENDLY_MISSILE_SPEED = 5,
    MAX_EXPLOSION_RADIUS = 50,
// handy reference to canvas to draw on
    canvas;

var game = (function() {
    // --- state which needs to be reset ---
    // array of missile objects
    var missiles,
    // bunkers which shoot player missiles
        bunkers;

    return {
        reset: function() {
            var gameContainer = $('#gameContainer').empty()
            canvas = $('<canvas width="' + WIDTH + '" height="' + HEIGHT + '">').css('border', '1px solid black')[0]; 
            gameContainer.append(canvas);

            missiles = [];
            
            bunkers = [];
            for (var i = 0; i < INITIAL_BUNKER_COUNT; i++) {
                var bunkerX = WIDTH * (i + 0.5) / INITIAL_BUNKER_COUNT;
                console.debug(bunkerX);
                bunkers.push(new Bunker(bunkerX, FLOOR_Y));
            }
        },

        render: function() {
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height); 

            // draw ground
            ctx.fillStyle = "#6B521F";
            ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT);

            for (var i = 0; i < bunkers.length; i++) {
                bunkers[i].draw(ctx);
            }

            for (var i = 0; i < missiles.length; i++) {
                missiles[i].draw(ctx);
            }
        },

        update: function() {
            for (var i = 0; i < missiles.length; i++) { 
                missiles[i].move();
            }

            for (var i = 0; i < missiles.length; i++) {
                var missile = missiles[i];
                for (var j = i + 1; j < missiles.length; j++) {
                    var otherMissile = missiles[j];
                    if (missile.collidesWith(otherMissile.x, otherMissile.y, otherMissile.radius())) {
                        missile.triggerExplosion();
                        otherMissile.triggerExplosion();
                    }
                }
                if (missile.isDead()) {
                    missiles.splice(i, 1);
                    i =- 1;
                }
            }
        },

        fireFriendlyMissile: function(destX, destY) {
            console.debug("Should now fire friendly missile at", destX, destY);

            // find the closest bunker
            var closestBunker = this.findClosestBunkerTo(destX);
            console.debug('Firing from', closestBunker);
            var missile = new Missile(closestBunker.x, closestBunker.y, FRIENDLY_MISSILE_SPEED, destX, destY);
            missiles.push(missile);
        },

        findClosestBunkerTo: function(x) {
            var xDiffMin = Number.MAX_VALUE;
            var closestBunker = undefined;
            $.each(bunkers, function(i, bunker) {
                var xDiff = Math.abs(bunker.x - x)
                if (xDiff < xDiffMin) {
                    closestBunker = bunker;
                    xDiffMin = xDiff;
                }
            });
            return closestBunker;
        }
    };
})()

$(function() {
    var accumulatedTime = 0,
        delayBetweenLogicUpdates = 1,
        lastTime;

    game.reset();

    $('#gameContainer').on('click', function(e) {
        var mousePos = getMouseCoordinates(canvas, e);
        game.fireFriendlyMissile(mousePos.x, mousePos.y);
    });

    requestAnimationFrame(function tick(currentTime) {
        if (lastTime) {
            accumulatedTime += currentTime - lastTime;
        }
        if (accumulatedTime > delayBetweenLogicUpdates) {
            game.update();
            accumulatedTime -= delayBetweenLogicUpdates;
        }
        lastTime = currentTime;
        game.render();
        requestAnimationFrame(tick);
    });
});

// wonderfully complex way to get the x/y coords of a click: http://stackoverflow.com/a/5932203
function getMouseCoordinates(canvas, event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = canvas;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return { x: canvasX, y: canvasY }
}