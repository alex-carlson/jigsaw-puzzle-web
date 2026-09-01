var image = document.getElementById('puzzleSrc');
var imagePreview = document.getElementById('imagePreviewSource');
var puzzleStateKey = 'jigsaw-puzzle-state-v5';
var puzzleImages = [
    'amy-perez-EN24LvCaHw0-unsplash.jpg',
    'aniket-deole-M6XC789HLe8-unsplash.jpg',
    'ashim-d-silva-WeYamle9fDM-unsplash.jpg',
    'bailey-zindel-NRQV-hBF10M-unsplash.jpg',
    'bibhash-polygon-cafe-banerjee-ZbJwMkhj_yI-unsplash.jpg',
    'boris-smokrovic-lyvCvA8sKGc-unsplash.jpg',
    'chenoa-liu-kZH8X0q4Nvo-unsplash.jpg',
    'daniela-cuevas-t7YycgAoVSw-unsplash.jpg',
    'duncan-adler-Got-SV5YRPg-unsplash.jpg',
    'duncan-adler-TVsVauS4QKo-unsplash.jpg',
    'enfocus-collective-7hVV0Imh1VM-unsplash.jpg',
    'evgeny-tchebotarev-aiwuLjLPFnU-unsplash.jpg',
    'hannah-grace-fk4tiMlDFF0-unsplash.jpg',
    'hiroko-yoshii-9y7y26C-l4Y-unsplash.jpg',
    'jakub-zerdzicki-PMSkLuaUqB4-unsplash.jpg',
    'joe-caione-KVeogBZzl4M-unsplash.jpg',
    'john-fowler-03Pv2Ikm5Hk-unsplash.jpg',
    'josh-rakower-zBsXaPEBSeI-unsplash.jpg',
    'kishore-v-kgH64ekcq4I-unsplash.jpg',
    'kyle-loftus-fg_FSTo7ejw-unsplash.jpg',
    'lance-asper-N9Pf2J656aQ-unsplash.jpg',
    'lukasz-szmigiel-jFCViYFYcus-unsplash.jpg',
    'matt-nelson-aI3EBLvcyu4-unsplash.jpg',
    'meritt-thomas-BwBxVVdlpYE-unsplash.jpg',
    'nasa-dCgbRAQmTQA-unsplash.jpg',
    'pine-watt-2Hzmz15wGik-unsplash.jpg',
    'robert-lukeman-_RBcxo9AU-U-unsplash.jpg',
    'ryan-hutton-Jztmx9yqjBw-unsplash.jpg',
    'scarbor-siu-IfsIVLorgtA-unsplash.jpg',
    'sean-oulashin-KMn4VEeEPR8-unsplash.jpg',
    'sergey-shmidt-koy6FlCCy5s-unsplash.jpg',
    'shaun-low-v8Un2Roo1Ak-unsplash.jpg',
    'sid-balachandran-_9a-3NO5KJE-unsplash.jpg',
    'simon-twukN12EN7c-unsplash.jpg',
    'spacex-OHOU-5UVIYQ-unsplash.jpg',
    'tian-zhang-4zQgaRyTma8-unsplash.jpg',
    'tom-gainor-ZqLeQDjY6fY-unsplash.jpg',
    'tomas-anton-escobar-PHyF2mCMei0-unsplash.jpg',
    'uwei-c-V9XRfdOK6P4-unsplash.jpg',
    'vincentiu-solomon-ln5drpv_ImI-unsplash.jpg'
];
var savedPuzzleState = loadPuzzleState();
var url = savedPuzzleState && savedPuzzleState.imageUrl
    ? savedPuzzleState.imageUrl
    : getRandomImageUrl();
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
var previewZoomInButton = document.getElementById('previewZoomIn');
var previewZoomOutButton = document.getElementById('previewZoomOut');
var completionMessage = document.getElementById('completionMessage');
var completionNewGame = document.getElementById('completionNewGame');
var world = document.getElementById('world');
var puzzlePieceCount;
var zoomLevel = 1;
var previewZoomLevel = 1;
var previewBaseWidth;
var previewBaseHeight;

