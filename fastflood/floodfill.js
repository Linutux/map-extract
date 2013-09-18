var RGBA = 4;

function polygonify(tmp, start, g) {
    var index = (start[0] * RGBA) + (start[1] * tmp.width * RGBA);
    var l = d3.svg.line();
    var path = [getPos(index, tmp)];
    var poly = g.append('path').attr('class', 'poly')
        .datum(path)
        .attr('d', l);

    // find nwes
    var north = index;
    var south = index;
    var east = index;
    var west = index;
    while (tmp.data[getIndex(north, 'north',  tmp) + 3] == 255) {
        north = getIndex(north, 'north',  tmp);
    }
    while (tmp.data[getIndex(south, 'south',  tmp) + 3] == 255) {
        south = getIndex(south, 'south',  tmp);
    }
    while (tmp.data[getIndex(east, 'east',  tmp) + 3] == 255) {
        east = getIndex(east, 'east',  tmp);
    }
    while (tmp.data[getIndex(west, 'west',  tmp) + 3] == 255) {
        west = getIndex(west, 'west',  tmp);
    }

    path = [];

    path.push(
        getPos(north, tmp),
        getPos(east, tmp),
        getPos(south, tmp),
        getPos(west, tmp),
        getPos(north, tmp)
    );

    poly
        .datum(path)
        .transition()
        .duration(1000)
        .attr('d', l);

    path = refine(path);
    path = refine(path);
    // path = refine(path);

    poly
        .datum(path)
        .transition()
        .duration(1000)
        .attr('d', l);

    setTimeout(function() {
        path = refine(path);

        poly
            .datum(path)
            .transition()
            .duration(500)
            .attr('d', l);

        setTimeout(function() {
            path = refine(path);
            path = refine(path);

            poly
                .datum(path)
                .transition()
                .duration(1000)
                .attr('d', l);
            setTimeout(function() {
                path = resort(path, start);

                poly
                    .datum(path)
                    .transition()
                    .duration(1000)
                    .attr('d', l);
            }, 1000);
        }, 500);
    }, 1000);

    function resort(path, start) {
        return path.sort(function(a, b) {
            return Math.atan2(
                a[1] - start[1],
                a[0] - start[0]) -
            Math.atan2(
                b[1] - start[1],
                b[0] - start[0]);
        });
    }

    function mid(a, b) {
        return [
            Math.round((a[0] + b[0]) / 2),
            Math.round((a[1] + b[1]) / 2)
        ];
    }

    function northOf(a, b) { return a[1] > b[1]; }
    function southOf(a, b) { return a[1] < b[1]; }
    function westOf(a, b) { return a[0] > b[0]; }
    function eastOf(a, b) { return a[0] < b[0]; }

    function indexOf(start) {
        return (start[0] * RGBA) + (start[1] * tmp.width * RGBA);
    }

    function northMost(a) {
        var index = indexOf(a);
        while (tmp.data[getIndex(index, 'north',  tmp) + 3] == 255) {
            index = getIndex(index, 'north',  tmp);
        }
        return getPos(index, tmp);
    }

    function southMost(a) {
        var index = indexOf(a);
        while (tmp.data[getIndex(index, 'south',  tmp) + 3] == 255) {
            index = getIndex(index, 'south',  tmp);
        }
        return getPos(index, tmp);
    }

    function eastMost(a) {
        var index = indexOf(a);
        while (tmp.data[getIndex(index, 'east',  tmp) + 3] == 255) {
            index = getIndex(index, 'east',  tmp);
        }
        return getPos(index, tmp);
    }

    function westMost(a) {
        var index = indexOf(a);
        while (tmp.data[getIndex(index, 'west',  tmp) + 3] == 255) {
            index = getIndex(index, 'west',  tmp);
        }
        return getPos(index, tmp);
    }

    function refine(path) {
        var midpoints = [];
        for (var i = 0; i < path.length - 1; i++) {
            var midpt = mid(path[i], path[i + 1]);
            if (northOf(path[i], path[i + 1])) {
                midpt = northMost(midpt);
            }
            if (southOf(path[i], path[i + 1])) {
                midpt = southMost(midpt);
            }
            if (westOf(path[i], path[i + 1])) {
                midpt = westMost(midpt);
            }
            if (eastOf(path[i], path[i + 1])) {
                midpt = eastMost(midpt);
            }
            midpoints.push(midpt);
        }
        var dblpath = [];
        var other = true;
        var pl = path.length;
        for (i = 0; i < (pl * 2) - 1; i++) {
            if (other = !other) {
                dblpath.push(midpoints.pop());
            } else {
                dblpath.push(path.shift());
            }
        }
        var swap = [];
        swap.push(dblpath[0]);
        for (var i = 0; i < dblpath.length - 1; i += 2) {
            swap.push(dblpath[i + 1]);
            swap.push(dblpath[i]);
        }
        swap.push(dblpath[0]);
        return swap;
    }
}

