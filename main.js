var image = document.getElementById('puzzleSrc');
var imagePreview = document.getElementById('imagePreviewSource');
var url = 'https://picsum.photos/800/600?random=' + Date.now() + Math.random();
image.src = url;
imagePreview.src = url;
var puzzleContainer = document.getElementById('puzzleContainer');
var shelf = document.getElementById('pieceShelf');
var shelfStorage = document.getElementById('shelfStorage');
var dragLayer = document.getElementById('dragLayer');
var shelfToggle = document.getElementById('shelfToggle');
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

shelfToggle.addEventListener('click', function () {
    var isOpen = shelf.classList.toggle('is-open');
    shelf.classList.toggle('is-closed', !isOpen);
    shelfToggle.textContent = isOpen ? '\u2039' : '\u203a';
    shelfToggle.setAttribute('aria-label', isOpen ? 'Close shelf' : 'Open shelf');
    shelfToggle.setAttribute('title', isOpen ? 'Close shelf' : 'Open shelf');
});

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
    shelfStorage.replaceChildren();
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

    return !target.closest('.taskBar, .puzzlePiece, .imageMenu, .imageMenuPanel, .pieceShelf, button, select, input, summary, aside');
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
    this.edges = {
        top: y === 0 ? null : horizontalEdges[y][x],
        right: x === width - 1 ? null : verticalEdges[y][x + 1],
        bottom: y === height - 1 ? null : horizontalEdges[y + 1][x],
        left: x === 0 ? null : verticalEdges[y][x]
    };

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
    this.element = div;
    div._pieceData = this;
    div._group = [div];

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
    var pieceClipPath = 'path("' + createPiecePath(x, y) + '")';
    frontFace.style.clipPath = pieceClipPath;
    backFace.style.clipPath = pieceClipPath;
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
    var groupStartPositions;
    var groupStartLeft;
    var groupStartTop;
    var dragSurface;
    var dragScale;
    var grabOffsetLeft;
    var grabOffsetTop;
    var originSurface;
    var originPositions;
    var latestPointerX;
    var latestPointerY;
    var autoScrollFrame;

    function restoreGroupToOrigin() {
        originPositions.forEach(function (position) {
            originSurface.appendChild(position.piece);
        });
        originPositions.forEach(function (position) {
            position.piece.style.left = position.left + 'px';
            position.piece.style.top = position.top + 'px';
        });
    }

    function updateDraggedGroup(clientX, clientY) {
        var containerBounds = dragSurface.getBoundingClientRect();
        div._containerBounds = containerBounds;
        var nextLeft = (clientX - containerBounds.left - grabOffsetLeft) / dragScale;
        var nextTop = (clientY - containerBounds.top - grabOffsetTop) / dragScale;
        var horizontalDistance = nextLeft - groupStartLeft;
        var verticalDistance = nextTop - groupStartTop;
        groupStartPositions.forEach(function (position) {
            position.piece.style.left = position.left + horizontalDistance + 'px';
            position.piece.style.top = position.top + verticalDistance + 'px';
        });
    }

    function getEdgeScrollSpeed(pointerPosition, windowSize) {
        var edgeDistance = navigator.maxTouchPoints > 0 ? 120 : 72;
        var maximumSpeed = navigator.maxTouchPoints > 0 ? 12 : 18;
        if (pointerPosition < edgeDistance) {
            return -maximumSpeed * (1 - pointerPosition / edgeDistance);
        }
        if (pointerPosition > windowSize - edgeDistance) {
            return maximumSpeed * (1 - (windowSize - pointerPosition) / edgeDistance);
        }
        return 0;
    }

    function scrollDocument(horizontalSpeed, verticalSpeed) {
        var scrollContainer = document.scrollingElement || document.documentElement;
        var nextScrollLeft = Math.max(0, Math.min(
            scrollContainer.scrollLeft + horizontalSpeed,
            scrollContainer.scrollWidth - scrollContainer.clientWidth
        ));
        var nextScrollTop = Math.max(0, Math.min(
            scrollContainer.scrollTop + verticalSpeed,
            scrollContainer.scrollHeight - scrollContainer.clientHeight
        ));
        scrollContainer.scrollLeft = nextScrollLeft;
        scrollContainer.scrollTop = nextScrollTop;
    }

    function autoScrollWhileDragging() {
        if (!isDragging) {
            autoScrollFrame = null;
            return;
        }

        var horizontalSpeed = getEdgeScrollSpeed(latestPointerX, window.innerWidth);
        var verticalSpeed = getEdgeScrollSpeed(latestPointerY, window.innerHeight);
        if (horizontalSpeed || verticalSpeed) {
            scrollDocument(horizontalSpeed, verticalSpeed);
            updateDraggedGroup(latestPointerX, latestPointerY);
        }
        autoScrollFrame = requestAnimationFrame(autoScrollWhileDragging);
    }

    function flipPieceToFrontOnce() {
        if (!div._revealedOnce) {
            div.classList.remove('is-flipped');
            div._revealedOnce = true;
        }
    }

    function rotatePiece(snapToNearest) {
        var rotation = parseFloat(div.style.getPropertyValue('--piece-rotation')) || 0;
        if (!div._hasRotated) {
            rotation = snapToNearest
                ? Math.round(rotation / 90) * 90
                : Math.round((rotation + 90) / 90) * 90;
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

    function getPieceRotation(piece) {
        var rotation = parseInt(piece.style.getPropertyValue('--piece-rotation'), 10) % 360;
        return rotation < 0 ? rotation + 360 : rotation;
    }

    function moveGroup(group, horizontalDistance, verticalDistance) {
        group.forEach(function (piece) {
            piece.style.left = piece.offsetLeft + horizontalDistance + 'px';
            piece.style.top = piece.offsetTop + verticalDistance + 'px';
        });
    }

    function moveGroupToSurface(group, draggedPiece, targetSurface, clientX, clientY, grabOffsetLeft, grabOffsetTop) {
        var targetBounds = targetSurface.getBoundingClientRect();
        var targetScale = targetSurface === puzzleContainer ? zoomLevel : 1;
        var targetLeft = (clientX - targetBounds.left - grabOffsetLeft) / targetScale;
        var targetTop = (clientY - targetBounds.top - grabOffsetTop) / targetScale;
        var leftOffsets = group.map(function (piece) { return piece.offsetLeft - draggedPiece.offsetLeft; });
        var topOffsets = group.map(function (piece) { return piece.offsetTop - draggedPiece.offsetTop; });

        group.forEach(function (piece) {
            targetSurface.appendChild(piece);
        });
        group.forEach(function (piece, index) {
            piece.style.left = targetLeft + leftOffsets[index] + 'px';
            piece.style.top = targetTop + topOffsets[index] + 'px';
        });
    }

    function moveGroupToDragLayer(group) {
        var dragBounds = dragLayer.getBoundingClientRect();
        var screenPositions = group.map(function (piece) {
            var bounds = piece.getBoundingClientRect();
            return {
                piece: piece,
                left: bounds.left - dragBounds.left + (bounds.width - piece.offsetWidth) / 2,
                top: bounds.top - dragBounds.top + (bounds.height - piece.offsetHeight) / 2
            };
        });

        group.forEach(function (piece) {
            dragLayer.appendChild(piece);
        });
        screenPositions.forEach(function (position) {
            position.piece.style.left = position.left + 'px';
            position.piece.style.top = position.top + 'px';
        });
    }

    function rotateGroup(pivotLeft, pivotTop, onComplete) {
        var group = div._group;
        group.forEach(function (piece) {
            piece._isRotating = true;
        });
        var startTime;
        var duration = 180;
        var pieces = group.map(function (piece) {
            var pieceCenterLeft = piece.offsetLeft + piece.offsetWidth / 2;
            var pieceCenterTop = piece.offsetTop + piece.offsetHeight / 2;
            var rotation = getPieceRotation(piece);
            return {
                piece: piece,
                centerLeft: pieceCenterLeft,
                centerTop: pieceCenterTop,
                rotation: rotation,
                targetLeft: pivotLeft - (pieceCenterTop - pivotTop) - piece.offsetWidth / 2,
                targetTop: pivotTop + (pieceCenterLeft - pivotLeft) - piece.offsetHeight / 2,
                targetRotation: rotation + 90
            };
        });

        function animate(timestamp) {
            startTime = startTime || timestamp;
            var progress = Math.min(1, (timestamp - startTime) / duration);
            var easedProgress = 1 - Math.pow(1 - progress, 3);

            pieces.forEach(function (item) {
                var centerLeft = item.centerLeft + (item.targetLeft + item.piece.offsetWidth / 2 - item.centerLeft) * easedProgress;
                var centerTop = item.centerTop + (item.targetTop + item.piece.offsetHeight / 2 - item.centerTop) * easedProgress;
                var rotation = item.rotation + (item.targetRotation - item.rotation) * easedProgress;
                item.piece.style.left = centerLeft - item.piece.offsetWidth / 2 + 'px';
                item.piece.style.top = centerTop - item.piece.offsetHeight / 2 + 'px';
                item.piece.style.setProperty('--piece-rotation', rotation + 'deg');
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
                return;
            }

            pieces.forEach(function (item) {
                item.piece.style.left = item.targetLeft + 'px';
                item.piece.style.top = item.targetTop + 'px';
                item.piece.style.setProperty('--piece-rotation', item.targetRotation + 'deg');
                item.piece._hasRotated = true;
                item.piece._isRotating = false;
            });
            if (onComplete) {
                onComplete();
            }
        }

        requestAnimationFrame(animate);
    }

    function mergeGroups(firstGroup, secondGroup) {
        var mergedGroup = firstGroup.concat(secondGroup);
        mergedGroup.forEach(function (piece) {
            piece._group = mergedGroup;
            piece.classList.add('is-grouped');
        });
    }

    function tryConnectToNeighbor() {
        var group = div._group;
        var rotation = getPieceRotation(div);

        if (div.classList.contains('is-flipped')) {
            return false;
        }

        for (var pieceIndex = 0; pieceIndex < puzzlePieces.length; pieceIndex++) {
            var other = puzzlePieces[pieceIndex].element;
            if (other === div || group.indexOf(other) !== -1 || other.parentElement !== div.parentElement || other.classList.contains('is-flipped') || getPieceRotation(other) !== rotation) {
                continue;
            }

            var columnDistance = div._pieceData.x - other._pieceData.x;
            var rowDistance = div._pieceData.y - other._pieceData.y;
            if (Math.abs(columnDistance) + Math.abs(rowDistance) !== 1) {
                continue;
            }

            var matchingNodes = columnDistance === 1
                ? div._pieceData.edges.left === other._pieceData.edges.right
                : columnDistance === -1
                    ? div._pieceData.edges.right === other._pieceData.edges.left
                    : rowDistance === 1
                        ? div._pieceData.edges.top === other._pieceData.edges.bottom
                        : div._pieceData.edges.bottom === other._pieceData.edges.top;
            if (!matchingNodes) {
                continue;
            }

            var angle = rotation * Math.PI / 180;
            var logicalOffsetLeft = columnDistance * puzzlePieceWidth;
            var logicalOffsetTop = rowDistance * puzzlePieceHeight;
            var rotatedOffsetLeft = logicalOffsetLeft * Math.cos(angle) - logicalOffsetTop * Math.sin(angle);
            var rotatedOffsetTop = logicalOffsetLeft * Math.sin(angle) + logicalOffsetTop * Math.cos(angle);
            var expectedLeft = other.offsetLeft + rotatedOffsetLeft;
            var expectedTop = other.offsetTop + rotatedOffsetTop;
            var horizontalDistance = expectedLeft - div.offsetLeft;
            var verticalDistance = expectedTop - div.offsetTop;
            var isCloseEnough = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance) <= snapDistance;

            if (isCloseEnough) {
                moveGroup(group, horizontalDistance, verticalDistance);
                mergeGroups(group, other._group);
                return true;
            }
        }

        return false;
    }

    function trySnapPiece() {
        tryConnectToNeighbor();
        var group = div._group;
        var isSolved = group.every(function (piece) {
            var pieceTargetLeft = piece._pieceData.x * puzzlePieceWidth - tabDepth;
            var pieceTargetTop = piece._pieceData.y * puzzlePieceHeight - tabDepth;
            var horizontalDistance = piece.offsetLeft - pieceTargetLeft;
            var verticalDistance = piece.offsetTop - pieceTargetTop;
            return getPieceRotation(piece) === 0 && !piece.classList.contains('is-flipped') &&
                Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance) <= snapDistance;
        });

        if (isSolved) {
            group.forEach(function (piece) {
                var pieceTargetLeft = piece._pieceData.x * puzzlePieceWidth - tabDepth;
                var pieceTargetTop = piece._pieceData.y * puzzlePieceHeight - tabDepth;
                piece.style.left = pieceTargetLeft + 'px';
                piece.style.top = pieceTargetTop + 'px';
                piece.classList.add('is-locked');
            });
            showLockEffect();
        }
    }

    div.addEventListener('pointerdown', function (event) {
        if (event.button !== 0 || div.classList.contains('is-locked') || div._isRotating) {
            return;
        }

        originSurface = div.parentElement;
        originPositions = div._group.map(function (piece) {
            return { piece: piece, left: piece.offsetLeft, top: piece.offsetTop };
        });
        var pieceBounds = div.getBoundingClientRect();
        grabOffsetLeft = event.clientX - pieceBounds.left;
        grabOffsetTop = event.clientY - pieceBounds.top;
        moveGroupToDragLayer(div._group);
        dragSurface = dragLayer;
        dragScale = 1;
        var containerBounds = dragSurface.getBoundingClientRect();
        isDragging = true;
        hasMoved = false;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        latestPointerX = event.clientX;
        latestPointerY = event.clientY;
        offsetX = (event.clientX - containerBounds.left) / dragScale - div.offsetLeft;
        offsetY = (event.clientY - containerBounds.top) / dragScale - div.offsetTop;
        div.style.zIndex = 1001;
        div.style.cursor = 'grabbing';
        div.classList.add('is-grabbed');
        div.setPointerCapture(event.pointerId);
        event.preventDefault();

        div._containerBounds = containerBounds;
        groupStartPositions = div._group.map(function (piece) {
            return { piece: piece, left: piece.offsetLeft, top: piece.offsetTop };
        });
        groupStartLeft = div.offsetLeft;
        groupStartTop = div.offsetTop;
    });

    div.addEventListener('pointermove', function (event) {
        if (!isDragging) {
            return;
        }

        latestPointerX = event.clientX;
        latestPointerY = event.clientY;
        if (Math.abs(event.clientX - pointerStartX) > 5 || Math.abs(event.clientY - pointerStartY) > 5) {
            hasMoved = true;
        }

        updateDraggedGroup(event.clientX, event.clientY);
        if (hasMoved && !autoScrollFrame) {
            autoScrollFrame = requestAnimationFrame(autoScrollWhileDragging);
        }
    });

    div.addEventListener('pointerup', function (event) {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        if (autoScrollFrame) {
            cancelAnimationFrame(autoScrollFrame);
            autoScrollFrame = null;
        }
        div.style.zIndex = 1000;
        div.style.cursor = 'grab';
        div.classList.remove('is-grabbed');
        if (!hasMoved) {
            restoreGroupToOrigin();
            if (!div._revealedOnce) {
                flipPieceToFrontOnce();
                rotatePiece(true);
            } else if (div._group.length > 1) {
                var rotationBounds = originSurface.getBoundingClientRect();
                var rotationScale = originSurface === puzzleContainer ? zoomLevel : 1;
                var pivotLeft = (event.clientX - rotationBounds.left) / rotationScale;
                var pivotTop = (event.clientY - rotationBounds.top) / rotationScale;
                rotateGroup(pivotLeft, pivotTop, trySnapPiece);
                div.releasePointerCapture(event.pointerId);
                return;
            } else {
                rotatePiece(false);
            }
        } else {
            var shelfBounds = shelf.getBoundingClientRect();
            var droppedInShelf = shelf.classList.contains('is-open') &&
                event.clientX >= shelfBounds.left && event.clientX <= shelfBounds.right &&
                event.clientY >= shelfBounds.top && event.clientY <= shelfBounds.bottom;
            var targetSurface = droppedInShelf ? shelfStorage : puzzleContainer;
            if (dragSurface !== targetSurface) {
                moveGroupToSurface(div._group, div, targetSurface, event.clientX, event.clientY, grabOffsetLeft, grabOffsetTop);
            }
        }
        if (div.parentElement === puzzleContainer) {
            trySnapPiece();
        }
        div.releasePointerCapture(event.pointerId);
    });

    div.addEventListener('pointercancel', function (event) {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        if (autoScrollFrame) {
            cancelAnimationFrame(autoScrollFrame);
            autoScrollFrame = null;
        }
        restoreGroupToOrigin();
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
