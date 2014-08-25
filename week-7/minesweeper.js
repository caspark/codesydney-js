var debugMode = true;
$(function() {
    var status = $('#status'),
        board = $('#board'),
        BOARD_WIDTH = 10, // in cells (also expected by css)
        BOARD_HEIGHT = 10, // in cells
        TARGET_MINE_COUNT = 2, // can be tweaked
        mines = [], // value = position on board
        revealed = [], // value = position on board
        flagged = []; // value = position on board

    function randomCellExceptNot(excludeCell) {
        var candidate;
        do {
            candidate = Math.floor(Math.random() * BOARD_WIDTH * BOARD_HEIGHT);
        } while (candidate == excludeCell);
        return candidate;
    }

    function revealCell(cellNum) {
        // spawn mines if there are no mines
        if (mines.length == 0) {
            while (mines.length < TARGET_MINE_COUNT) {
                mines.push(randomCellExceptNot(cellNum));
            }
            console.debug('Generated mines of', mines);
        }

        //TODO display mines that are nearby
        revealed.push(cellNum);
        console.debug('Revealed cell', cellNum);
    }

    function flagCell(cellNum) {
        if (revealed.indexOf(cellNum) != -1) {
            console.debug('Not flagging cell', cellNum, 'because already revealed');
            return false;
        }

        var alreadyFlaggedIndex = flagged.indexOf(cellNum);
        if (alreadyFlaggedIndex == -1) {
            flagged.push(cellNum);
            console.debug('Flagged cell', cellNum);
        } else {
            flagged.splice(alreadyFlaggedIndex, 1);
            console.debug('Unflagged cell', cellNum);
        }
    }

    function isGameLost() {
        for (var i = 0; i < mines.length; i++) {
            if (revealed.indexOf(mines[i]) != -1) {
                console.debug('Game lost because hit the mine at', mines[i]);
                return true;
            }
        }
        return false;
    }

    function isGameWon() {
        if (mines.length == 0) {
            console.debug('Game not won because there are no mines');
            return false;
        }

        for (var i = 0; i < mines.length; i++) {
            if (flagged.indexOf(mines[i]) == -1) {
                console.debug('Game not won because unflagged mine is at', mines[i]);
                return false;
            }
        }
        return true;
    }

    function isValidNeighbor(candidateNeighbor, originalCell) {
        //TODO
    }

    function countMinesAroundCell(cellNum) {
        var mineCount = 0;
        for (var candidate = 0; candidate < BOARD_WIDTH * BOARD_HEIGHT; candidate++) {
            if (candidate == cellNum || isValidNeighbor(candidate, cellNum)) {
                if (mines.indexOf(candidate) != -1) {
                    mineCount += 1;
                }
            }
        }
        return mineCount;
    }

    function render() {
        var boardChildren = board.children(),
            gameIsLost = isGameLost();
        boardChildren.text('').removeClass();
        for (var cellNum = 0; cellNum < BOARD_WIDTH * BOARD_HEIGHT; cellNum++) {
            var cell = $(boardChildren.get(cellNum));
            if (flagged.indexOf(cellNum) != -1) {
                cell.addClass('flagged');
            } else if (revealed.indexOf(cellNum) != -1) {
                cell.addClass('revealed');
            }
            //TODO display near by mines
            if ((gameIsLost || debugMode) && mines.indexOf(cellNum) != -1) {
                cell.text('*');
            }
        }

        if (isGameWon()) {
            status.text('Success! You found ' + mines.length + ' mines.');
        } else if (gameIsLost) {
            status.text('BOOM! You are dead.');
        }
    }

    (function() {
        for (var i = 0; i < BOARD_WIDTH * BOARD_HEIGHT; i++) {
            board.append($('<div>'));
        }

        board.on('click contextmenu', function(e) {
            var clicked = e.target,
                rightClick = e.which === 3;
            if (isGameWon() || isGameLost()) {
                console.debug('Game is won or lost, ignoring event', e);
                return;
            }
            board.children().each(function(cellNum, cellElem) {
                if (clicked == cellElem) {
                    if (rightClick) {
                        flagCell(cellNum);
                    } else {
                        revealCell(cellNum);
                    }
                    render();
                }
            });
            if (rightClick) {
                e.preventDefault();
            }
        });
    })();
})
