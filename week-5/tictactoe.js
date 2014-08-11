$(function() {
    var status = $('#status'),
        board = $('#board'),
        moves = [], // index = move number, value = position
        winConditions = [ // positions which constitute a win if the same player occupies all slots
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

    function playerFromMove(moveNum) {
        return moveNum % 2 == 0 ? 'X' : 'O';
    }

    function playerFromPos(position) {
        var moveNum = moves.indexOf(position);
        if (moveNum != -1) {
            return playerFromMove(moveNum);
        }
    }

    function findCommonPlayer(pos1, pos2, pos3) {
        var playerFromPos1 = playerFromPos(pos1);
        if (playerFromPos1 == playerFromPos(pos2) && playerFromPos1 == playerFromPos(pos3)) {
            return playerFromPos1;
        }
    }

    function calculateWinner() {
        for (var i = 0; i < winConditions.length; i++) {
            var winner = findCommonPlayer.apply(this, winConditions[i]);
            if (winner) {
                return winner;
            }
        }
    }

    function update() {
        var boardChildren = board.children();
        boardChildren.text('');
        $.each(moves, function(moveNum, movePos) {
            $(boardChildren.get(movePos)).text(playerFromMove(moveNum));
        })

        var winner = calculateWinner();
        console.debug('Current winner', winner);
        if (winner) {
            status.text(winner + ' is the winner!');
        }
    }
    
    (function() {
        for (var i = 1; i <= 9; i++) {
            board.append($('<div>'));
        }
        board.click(function(e) {
            if (calculateWinner()) {
                return
            }
            var clicked = e.target;
            board.children().each(function(i, squareElem) {
                if (clicked == squareElem) {
                    moves.push(i);
                    update();
                }
            });
        });
    })();
})