var imageWidth = 800;
var imageHeight = 600;
var imageAspectRatio = imageWidth / imageHeight;

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

function getRandomImageUrl() {
    var imageName = puzzleImages[Math.floor(Math.random() * puzzleImages.length)];
    return 'images/puzzle_images/' + imageName;
}

function showCompletionMessage() {
    completionMessage.hidden = false;
    completionNewGame.focus();
}

function loadPuzzleState() {
    try {
        return JSON.parse(localStorage.getItem(puzzleStateKey));
    } catch (error) {
        return null;
    }
}

function clearPuzzleState() {
    localStorage.removeItem(puzzleStateKey);
    savedPuzzleState = null;
}

function savePuzzleState() {
    if (!puzzlePieces.length) {
        return;
    }

    var state = {
        imageUrl: url,
        pieceCount: puzzlePieceCount,
        columns: width,
        edges: {
            horizontal: horizontalEdges,
            vertical: verticalEdges
        },
        zoomLevel: zoomLevel,
        scrollLeft: window.scrollX,
        scrollTop: window.scrollY,
        pieces: puzzlePieces.map(function (piece) {
            var element = piece.element;
            var hasFinishedScatter = element.classList.contains('scatter-complete');
            return {
                x: piece.x,
                y: piece.y,
                left: hasFinishedScatter ? element.style.left : element._spawnLeft + 'px',
                top: hasFinishedScatter ? element.style.top : element._spawnTop + 'px',
                rotation: element.style.getPropertyValue('--piece-rotation'),
                hasRotated: element._hasRotated,
                flipped: element.classList.contains('is-flipped'),
                revealedOnce: element._revealedOnce,
                locked: element.classList.contains('is-locked'),
                groupId: element._group.map(function (groupPiece) {
                    return groupPiece.id;
                }),
                surface: element.parentElement === shelfStorage ? 'shelf' : 'board'
            };
        })
    };

    localStorage.setItem(puzzleStateKey, JSON.stringify(state));
    savedPuzzleState = state;
}

function restorePuzzleState(state) {
    var piecesById = {};

    state.pieces.forEach(function (pieceState) {
        var element = document.getElementById('puzzlePiece_' + pieceState.x + '_' + pieceState.y);
        if (!element) {
            return;
        }

        piecesById[element.id] = element;
        (pieceState.surface === 'shelf' ? shelfStorage : puzzleContainer).appendChild(element);
        var savedRotation = parseFloat(pieceState.rotation) || 0;
        var hasRotated = pieceState.hasRotated === true;
        if (hasRotated) {
            savedRotation = Math.round(savedRotation / 90) * 90;
        }
        element.style.left = pieceState.left;
        element.style.top = pieceState.top;
        element.style.setProperty('--piece-rotation', savedRotation + 'deg');
        element.classList.toggle('is-flipped', pieceState.flipped);
        element.classList.toggle('is-locked', pieceState.locked);
        element._revealedOnce = pieceState.revealedOnce;
        element._hasRotated = hasRotated;
        element.classList.add('scatter-complete');
    });

    state.pieces.forEach(function (pieceState) {
        var element = piecesById['puzzlePiece_' + pieceState.x + '_' + pieceState.y];
        if (!element) {
            return;
        }
        var group = pieceState.groupId.map(function (pieceId) {
            return piecesById[pieceId];
        }).filter(Boolean);
        element._group = group.length ? group : [element];
        element._group.forEach(function (groupPiece) {
            groupPiece.classList.toggle('is-grouped', element._group.length > 1);
        });
    });

    if (state.pieces.every(function (pieceState) {
        return pieceState.groupId && pieceState.groupId.length === puzzlePieces.length;
    })) {
        showCompletionMessage();
    }

    var restoredGroupIds = [];
    state.pieces.forEach(function (pieceState) {
        if (!pieceState.groupId || pieceState.groupId.length < 2) {
            return;
        }
        var groupId = pieceState.groupId.join('|');
        var element = piecesById['puzzlePiece_' + pieceState.x + '_' + pieceState.y];
        if (element && restoredGroupIds.indexOf(groupId) === -1) {
            restoredGroupIds.push(groupId);
            element._createGroupShadow(element._group);
        }
    });

    setZoom(state.zoomLevel || 1);
    requestAnimationFrame(function () {
        window.scrollTo({ left: state.scrollLeft || 0, top: state.scrollTop || 0, behavior: 'auto' });
    });
}

