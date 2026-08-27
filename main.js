var image = document.getElementById('puzzleSrc');
var url = image.src;
var puzzleContainer = document.getElementById('puzzleContainer');
var puzzlePieceCount = 100;

var imageWidth = 800;
var imageHeight = 600;

var width = puzzlePieceCount / 10;
var height = puzzlePieceCount / 10;

var puzzlePieces = [];
var puzzlePieceWidth = imageWidth / width;
var puzzlePieceHeight = imageHeight / height;
var tabDepth = Math.min(puzzlePieceWidth, puzzlePieceHeight) * 0.22;

var horizontalEdges = [];
var verticalEdges = [];

for (var edgeY = 0; edgeY <= height; edgeY++) {
    horizontalEdges[edgeY] = [];
    for (var edgeX = 0; edgeX < width; edgeX++) {
        horizontalEdges[edgeY][edgeX] = edgeY === 0 || edgeY === height
            ? 0
            : Math.random() < 0.5 ? -1 : 1;
    }
}

for (var row = 0; row < height; row++) {
    verticalEdges[row] = [];
    for (var column = 0; column <= width; column++) {
        verticalEdges[row][column] = column === 0 || column === width
            ? 0
            : Math.random() < 0.5 ? -1 : 1;
    }
}

function horizontalEdge(start, end, base, bulge) {
    if (bulge === 0) {
        return 'L ' + end + ' ' + base;
    }

    var distance = end - start;
    var first = start + distance * 0.36;
    var last = start + distance * 0.64;
    var middle = (start + end) / 2;
    var tabY = base + bulge * tabDepth;

    return 'L ' + first + ' ' + base +
        ' C ' + (first + distance * 0.1) + ' ' + base + ' ' + (middle - distance * 0.1) + ' ' + tabY + ' ' + middle + ' ' + tabY +
        ' C ' + (middle + distance * 0.1) + ' ' + tabY + ' ' + (last - distance * 0.1) + ' ' + base + ' ' + last + ' ' + base +
        ' L ' + end + ' ' + base;
}

function verticalEdge(start, end, base, bulge) {
    if (bulge === 0) {
        return 'L ' + base + ' ' + end;
    }

    var distance = end - start;
    var first = start + distance * 0.36;
    var last = start + distance * 0.64;
    var middle = (start + end) / 2;
    var tabX = base + bulge * tabDepth;

    return 'L ' + base + ' ' + first +
        ' C ' + base + ' ' + (first + distance * 0.1) + ' ' + tabX + ' ' + (middle - distance * 0.1) + ' ' + tabX + ' ' + middle +
        ' C ' + tabX + ' ' + (middle + distance * 0.1) + ' ' + base + ' ' + (last - distance * 0.1) + ' ' + base + ' ' + last +
        ' L ' + base + ' ' + end;
}

function createPiecePath(x, y) {
    var left = tabDepth;
    var top = tabDepth;
    var right = left + puzzlePieceWidth;
    var bottom = top + puzzlePieceHeight;
    var topEdge = y === 0 ? 0 : horizontalEdges[y][x];
    var rightEdge = x === width - 1 ? 0 : -verticalEdges[y][x + 1];
    var bottomEdge = y === height - 1 ? 0 : -horizontalEdges[y + 1][x];
    var leftEdge = x === 0 ? 0 : verticalEdges[y][x];

    return 'M ' + left + ' ' + top +
        horizontalEdge(left, right, top, -topEdge) +
        verticalEdge(top, bottom, right, rightEdge) +
        horizontalEdge(right, left, bottom, bottomEdge) +
        verticalEdge(bottom, top, left, -leftEdge) + ' Z';
}

