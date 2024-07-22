const chessboard = document.getElementById('chessboard');
const whiteTimeDisplay = document.getElementById('white-time');
const blackTimeDisplay = document.getElementById('black-time');
const winnerDisplay = document.getElementById('winner');

const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const pieces = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

let selectedPiece = null;
let selectedSquare = null;
let currentPlayer = 'white';
let whiteTime = 300; // 5 minutes in seconds
let blackTime = 300; // 5 minutes in seconds
let timer;

function createBoard() {
    chessboard.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((i + j) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = i;
            square.dataset.col = j;
            if (initialBoard[i][j]) {
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.textContent = pieces[initialBoard[i][j]];
                piece.dataset.piece = initialBoard[i][j];
                square.appendChild(piece);
            }
            square.addEventListener('click', onSquareClick);
            chessboard.appendChild(square);
        }
    }
    startTimer();
}

function onSquareClick(event) {
    const square = event.currentTarget;
    const piece = square.querySelector('.piece');

    if (selectedPiece) {
        const targetPiece = piece ? piece.dataset.piece : null;
        if (isValidMove(selectedSquare, square, selectedPiece.dataset.piece, targetPiece)) {
            if (piece) {
                piece.remove(); // Capture logic
            }
            square.appendChild(selectedPiece);
            if (isCheckmate()) {
                winnerDisplay.textContent = `${currentPlayer === 'white' ? 'Black' : 'White'} wins by checkmate!`;
                stopTimer();
            } else {
                switchPlayer();
            }
        } else {
            alert("Invalid move!"); // Feedback for invalid moves
        }
        selectedPiece = null;
        selectedSquare = null;
    } else if (piece && isCurrentPlayerPiece(piece)) {
        selectedPiece = piece;
        selectedSquare = square;
    }
}

function isValidMove(fromSquare, toSquare, piece, targetPiece) {
    const fromRow = parseInt(fromSquare.dataset.row);
    const fromCol = parseInt(fromSquare.dataset.col);
    const toRow = parseInt(toSquare.dataset.row);
    const toCol = parseInt(toSquare.dataset.col);

    switch (piece.toLowerCase()) {
        case 'p':
            return isValidPawnMove(fromRow, fromCol, toRow, toCol, piece, targetPiece);
        case 'r':
            return isValidRookMove(fromRow, fromCol, toRow, toCol);
        case 'n':
            return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        case 'b':
            return isValidBishopMove(fromRow, fromCol, toRow, toCol);
        case 'q':
            return isValidQueenMove(fromRow, fromCol, toRow, toCol);
        case 'k':
            return isValidKingMove(fromRow, fromCol, toRow, toCol);
    }

    return false;
}

function isValidPawnMove(fromRow, fromCol, toRow, toCol, piece, targetPiece) {
    const direction = piece === 'P' ? -1 : 1;
    const startRow = piece === 'P' ? 6 : 1;

    if (fromCol === toCol && !targetPiece) {
        if (fromRow + direction === toRow) return true;
        if (fromRow === startRow && fromRow + 2 * direction === toRow && !document.querySelector(`.square[data-row="${fromRow + direction}"][data-col="${fromCol}"] .piece`)) return true;
    }
    if (Math.abs(fromCol - toCol) === 1 && fromRow + direction === toRow && targetPiece) {
        return true; // Capturing move
    }
    return false;
}

function isValidRookMove(fromRow, fromCol, toRow, toCol) {
    return (fromRow === toRow || fromCol === toCol) && isPathClear(fromRow, fromCol, toRow, toCol);
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    return (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) || (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2);
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    return Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol) && isPathClear(fromRow, fromCol, toRow, toCol);
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return (fromRow === toRow || fromCol === toCol || Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) && isPathClear(fromRow, fromCol, toRow, toCol);
}

function isValidKingMove(fromRow, fromCol, toRow, toCol) {
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let r = fromRow + rowStep;
    let c = fromCol + colStep;

    while (r !== toRow || c !== toCol) {
        if (document.querySelector(`.square[data-row="${r}"][data-col="${c}"] .piece`)) {
            return false;
        }
        r += rowStep;
        c += colStep;
    }
    return true;
}

function isCurrentPlayerPiece(piece) {
    return (currentPlayer === 'white' && piece.dataset.piece === piece.dataset.piece.toUpperCase()) ||
           (currentPlayer === 'black' && piece.dataset.piece === piece.dataset.piece.toLowerCase());
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateTimerDisplay();
}

function isCheckmate() {
    // Simplified checkmate detection for this example.
    // Full implementation should include comprehensive checks.
    // For now, checkmate is determined if the current player cannot make a valid move.
    const kingPiece = currentPlayer === 'white' ? 'K' : 'k';
    const kingSquare = Array.from(document.querySelectorAll('.square')).find(square => {
        const piece = square.querySelector('.piece');
        return piece && piece.dataset.piece === kingPiece;
    });

    return !kingSquare || !Array.from(document.querySelectorAll('.square')).some(toSquare => {
        return isValidMove(kingSquare, toSquare, kingPiece, toSquare.querySelector('.piece') ? toSquare.querySelector('.piece').dataset.piece : null);
    });
}

function startTimer() {
    timer = setInterval(() => {
        if (currentPlayer === 'white') {
            whiteTime--;
        } else {
            blackTime--;
        }
        updateTimerDisplay();
        checkForTimeout();
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function updateTimerDisplay() {
    whiteTimeDisplay.textContent = formatTime(whiteTime);
    blackTimeDisplay.textContent = formatTime(blackTime);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function checkForTimeout() {
    if (whiteTime <= 0) {
        winnerDisplay.textContent = 'Black wins by timeout!';
        stopTimer();
    } else if (blackTime <= 0) {
        winnerDisplay.textContent = 'White wins by timeout!';
        stopTimer();
    }
}

createBoard();