function updateBoardSize() {
    imageWidth = puzzleBoard.clientWidth;
    imageHeight = imageWidth / imageAspectRatio;
    puzzleBoard.style.aspectRatio = imageAspectRatio;
    puzzleContainer.style.width = imageWidth + 'px';
    puzzleContainer.style.height = imageHeight + 'px';
}

function createPuzzleWhenImageIsReady(pieceCount, columns) {
    function createLoadedPuzzle() {
        imageAspectRatio = image.naturalWidth / image.naturalHeight || 4 / 3;
        updatePreviewSizeForImage();
        createPuzzle(pieceCount, columns);
    }

    if (image.complete && image.naturalWidth) {
        createLoadedPuzzle();
    } else {
        image.addEventListener('load', createLoadedPuzzle, { once: true });
    }
}

function updatePreviewSizeForImage() {
    previewBaseWidth = previewBaseWidth || imagePreview.offsetWidth || 150;
    previewBaseHeight = previewBaseWidth / imageAspectRatio;
    previewZoomLevel = 1;
    imagePreview.style.setProperty('--preview-zoom', previewZoomLevel);
    imagePreview.style.setProperty('--preview-base-height', previewBaseHeight + 'px');
    imagePreview.style.setProperty('--preview-width', previewBaseWidth + 'px');
    imagePreview.style.setProperty('--preview-height', previewBaseHeight + 'px');
    imagePreview.style.width = previewBaseWidth + 'px';
    imagePreview.style.height = previewBaseHeight + 'px';
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
    var state = savedPuzzleState && savedPuzzleState.pieceCount === pieceCount && savedPuzzleState.columns === columns
        ? savedPuzzleState
        : null;
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
    if (state && state.edges) {
        horizontalEdges = state.edges.horizontal;
        verticalEdges = state.edges.vertical;
    } else {
        createEdgeMap();
    }

    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            var puzzlePiece = new PuzzlePiece(i, j);
            puzzlePieces.push(puzzlePiece);
        }
    }

    if (state && state.pieces && state.pieces.length === puzzlePieces.length) {
        restorePuzzleState(state);
    } else {
        savePuzzleState();
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
        div.classList.add('scatter-complete');
    });
    savePuzzleState();
}

function startNewGame() {
    completionMessage.hidden = true;
    clearPuzzleState();
    if (url.indexOf('blob:') === 0) {
        URL.revokeObjectURL(url);
    }

    url = getRandomImageUrl();
    image.src = url;
    imagePreview.src = url;
    var selectedOption = pieceCountMenu.options[pieceCountMenu.selectedIndex];
    createPuzzleWhenImageIsReady(Number(pieceCountMenu.value), Number(selectedOption.dataset.columns));
}

pieceCountMenu.addEventListener('change', function () {
    clearPuzzleState();
    var selectedOption = pieceCountMenu.options[pieceCountMenu.selectedIndex];
    createPuzzleWhenImageIsReady(Number(pieceCountMenu.value), Number(selectedOption.dataset.columns));
});

