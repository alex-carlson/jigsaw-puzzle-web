var image = document.getElementById('puzzleSrc');
var imagePreview = document.getElementById('imagePreviewSource');
var url = 'https://picsum.photos/800/600?random=' + Date.now() + Math.random();
image.src = url;
imagePreview.src = url;
var puzzleContainer = document.getElementById('puzzleContainer');
var puzzleBoard = document.querySelector('.wrapper');
var pieceCountMenu = document.getElementById('pieceCount');
var imageUpload = document.getElementById('imageUpload');
var newGameButton = document.getElementById('newGame');
var recenterViewButton = document.getElementById('recenterView');
var zoomInButton = document.getElementById('zoomIn');
var zoomOutButton = document.getElementById('zoomOut');
var world = document.getElementById('world');
var puzzlePieceCount;
var zoomLevel = 1;

var imageWidth = 800;
var imageHeight = 600;

function setZoom(nextZoom) {
    zoomLevel = Math.max(0.5, Math.min(2, nextZoom));
    world.style.transform = 'scale(' + zoomLevel + ')';
    recenterView();
}

var width;
var height;

var puzzlePieces = [];
var puzzlePieceWidth;
var puzzlePieceHeight;
var tabDepth;

var horizontalEdges;
var verticalEdges;

function updateBoardSize() {
    imageWidth = puzzleBoard.clientWidth;
    imageHeight = imageWidth * 0.75;
    puzzleContainer.style.width = imageWidth + 'px';
    puzzleContainer.style.height = imageHeight + 'px';
}

function createEdgeMap() {
    horizontalEdges = [];
    verticalEdges = [];

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
    var horizontalPosition = Math.random() * (imageWidth + pieceWidth * 2) - pieceWidth;
    var verticalPosition = Math.random() * (imageHeight + pieceHeight * 2) - pieceHeight;
    var horizontalOffset = (Math.random() - 0.5) * pieceWidth * 1.5;
    var verticalOffset = (Math.random() - 0.5) * pieceHeight * 1.5;
    var visiblePart = -0.35;

    if (side === 0) {
        return {
            left: horizontalPosition + horizontalOffset,
            top: -pieceHeight * (1 - visiblePart) + verticalOffset
        };
    }

    if (side === 1) {
        return {
            left: imageWidth - pieceWidth * visiblePart + horizontalOffset,
            top: verticalPosition + verticalOffset
        };
    }

    if (side === 2) {
        return {
            left: horizontalPosition + horizontalOffset,
            top: imageHeight - pieceHeight * visiblePart + verticalOffset
        };
    }

    return {
        left: -pieceWidth * (1 - visiblePart) + horizontalOffset,
        top: verticalPosition + verticalOffset
    };
}

function createPuzzle(pieceCount, columns) {
    updateBoardSize();
    puzzlePieceCount = pieceCount;
    width = columns;
    height = pieceCount / width;
    puzzlePieceWidth = imageWidth / width;
    puzzlePieceHeight = imageHeight / height;
    tabDepth = Math.min(puzzlePieceWidth, puzzlePieceHeight) * 0.22;
    puzzlePieces = [];
    puzzleContainer.replaceChildren();
    createEdgeMap();

    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            var puzzlePiece = new PuzzlePiece(i, j);
            puzzlePieces.push(puzzlePiece);
        }
    }
}

function resetPuzzle() {
    puzzlePieces.forEach(function (piece) {
        var div = document.getElementById('puzzlePiece_' + piece.x + '_' + piece.y);
        div.style.left = div._spawnLeft + 'px';
        div.style.top = div._spawnTop + 'px';
        div.style.setProperty('--piece-rotation', div._spawnRotation + 'deg');
        div.style.zIndex = 1000;
        div.classList.remove('is-grabbed', 'is-locked');
        div.classList.toggle('is-flipped', div._spawnFlipped);
        div._hasRotated = false;
        div._revealedOnce = !div._spawnFlipped;
    });
}

function startNewGame() {
    if (url.indexOf('blob:') === 0) {
        URL.revokeObjectURL(url);
    }

    url = 'https://picsum.photos/800/600?random=' + Date.now() + Math.random();
    image.src = url;
    imagePreview.src = url;
    var selectedOption = pieceCountMenu.options[pieceCountMenu.selectedIndex];
    createPuzzle(Number(pieceCountMenu.value), Number(selectedOption.dataset.columns));
}

pieceCountMenu.addEventListener('change', function () {
    var selectedOption = pieceCountMenu.options[pieceCountMenu.selectedIndex];
    createPuzzle(Number(pieceCountMenu.value), Number(selectedOption.dataset.columns));
});