function convexify(tmp, start) {
    var index = (start[0] * RGBA) + (start[1] * tmp.width * RGBA);
    var queue = [];

    queue.push(index);

    var noloop;

    while (queue.length) {
        var idx = queue.pop();
        if (isFilled(idx)) continue;
        if (tmp.data[idx + 3] === 0) {
            setTmp(idx);
            if (getIndex(idx, 'west',  tmp)) queue.push(getIndex(idx, 'west',  tmp));
            if (getIndex(idx, 'east',  tmp)) queue.push(getIndex(idx, 'east',  tmp));
            if (getIndex(idx, 'north', tmp)) queue.push(getIndex(idx, 'north', tmp));
            if (getIndex(idx, 'south', tmp)) queue.push(getIndex(idx, 'south', tmp));
        }
    }

    function setTmp(index) {
        tmp.data[index + 3] = 100;
    }

    function isFilled(index) {
        return tmp.data[index + 3] === 100;
    }
}

function flipTmp(tmp) {
    for (var i = 0; i < tmp.data.length; i += 4) {
        if (tmp.data[i + 3] != 100) {
            tmp.data[i + 0] = 255;
            tmp.data[i + 1] = 58;
            tmp.data[i + 2] = 123;
            tmp.data[i + 3] = 255;
        } else {
            tmp.data[i + 0] =
            tmp.data[i + 1] =
            tmp.data[i + 2] =
            tmp.data[i + 3] = 0;
        }
    }
}

function traverse(bitmap, start, tmp, tolerance) {
    var index = (start[0] * RGBA) + (start[1] * bitmap.width * RGBA);
    var queue = [];

    var color = [
        bitmap.data[index],
        bitmap.data[index + 1],
        bitmap.data[index + 2],
        bitmap.data[index + 3]
    ];

    queue.push([index, 0]);

    var noloop;

    while (queue.length) {
        var node = queue.pop();
        var val = distance(node[0]); //  + node[1];
        if (isFilled(node[0])) continue;
        if (val < tolerance) {
            setTmp(node[0], val);
            if (getIndex(node[0], 'west', bitmap)) queue.push([getIndex(node[0], 'west', bitmap), val]);
            if (getIndex(node[0], 'east', bitmap)) queue.push([getIndex(node[0], 'east', bitmap), val]);
            if (getIndex(node[0], 'north', bitmap)) queue.push([getIndex(node[0], 'north', bitmap), val]);
            if (getIndex(node[0], 'south', bitmap)) queue.push([getIndex(node[0], 'south', bitmap), val]);
        }
    }

    function setTmp(index, val) {
        tmp.data[index + 0] = 255;
        tmp.data[index + 1] = 58;
        tmp.data[index + 2] = 123;
        tmp.data[index + 3] = 255;
    }

    function isFilled(index) {
        return tmp.data[index + 3] === 255;
    }

    function distance(index) {
        var diff = 0;
        for (var i = 0; i < RGBA; i++) {
            diff += Math.abs(bitmap.data[index + i] - color[i]);
        }
        return diff;
    }
}

function getPos(index, bmp) {
    return [
        (index / RGBA) % (bmp.width),
        Math.floor(index / (bmp.width * RGBA))
    ];
}

function getIndex(index, direction, bmp) {
    var pixwidth = bmp.width * RGBA;
    var size = (bmp.width * RGBA) * bmp.height;
    var n;
    function sameY(a, b) {
        return Math.floor(a / pixwidth) == Math.floor(b / pixwidth);
    }
    switch (direction) {
        case 'west':
            n = index + 1 * RGBA;
            if (sameY(n, index)) return n;
            break;
        case 'east':
            n = index - 1 * RGBA;
            if (sameY(n, index)) return n;
            break;
        case 'north':
            n = index - pixwidth;
            if (n > 0) return n;
            break;
        case 'south':
            n = index + pixwidth;
            if (n < size) return n;
            break;
    }
}
