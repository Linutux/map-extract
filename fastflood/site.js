function loadImage(url, cb) {
    var im = new Image();
    im.onload = function() {
        cb(im);
    };
    im.src = url;
}

loadImage('map.png', onLoad);

var svg = d3.select('.rel')
    .append('svg');

var g = svg.append('g');

window.oncontextmenu = function() { return false };

function onLoad(image) {

    var base = document.querySelector('#base');
    var overlay = document.querySelector('#overlay');
    var tmp = document.querySelector('#tmp');

    tmp.width = overlay.width = base.width = image.width;
    tmp.height = overlay.height = base.height = image.height;

    svg
        .attr('width', image.width)
        .attr('height', image.height);

    var ctx = base.getContext('2d');
    ctx.drawImage(image, 0, 0);

    var tmpctx = tmp.getContext('2d');
    var overlayctx = overlay.getContext('2d');

    var bitmap = ctx.getImageData(0, 0, base.width, base.height);
    var tmpdata = tmpctx.getImageData(0, 0, base.width, base.height);

    function addToOverlay() {
        overlayctx.drawImage(tmp, 0, 0);
    }


    d3.select(overlay).on('mousedown', ondown);

    var lastTol;

    var polyG = g.append('g');

    function ondown() {
        var down = d3.event;
        var start = [down.offsetX, down.offsetY];
        if (d3.event.which == 3) {
            polygonify(tmpdata, start, polyG);
            d3.event.preventDefault();
            d3.event.stopPropagation();
            return;
        } else if (d3.event.shiftKey) {
            convexify(tmpdata, start);
            tmpctx.putImageData(tmpdata, 0, 0);
            setTimeout(function() {
                flipTmp(tmpdata);
                tmpctx.putImageData(tmpdata, 0, 0);
            }, 200);
            return;
        } else {
            var guide = g.append('g')
                .attr('class', 'guide-g');
            guide.attr('transform', 'translate(' + start + ')');
            guide.append('circle')
                .attr('class', 'guide')
                .attr('r', 5);
            var tol = guide.append('circle')
                .attr('class', 'tolerance')
                .attr('r', 5);

            runTol(start, lastTol);

            d3.select(overlay).on('mousemove', function() {
                var move = d3.event;
                var tolerance = Math.sqrt(
                    Math.pow(move.offsetX - down.offsetX, 2) +
                    Math.pow(move.offsetY - down.offsetY, 2));
                if (tolerance > 3) {
                    runTol(start, tolerance);
                }
            });

            function runTol(start, tolerance) {
                tmp.width = tmp.width;
                tmpdata = tmpctx.getImageData(0, 0, base.width, base.height);
                tol.attr('r', tolerance);
                traverse(bitmap, start, tmpdata, tolerance * 2);
                tmpctx.putImageData(tmpdata, 0, 0);
                lastTol = tolerance;
            }
        }
    }

    d3.select('body').on('mouseup', function() {
        if (!d3.event.shiftKey) addToOverlay();
        d3.select(overlay).on('mousemove', null);
        svg.select('.guide-g')
            .selectAll('circle')
            .transition()
            .attr('r', 0)
            .each('end', function() {
                svg.select('.guide-g').remove();
            });
    });
}
