export function createEdgeMap(width, height) {
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

    return { horizontal: horizontalEdges, vertical: verticalEdges };
}

function horizontalEdge(start, end, base, bulge, tabDepth) {
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

function verticalEdge(start, end, base, bulge, tabDepth) {
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

export function createPiecePath(x, y, dimensions) {
    var left = dimensions.tabDepth;
    var top = dimensions.tabDepth;
    var right = left + dimensions.pieceWidth;
    var bottom = top + dimensions.pieceHeight;
    var topEdge = y === 0 ? 0 : dimensions.horizontalEdges[y][x];
    var rightEdge = x === dimensions.width - 1 ? 0 : -dimensions.verticalEdges[y][x + 1];
    var bottomEdge = y === dimensions.height - 1 ? 0 : -dimensions.horizontalEdges[y + 1][x];
    var leftEdge = x === 0 ? 0 : dimensions.verticalEdges[y][x];

    return 'M ' + left + ' ' + top +
        horizontalEdge(left, right, top, -topEdge, dimensions.tabDepth) +
        verticalEdge(top, bottom, right, rightEdge, dimensions.tabDepth) +
        horizontalEdge(right, left, bottom, bottomEdge, dimensions.tabDepth) +
        verticalEdge(bottom, top, left, -leftEdge, dimensions.tabDepth) + ' Z';
}

export function getEdgeSpawnPosition(pieceWidth, pieceHeight, imageWidth, imageHeight) {
    var side = Math.floor(Math.random() * 4);
    var horizontalPosition = Math.random() * (imageWidth + pieceWidth * 2) - pieceWidth;
    var verticalPosition = Math.random() * (imageHeight + pieceHeight * 2) - pieceHeight;
    var horizontalOffset = (Math.random() - 0.5) * pieceWidth * 1.5;
    var verticalOffset = (Math.random() - 0.5) * pieceHeight * 1.5;
    var visiblePart = -0.35;

    if (side === 0) {
        return { left: horizontalPosition + horizontalOffset, top: -pieceHeight * (1 - visiblePart) + verticalOffset };
    }
    if (side === 1) {
        return { left: imageWidth - pieceWidth * visiblePart + horizontalOffset, top: verticalPosition + verticalOffset };
    }
    if (side === 2) {
        return { left: horizontalPosition + horizontalOffset, top: imageHeight - pieceHeight * visiblePart + verticalOffset };
    }
    return { left: -pieceWidth * (1 - visiblePart) + horizontalOffset, top: verticalPosition + verticalOffset };
}