imageUpload.addEventListener('change', function () {
    var uploadedFile = imageUpload.files[0];

    if (!uploadedFile) {
        return;
    }

    url = URL.createObjectURL(uploadedFile);
    image.src = url;
    imagePreview.src = url;
    var selectedOption = pieceCountMenu.options[pieceCountMenu.selectedIndex];
    createPuzzle(Number(pieceCountMenu.value), Number(selectedOption.dataset.columns));
});

newGameButton.addEventListener('click', startNewGame);

var initialOption = pieceCountMenu.options[pieceCountMenu.selectedIndex];
createPuzzle(Number(pieceCountMenu.value), Number(initialOption.dataset.columns));

var resizeTimer;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        var selectedOption = pieceCountMenu.options[pieceCountMenu.selectedIndex];
        createPuzzle(Number(pieceCountMenu.value), Number(selectedOption.dataset.columns));
    }, 150);
});

var panState = {
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0
};

function recenterView() {
    var centerX = Math.max(0, (document.documentElement.scrollWidth - window.innerWidth) / 2);
    var centerY = Math.max(0, (document.documentElement.scrollHeight - window.innerHeight) / 2);
    window.scrollTo({
        left: centerX,
        top: centerY,
        behavior: 'auto'
    });
}

window.addEventListener('load', function () {
    recenterView();
});

function isBackgroundDragTarget(target) {
    if (!target || target === document.body || target === document.documentElement || target === world || target === document.getElementById('viewport') || target === puzzleBoard || target === puzzleContainer) {
        return true;
    }

    return !target.closest('.taskBar, .puzzlePiece, .imageMenu, .imageMenuPanel, button, select, input, summary, aside');
}

function stopBackgroundDrag() {
    panState.active = false;
    document.body.style.cursor = '';
    document.body.classList.remove('is-dragging-background');
}

document.addEventListener('pointerdown', function (event) {
    if (!isBackgroundDragTarget(event.target)) {
        return;
    }

    panState.active = true;
    panState.startX = event.clientX;
    panState.startY = event.clientY;
    panState.scrollLeft = window.scrollX;
    panState.scrollTop = window.scrollY;
    document.body.style.cursor = 'grabbing';
    document.body.classList.add('is-dragging-background');
    event.preventDefault();
});

document.addEventListener('pointermove', function (event) {
    if (!panState.active) {
        return;
    }

    var dx = event.clientX - panState.startX;
    var dy = event.clientY - panState.startY;
    window.scrollTo({
        left: panState.scrollLeft - dx,
        top: panState.scrollTop - dy,
        behavior: 'auto'
    });
});

document.addEventListener('pointerup', stopBackgroundDrag);
document.addEventListener('pointercancel', stopBackgroundDrag);
recenterViewButton.addEventListener('click', recenterView);
zoomInButton.addEventListener('click', function () {
    setZoom(zoomLevel + 0.25);
});
zoomOutButton.addEventListener('click', function () {
    setZoom(zoomLevel - 0.25);
});