imageUpload.addEventListener('change', function () {
    var uploadedFile = imageUpload.files[0];

    if (!uploadedFile) {
        return;
    }

    var fileReader = new FileReader();
    fileReader.addEventListener('load', function () {
        clearPuzzleState();
        url = fileReader.result;
        image.src = url;
        imagePreview.src = url;
        var selectedOption = pieceCountMenu.options[pieceCountMenu.selectedIndex];
        createPuzzleWhenImageIsReady(Number(pieceCountMenu.value), Number(selectedOption.dataset.columns));
    });
    fileReader.readAsDataURL(uploadedFile);
});

newGameButton.addEventListener('click', startNewGame);
completionNewGame.addEventListener('click', startNewGame);

var initialOption = pieceCountMenu.options[pieceCountMenu.selectedIndex];
createPuzzleWhenImageIsReady(Number(pieceCountMenu.value), Number(initialOption.dataset.columns));

var resizeTimer;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        var selectedOption = pieceCountMenu.options[pieceCountMenu.selectedIndex];
        createPuzzleWhenImageIsReady(Number(pieceCountMenu.value), Number(selectedOption.dataset.columns));
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
function setPreviewZoom(nextZoom) {
    if (previewBaseWidth === undefined) {
        previewBaseWidth = imagePreview.offsetWidth || parseFloat(getComputedStyle(imagePreview).width);
        previewBaseHeight = imagePreview.offsetHeight || parseFloat(getComputedStyle(imagePreview).height);
    }

    previewZoomLevel = Math.max(0.75, Math.min(3, nextZoom));
    imagePreview.style.setProperty('--preview-zoom', previewZoomLevel);
    imagePreview.style.setProperty('--preview-width', previewBaseWidth * previewZoomLevel + 'px');
    imagePreview.style.setProperty('--preview-height', previewBaseHeight * previewZoomLevel + 'px');
    imagePreview.style.width = previewBaseWidth * previewZoomLevel + 'px';
    imagePreview.style.height = previewBaseHeight * previewZoomLevel + 'px';
}

