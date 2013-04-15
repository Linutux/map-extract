
var RGBA = 4,
    max = 255;

var verticalSobel = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]];

var horizontalSobel = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]];

var Sobel = [
    [-2, -2, 0],
    [-2, 0, 2],
    [0, 2, 2]];


function convolute(image, matrix) {
    var getIndex = getGetIndex(image),
        d = image.data,
        i, s;

    var context = document.createElement('canvas').getContext('2d');
    var out = context.createImageData(image.width, image.height);

    var mdiam = Math.floor(matrix.length / 2);

    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.width; y++) {
            s = 0;
            i = getIndex(x, y);
            for (var k = 0; k < matrix.length; k++) {
                for (var j = 0; j < matrix.length; j++) {
                    s += d[getIndex(x + k - mdiam, y + j - mdiam)] * matrix[j][k];
                }
            }
            s = Math.round(Math.abs(s));
            if (s < 10) s = 0;
            out.data[i] = out.data[i+1] = out.data[i+2] = s;
            out.data[i+3] = 255;
        }
    }
    return out;
}

function grayscale(image) {
    var getIndex = getGetIndex(image),
        d = image.data,
        i;
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.width; y++) {
            i = getIndex(x, y);
            d[i] = d[i+1] = d[i+2] = (d[i] + d[i+1] + d[i+2]) / 4;
        }
    }
    return image;
}

function getGetIndex(m) {
    return function getIndex(x, y) {
        x = Math.max(0, x);
        y = Math.max(0, y);
        return (m.width * y + x) * RGBA;
    };
}