function PuzzlePiece(x, y) {
    this.x = x;
    this.y = y;

    var pieceWidth = puzzlePieceWidth + tabDepth * 2;
    var pieceHeight = puzzlePieceHeight + tabDepth * 2;
    var targetLeft = x * puzzlePieceWidth - tabDepth;
    var targetTop = y * puzzlePieceHeight - tabDepth;
    var snapDistance = Math.max(puzzlePieceWidth, puzzlePieceHeight) * 0.45;
    var spawnPosition = getEdgeSpawnPosition(pieceWidth, pieceHeight);
    var boardRect = puzzleBoard.getBoundingClientRect();
    var centerLeft = window.innerWidth / 2 - boardRect.left;
    var centerTop = window.innerHeight / 2 - boardRect.top;
    var scatterStartLeft = centerLeft - pieceWidth / 2;
    var scatterStartTop = centerTop - pieceHeight / 2;

    // create a new div element and put it in #puzzleContainer
    var div = document.createElement('div');
    div.className = 'puzzlePiece';
    div.id = 'puzzlePiece_' + x + '_' + y;
    div.style.width = pieceWidth + 'px';
    div.style.height = pieceHeight + 'px';
    div.style.left = scatterStartLeft + 'px';
    div.style.top = scatterStartTop + 'px';
    div.style.boxSizing = 'border-box';
    div.style.clipPath = 'path("' + createPiecePath(x, y) + '")';
    div.style.cursor = 'grab';
    div.style.zIndex = 1000;
    div.style.setProperty('--scatter-left', scatterStartLeft + 'px');
    div.style.setProperty('--scatter-top', scatterStartTop + 'px');
    div.style.setProperty('--final-left', spawnPosition.left + 'px');
    div.style.setProperty('--final-top', spawnPosition.top + 'px');
    div.style.setProperty('--scatter-delay', ((x + y) * 25) + 'ms');
    var startRotation = Math.random() * 360;
    div.style.setProperty('--piece-rotation', startRotation + 'deg');
    div.style.setProperty('--hover-rotation', (Math.random() * 4 - 2).toFixed(2) + 'deg');
    div._spawnLeft = spawnPosition.left;
    div._spawnTop = spawnPosition.top;
    div._spawnRotation = startRotation;
    div._hasRotated = false;
    div._spawnFlipped = Math.random() < 0.5;
    div._revealedOnce = !div._spawnFlipped;

    div.addEventListener('animationend', function (event) {
        if (event.animationName !== 'pieceScatter') {
            return;
        }

        div.style.left = spawnPosition.left + 'px';
        div.style.top = spawnPosition.top + 'px';
        div.classList.add('scatter-complete');
    });

    var frontFace = document.createElement('div');
    var backFace = document.createElement('div');
    frontFace.className = 'pieceFace pieceFront';
    backFace.className = 'pieceFace pieceBack';
    frontFace.style.backgroundImage = 'url(' + url + ')';
    frontFace.style.backgroundPosition = (tabDepth - x * puzzlePieceWidth) + 'px ' + (tabDepth - y * puzzlePieceHeight) + 'px';
    frontFace.style.backgroundSize = imageWidth + 'px ' + imageHeight + 'px';
    div.appendChild(frontFace);
    div.appendChild(backFace);
    div.classList.toggle('is-flipped', div._spawnFlipped);

    var isDragging = false;
    var hasMoved = false;
    var offsetX;
    var offsetY;
    var pointerStartX;
    var pointerStartY;

    function flipPieceToFrontOnce() {
        if (!div._revealedOnce) {
            div.classList.remove('is-flipped');
            div._revealedOnce = true;
        }
    }

    function rotatePiece() {
        var rotation = parseFloat(div.style.getPropertyValue('--piece-rotation')) || 0;
        if (!div._hasRotated) {
            rotation = Math.round((rotation + 90) / 90) * 90;
            div._hasRotated = true;
        } else {
            rotation += 90;
        }
        div.style.setProperty('--piece-rotation', rotation + 'deg');
    }

    function showLockEffect() {
        var lockBurst = document.createElement('span');
        lockBurst.className = 'lockBurst';
        lockBurst.setAttribute('aria-hidden', 'true');
        lockBurst.addEventListener('animationend', function () {
            lockBurst.remove();
        });
        div.appendChild(lockBurst);
    }

    function trySnapPiece() {
        var rotation = parseInt(div.style.getPropertyValue('--piece-rotation'), 10) % 360;
        var horizontalDistance = div.offsetLeft - targetLeft;
        var verticalDistance = div.offsetTop - targetTop;
        var isCloseEnough = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance) <= snapDistance;

        if (rotation < 0) {
            rotation += 360;
        }

        if (isCloseEnough && rotation === 0 && !div.classList.contains('is-flipped')) {
            div.style.left = targetLeft + 'px';
            div.style.top = targetTop + 'px';
            div.classList.add('is-locked');
            showLockEffect();
        }
    }

    div.addEventListener('pointerdown', function (event) {
        if (event.button !== 0 || div.classList.contains('is-locked')) {
            return;
        }

        var containerBounds = puzzleContainer.getBoundingClientRect();
        isDragging = true;
        hasMoved = false;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        offsetX = (event.clientX - containerBounds.left) / zoomLevel - div.offsetLeft;
        offsetY = (event.clientY - containerBounds.top) / zoomLevel - div.offsetTop;
        div.style.zIndex = 1001;
        div.style.cursor = 'grabbing';
        div.classList.add('is-grabbed');
        div.setPointerCapture(event.pointerId);
        event.preventDefault();

        div._containerBounds = containerBounds;
    });

    div.addEventListener('pointermove', function (event) {
        if (!isDragging) {
            return;
        }

        if (Math.abs(event.clientX - pointerStartX) > 5 || Math.abs(event.clientY - pointerStartY) > 5) {
            hasMoved = true;
        }

        var containerBounds = div._containerBounds;
        div.style.left = (event.clientX - containerBounds.left) / zoomLevel - offsetX + 'px';
        div.style.top = (event.clientY - containerBounds.top) / zoomLevel - offsetY + 'px';
    });

    div.addEventListener('pointerup', function (event) {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        div.style.zIndex = 1000;
        div.style.cursor = 'grab';
        div.classList.remove('is-grabbed');
        if (!hasMoved) {
            if (!div._revealedOnce) {
                flipPieceToFrontOnce();
            } else {
                rotatePiece();
            }
        }
        trySnapPiece();
        div.releasePointerCapture(event.pointerId);
    });

    div.addEventListener('pointercancel', function (event) {
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
    div.oncontextmenu = function () {
        rotatePiece();
        return false;
    };

    puzzleContainer.appendChild(div);
}