function getEdgeSpawnPosition(pieceWidth, pieceHeight) {
    var side = Math.floor(Math.random() * 4);
    var horizontalPosition = Math.random() * (imageWidth - pieceWidth);
    var verticalPosition = Math.random() * (imageHeight - pieceHeight);
    var horizontalOffset = (Math.random() - 0.5) * pieceWidth * 0.5;
    var verticalOffset = (Math.random() - 0.5) * pieceHeight * 0.5;
    var visiblePart = 0.35;

    if (side === 0) {
        return {
            left: Math.max(0, Math.min(imageWidth - pieceWidth, horizontalPosition + horizontalOffset)),
            top: -pieceHeight * (1 - visiblePart) + verticalOffset
        };
    }

    if (side === 1) {
        return {
            left: imageWidth - pieceWidth * visiblePart + horizontalOffset,
            top: Math.max(0, Math.min(imageHeight - pieceHeight, verticalPosition + verticalOffset))
        };
    }

    if (side === 2) {
        return {
            left: Math.max(0, Math.min(imageWidth - pieceWidth, horizontalPosition + horizontalOffset)),
            top: imageHeight - pieceHeight * visiblePart + verticalOffset
        };
    }

    return {
        left: -pieceWidth * (1 - visiblePart) + horizontalOffset,
        top: Math.max(0, Math.min(imageHeight - pieceHeight, verticalPosition + verticalOffset))
    };
}

for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
        var puzzlePiece = new PuzzlePiece(i, j);
        puzzlePieces.push(puzzlePiece);
    }
}

function PuzzlePiece(x, y) {
    this.x = x;
    this.y = y;

    var pieceWidth = puzzlePieceWidth + tabDepth * 2;
    var pieceHeight = puzzlePieceHeight + tabDepth * 2;
    var spawnPosition = getEdgeSpawnPosition(pieceWidth, pieceHeight);

    // create a new div element and put it in #puzzleContainer
    var div = document.createElement('div');
    div.className = 'puzzlePiece';
    div.id = 'puzzlePiece_' + x + '_' + y;
    div.style.width = pieceWidth + 'px';
    div.style.height = pieceHeight + 'px';
    div.style.left = spawnPosition.left + 'px';
    div.style.top = spawnPosition.top + 'px';
    div.style.backgroundImage = 'url(' + url + ')';
    div.style.backgroundPosition = (tabDepth - x * puzzlePieceWidth) + 'px ' + (tabDepth - y * puzzlePieceHeight) + 'px';
    div.style.backgroundSize = imageWidth + 'px ' + imageHeight + 'px';
    div.style.boxSizing = 'border-box';
    div.style.clipPath = 'path("' + createPiecePath(x, y) + '")';
    div.style.cursor = 'grab';
    div.style.zIndex = 1000;
    div.style.setProperty('--piece-rotation', Math.floor(Math.random() * 4) * 90 + 'deg');

    var isDragging = false;
    var offsetX;
    var offsetY;

    div.addEventListener('pointerdown', function(event) {
        if (event.button !== 0) {
            return;
        }

        var containerBounds = puzzleContainer.getBoundingClientRect();
        isDragging = true;
        offsetX = event.clientX - containerBounds.left - div.offsetLeft;
        offsetY = event.clientY - containerBounds.top - div.offsetTop;
        div.style.zIndex = 1001;
        div.style.cursor = 'grabbing';
        div.classList.add('is-grabbed');
        div.setPointerCapture(event.pointerId);
        event.preventDefault();

        div._containerBounds = containerBounds;
    });

    div.addEventListener('pointermove', function(event) {
        if (!isDragging) {
            return;
        }

        var containerBounds = div._containerBounds;
        div.style.left = event.clientX - containerBounds.left - offsetX + 'px';
        div.style.top = event.clientY - containerBounds.top - offsetY + 'px';
    });

    div.addEventListener('pointerup', function(event) {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        div.style.zIndex = 1000;
        div.style.cursor = 'grab';
        div.classList.remove('is-grabbed');
        div.releasePointerCapture(event.pointerId);
    });

    div.addEventListener('pointercancel', function(event) {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        div.style.zIndex = 1000;
        div.style.cursor = 'grab';
        div.classList.remove('is-grabbed');
        div.releasePointerCapture(event.pointerId);
    });

    // rotate the piece by 90 degrees when right clicked
    div.oncontextmenu = function() {
        console.log('right clicked');
        var rotation = parseInt(div.style.getPropertyValue('--piece-rotation'), 10);
        rotation += 90;
        div.style.setProperty('--piece-rotation', rotation + 'deg');
        return false;
    };

    puzzleContainer.appendChild(div);
}
