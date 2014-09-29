// config
var WIDTH = 800,
    HEIGHT = 600,
    FLOOR_Y = 550,
    INITIAL_BUNKER_COUNT = 3,
    BUNKER_MARGIN = 50,
    BUNKER_RADIUS = 50,
    FRIENDLY_MISSILE_SPEED = 10,
    ENEMY_MISSILE_SPEED = 2,
    ENEMY_MISSILE_STARTING_DELAY = 250,
    MAX_EXPLOSION_RADIUS = 50,
// handy reference to canvas to draw on
    canvas;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function Bunker(x, y) {
    this.x = x;
    this.y = y;

    this.draw = function(ctx) {
        ctx.fillStyle = "#39AB17";
        ctx.beginPath();
        ctx.arc(this.x, this.y, BUNKER_RADIUS, Math.PI, 2 * Math.PI);
        ctx.fill();
    };

    this.radius = function() {
        return BUNKER_RADIUS;
    }
}

function Missile(x, y, friendly, destX, destY) {
    this.x = x;
    this.origX = x;
    this.y = y;
    this.origY = y;
    this.friendly = friendly;
    this.speed = friendly ? FRIENDLY_MISSILE_SPEED : ENEMY_MISSILE_SPEED;
    this.destX = destX;
    this.destY = destY;
    this.missileRadius = 4;

    this.draw = function(ctx) {
        if (this.isExploding()) {
            ctx.fillStyle = '#FFB000';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.explosionRadius, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.fillStyle = friendly ? '#316EC1' : '#FF0000';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.missileRadius, 0, 2 * Math.PI);
            ctx.fill();

            ctx.strokeStyle = ctx.fillStyle;
            ctx.beginPath();
            ctx.moveTo(this.origX, this.origY);
            ctx.lineTo(this.x, this.y);
            ctx.setLineDash([1, 3]);
            ctx.stroke();
        }
    }
    
    this.move = function() {
        if (this.isExploding()) {
            this.explosionRadius = Math.min(this.explosionRadius + .5, MAX_EXPLOSION_RADIUS);
        } else {
            var xDiff = this.destX - this.origX;
            var yDiff = this.destY - this.origY;
            var angle = Math.atan2(yDiff, xDiff);

            this.x = this.x + this.speed * Math.cos(angle);
            this.y = this.y + this.speed * Math.sin(angle);
            var arrived = xDiff < 0 && this.x < this.destX 
                || xDiff > 0 && this.x > this.destX;
            if (arrived || this.y > FLOOR_Y) {
                this.triggerExplosion();
            }
            if (this.y > FLOOR_Y) {
                this.y = FLOOR_Y;
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
            this.explosionRadius = this.missileRadius;
        }
    }
}


var game = (function() {
    // --- state which needs to be reset ---
    var enemyMissileNextDelay, // # updates required before firing next missile
        updatesSinceLastMissile, // # updates since last missile fired
    // array of missile objects
        missiles,
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

            enemyMissileNextDelay = ENEMY_MISSILE_STARTING_DELAY;
            updatesSinceLastMissile = 0;
        },

        render: function() {
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height); 

            for (var i = 0; i < bunkers.length; i++) {
                bunkers[i].draw(ctx);
            }

            for (var i = 0; i < missiles.length; i++) {
                missiles[i].draw(ctx);
            }

            // draw ground last so it covers any explosions
            ctx.fillStyle = "#6B521F";
            ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT);

            if (bunkers.length == 0) {
                ctx.fillStyle = "#0000ff";
                ctx.font = '100pt Serif';
                ctx.textAlign = 'center';
                ctx.fillText('You lose!', WIDTH / 2, HEIGHT / 2 + 25);
            }
        },

        update: function() {
            if (bunkers.length == 0) {
                return;
            }

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

                for (var j = 0; j < bunkers.length; j++) {
                    var bunker = bunkers[j];
                    if ((!missile.friendly || missile.isExploding()) && missile.collidesWith(bunker.x, bunker.y, bunker.radius())) {
                        missile.triggerExplosion();
                        bunkers.splice(j, 1);
                        j =- 1;
                    }
                }

                if (missile.isDead()) {
                    missiles.splice(i, 1);
                    i =- 1;
                }
            }

            if (missiles.length == 0 || updatesSinceLastMissile >= enemyMissileNextDelay) {
                this.fireEnemyMissile();
                updatesSinceLastMissile = 0;
                enemyMissileNextDelay = enemyMissileNextDelay * 0.9
            } else {
                updatesSinceLastMissile += 1;
            }
        },

        fireFriendlyMissile: function(destX, destY) {
            console.debug('Should now fire friendly missile at', destX, destY);

            // find the closest bunker
            var closestBunker = this.findClosestBunkerTo(destX);
            console.debug('Firing from', closestBunker);
            var missile = new Missile(closestBunker.x, closestBunker.y, true, destX, destY);
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
        },

        fireEnemyMissile: function(destX, destY) {
            if (bunkers.length == 0) {
                return;
            }
            var targetBunker = bunkers[getRandomInt(0, bunkers.length)];
            var originX = getRandomInt(0, WIDTH);
            console.debug('Firing enemy missile at bunker', targetBunker, 'from', originX);

            var missile = new Missile(originX, 0, false, targetBunker.x, targetBunker.y);
            missiles.push(missile);
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
function getMouseCoordinates(canvas, event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = canvas;

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return { x: canvasX, y: canvasY };
}