previewZoomInButton.addEventListener('click', function () {
    setPreviewZoom(previewZoomLevel + 0.25);
});
previewZoomOutButton.addEventListener('click', function () {
    setPreviewZoom(previewZoomLevel - 0.25);
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
    var previousPointerX;
    var previousPointerY;
    var previousPointerTime;
    var pointerVelocityX = 0;
    var pointerVelocityY = 0;
    var smoothedPointerX;
    var smoothedPointerY;
    var autoScrollFrame;

    function restoreGroupToOrigin() {
        var groupShadow = div._groupShadow;
        originPositions.forEach(function (position) {
            originSurface.appendChild(position.piece);
            position.piece.style.removeProperty('--piece-scale');
        });
        if (groupShadow) {
            originSurface.insertBefore(groupShadow, originSurface.firstChild);
        }
        originPositions.forEach(function (position) {
            position.piece.style.left = position.left + 'px';
            position.piece.style.top = position.top + 'px';
        });
        updateGroupShadow(div._group);
    }

    function updateDraggedGroup(clientX, clientY) {
        var containerBounds = dragSurface.getBoundingClientRect();
        div._containerBounds = containerBounds;
        var nextLeft = clientX - containerBounds.left - grabOffsetLeft + (dragScale - 1) * div.offsetWidth / 2;
        var nextTop = clientY - containerBounds.top - grabOffsetTop + (dragScale - 1) * div.offsetHeight / 2;
        var horizontalDistance = nextLeft - groupStartLeft;
        var verticalDistance = nextTop - groupStartTop;
        groupStartPositions.forEach(function (position) {
            position.piece.style.left = position.left + horizontalDistance + 'px';
            position.piece.style.top = position.top + verticalDistance + 'px';
        });
        updateGroupShadow(div._group);
    }

    function getPredictedPointerPosition() {
        var predictionTime = 18;
        var maximumPrediction = 12;
        var predictedX = pointerVelocityX * predictionTime;
        var predictedY = pointerVelocityY * predictionTime;
        var predictionDistance = Math.sqrt(predictedX * predictedX + predictedY * predictedY);

        if (predictionDistance > maximumPrediction) {
            var predictionScale = maximumPrediction / predictionDistance;
            predictedX *= predictionScale;
            predictedY *= predictionScale;
        }

        return { x: latestPointerX + predictedX, y: latestPointerY + predictedY };
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

    function rotatePiece(snapToNearest, clockwise) {
        var rotation = parseFloat(div.style.getPropertyValue('--piece-rotation')) || 0;
        if (!div._hasRotated) {
            rotation = snapToNearest
                ? Math.round(rotation / 90) * 90
                : Math.round((rotation + (clockwise ? -90 : 90)) / 90) * 90;
            div._hasRotated = true;
        } else {
            rotation = Math.round(rotation / 90) * 90 + (clockwise ? -90 : 90);
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
        updateGroupShadow(group);
    }

    function closeGroupGaps(group) {
        if (!group || group.length < 2) {
            return;
        }

        var anchor = group[0];
        var anchorLeft = anchor.offsetLeft;
        var anchorTop = anchor.offsetTop;
        var anchorX = anchor._pieceData.x;
        var anchorY = anchor._pieceData.y;
        var angle = getPieceRotation(anchor) * Math.PI / 180;
        var cosine = Math.cos(angle);
        var sine = Math.sin(angle);

        group.forEach(function (piece) {
            var horizontalOffset = (piece._pieceData.x - anchorX) * puzzlePieceWidth;
            var verticalOffset = (piece._pieceData.y - anchorY) * puzzlePieceHeight;
            var rotatedLeft = horizontalOffset * cosine - verticalOffset * sine;
            var rotatedTop = horizontalOffset * sine + verticalOffset * cosine;
            piece.style.left = anchorLeft + rotatedLeft + 'px';
            piece.style.top = anchorTop + rotatedTop + 'px';
        });
        updateGroupShadow(group);
    }

    function updateGroupShadow(group) {
        if (!group || group.length < 2 || !group[0]._groupShadow) {
            return;
        }

        var shadow = group[0]._groupShadow;
        var left = Math.min.apply(null, group.map(function (piece) { return piece.offsetLeft; }));
        var top = Math.min.apply(null, group.map(function (piece) { return piece.offsetTop; }));
        var right = Math.max.apply(null, group.map(function (piece) { return piece.offsetLeft + piece.offsetWidth; }));
        var bottom = Math.max.apply(null, group.map(function (piece) { return piece.offsetTop + piece.offsetHeight; }));
        shadow.style.left = left + 'px';
        shadow.style.top = top + 'px';
        shadow.style.width = right - left + 'px';
        shadow.style.height = bottom - top + 'px';
        group.forEach(function (piece, index) {
            var shadowPiece = shadow.children[index];
            shadowPiece.style.left = piece.offsetLeft - left + 'px';
            shadowPiece.style.top = piece.offsetTop - top + 'px';
            shadowPiece.style.width = piece.offsetWidth + 'px';
            shadowPiece.style.height = piece.offsetHeight + 'px';
            shadowPiece.style.transform = piece.style.getPropertyValue('--flip-transform') + ' rotate(' + getPieceRotation(piece) + 'deg)';
        });
    }

    function removeGroupShadow(group) {
        var shadows = [];
        group.forEach(function (piece) {
            if (piece._groupShadow && shadows.indexOf(piece._groupShadow) === -1) {
                shadows.push(piece._groupShadow);
            }
            piece._groupShadow = null;
        });
        shadows.forEach(function (shadow) {
            shadow.remove();
        });
    }

    function createGroupShadow(group) {
        removeGroupShadow(group);
        var shadow = document.createElement('div');
        shadow.className = 'groupShadow';
        shadow.setAttribute('aria-hidden', 'true');
        group.forEach(function (piece) {
            var shadowPiece = document.createElement('div');
            shadowPiece.className = 'groupShadowPiece';
            shadowPiece.style.clipPath = piece.firstElementChild.style.clipPath;
            shadow.appendChild(shadowPiece);
        });
        group[0].parentElement.insertBefore(shadow, group[0]);
        group.forEach(function (piece) {
            piece._groupShadow = shadow;
        });
        updateGroupShadow(group);
    }

    div._createGroupShadow = createGroupShadow;

    function moveGroupToSurface(group, draggedPiece, targetSurface, clientX, clientY, grabOffsetLeft, grabOffsetTop) {
        var targetBounds = targetSurface.getBoundingClientRect();
        var targetScale = targetSurface === puzzleContainer ? zoomLevel : 1;
        var targetLeft = (clientX - targetBounds.left - grabOffsetLeft) / targetScale;
        var targetTop = (clientY - targetBounds.top - grabOffsetTop) / targetScale;
        var leftOffsets = group.map(function (piece) { return (piece.offsetLeft - draggedPiece.offsetLeft) / targetScale; });
        var topOffsets = group.map(function (piece) { return (piece.offsetTop - draggedPiece.offsetTop) / targetScale; });

        group.forEach(function (piece) {
            targetSurface.appendChild(piece);
            piece.style.removeProperty('--piece-scale');
        });
        if (group[0]._groupShadow) {
            targetSurface.insertBefore(group[0]._groupShadow, targetSurface.firstChild);
        }
        group.forEach(function (piece, index) {
            piece.style.left = targetLeft + leftOffsets[index] + 'px';
            piece.style.top = targetTop + topOffsets[index] + 'px';
        });
        updateGroupShadow(group);
    }

    function moveGroupToDragLayer(group) {
        var dragBounds = dragLayer.getBoundingClientRect();
        var sourceSurface = group[0].parentElement;
        var sourceScale = sourceSurface === puzzleContainer ? zoomLevel : 1;
        var anchorBounds = group[0].getBoundingClientRect();
        var anchorCenterLeft = anchorBounds.left + anchorBounds.width / 2;
        var anchorCenterTop = anchorBounds.top + anchorBounds.height / 2;
        var screenPositions = group.map(function (piece) {
            var bounds = piece.getBoundingClientRect();
            return {
                piece: piece,
                left: bounds.left + bounds.width / 2 - dragBounds.left - piece.offsetWidth / 2,
                top: bounds.top + bounds.height / 2 - dragBounds.top - piece.offsetHeight / 2
            };
        });

        group.forEach(function (piece) {
            dragLayer.appendChild(piece);
            piece.style.setProperty('--piece-scale', sourceScale);
        });
        if (group[0]._groupShadow) {
            dragLayer.appendChild(group[0]._groupShadow);
        }
        screenPositions.forEach(function (position) {
            position.piece.style.left = position.left + 'px';
            position.piece.style.top = position.top + 'px';
        });
        updateGroupShadow(group);
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
            updateGroupShadow(group);
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
        createGroupShadow(mergedGroup);
    }

    function tryConnectToNeighbor() {
        var group = div._group;

        for (var groupIndex = 0; groupIndex < group.length; groupIndex++) {
            var sourcePiece = group[groupIndex];
            var rotation = getPieceRotation(sourcePiece);

            if (sourcePiece.classList.contains('is-flipped')) {
                continue;
            }

            for (var pieceIndex = 0; pieceIndex < puzzlePieces.length; pieceIndex++) {
                var other = puzzlePieces[pieceIndex].element;
                if (other === sourcePiece || group.indexOf(other) !== -1 || other.parentElement !== sourcePiece.parentElement || other.classList.contains('is-flipped') || getPieceRotation(other) !== rotation) {
                    continue;
                }

                var columnDistance = sourcePiece._pieceData.x - other._pieceData.x;
                var rowDistance = sourcePiece._pieceData.y - other._pieceData.y;
                if (Math.abs(columnDistance) + Math.abs(rowDistance) !== 1) {
                    continue;
                }

                var matchingNodes = columnDistance === 1
                    ? sourcePiece._pieceData.edges.left === other._pieceData.edges.right
                    : columnDistance === -1
                        ? sourcePiece._pieceData.edges.right === other._pieceData.edges.left
                        : rowDistance === 1
                            ? sourcePiece._pieceData.edges.top === other._pieceData.edges.bottom
                            : sourcePiece._pieceData.edges.bottom === other._pieceData.edges.top;
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
                var horizontalDistance = expectedLeft - sourcePiece.offsetLeft;
                var verticalDistance = expectedTop - sourcePiece.offsetTop;
                var isCloseEnough = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance) <= snapDistance;

                if (isCloseEnough) {
                    moveGroup(group, horizontalDistance, verticalDistance);
                    mergeGroups(group, other._group);
                    closeGroupGaps(sourcePiece._group);
                    return true;
                }
            }
        }

        return false;
    }

    function trySnapPiece() {
        var didConnect = false;
        while (tryConnectToNeighbor()) {
            didConnect = true;
            showLockEffect();
        }
        if (didConnect && div._group.length === puzzlePieces.length) {
            savePuzzleState();
            showCompletionMessage();
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
        moveGroupToDragLayer(div._group);
        dragSurface = dragLayer;
        dragScale = originSurface === puzzleContainer ? zoomLevel : 1;
        var containerBounds = dragSurface.getBoundingClientRect();
        var draggedBounds = div.getBoundingClientRect();
        grabOffsetLeft = event.clientX - draggedBounds.left;
        grabOffsetTop = event.clientY - draggedBounds.top;
        isDragging = true;
        hasMoved = false;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        latestPointerX = event.clientX;
        latestPointerY = event.clientY;
        previousPointerX = event.clientX;
        previousPointerY = event.clientY;
        previousPointerTime = event.timeStamp || performance.now();
        pointerVelocityX = 0;
        pointerVelocityY = 0;
        smoothedPointerX = event.clientX;
        smoothedPointerY = event.clientY;
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
        var pointerTime = event.timeStamp || performance.now();
        var elapsedTime = Math.max(1, pointerTime - previousPointerTime);
        var instantaneousVelocityX = (event.clientX - previousPointerX) / elapsedTime;
        var instantaneousVelocityY = (event.clientY - previousPointerY) / elapsedTime;
        pointerVelocityX = pointerVelocityX * 0.35 + instantaneousVelocityX * 0.65;
        pointerVelocityY = pointerVelocityY * 0.35 + instantaneousVelocityY * 0.65;
        previousPointerX = event.clientX;
        previousPointerY = event.clientY;
        previousPointerTime = pointerTime;
        if (Math.abs(event.clientX - pointerStartX) > 5 || Math.abs(event.clientY - pointerStartY) > 5) {
            hasMoved = true;
        }

        var predictedPointer = getPredictedPointerPosition();
        smoothedPointerX += (predictedPointer.x - smoothedPointerX) * 0.45;
        smoothedPointerY += (predictedPointer.y - smoothedPointerY) * 0.45;
        updateDraggedGroup(smoothedPointerX, smoothedPointerY);
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
                rotateGroup(pivotLeft, pivotTop, function () {
                    trySnapPiece();
                    savePuzzleState();
                });
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
        savePuzzleState();
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
    div.oncontextmenu = function (event) {
        if (div._group.length > 1) {
            var rotationBounds = puzzleContainer.getBoundingClientRect();
            var rotationScale = zoomLevel;
            var pivotLeft = (event.clientX - rotationBounds.left) / rotationScale;
            var pivotTop = (event.clientY - rotationBounds.top) / rotationScale;
            rotateGroup(pivotLeft, pivotTop, function () {
                trySnapPiece();
                savePuzzleState();
            });
        } else {
            rotatePiece(true, true);
            savePuzzleState();
        }
        return false;
    };

    puzzleContainer.appendChild(div);
}
