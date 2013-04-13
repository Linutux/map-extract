if (!console) {
    console = {
        log: function() {},
        time: function() {},
        timeEnd: function() {}
    };
}

// NOTES
//
// the var i = 0, l = foo.length trick is **actually important** here
// since V8 does not cache the length of `data.data`
function blit(ctx) {
    var width = ctx.canvas.width,
        height = ctx.canvas.height,
        data = ctx.getImageData(0, 0,
            width, height);
    return {
        threshold: function(
            r_threshold,
            g_threshold,
            b_threshold) {
            console.time('threshold');
            var out = ctx.createImageData(width, height);
            for (var i = 0, l = data.data.length; i < l; i += 4) {
                var r = (data.data[i + 0] > r_threshold) ? 255 : 0,
                    g = (data.data[i + 1] > g_threshold) ? 255 : 0,
                    b = (data.data[i + 2] > b_threshold) ? 255 : 0;
                 out.data[i + 0] = r;
                 out.data[i + 1] = g;
                 out.data[i + 2] = b;
                 out.data[i + 3] = 255;
            }
            ctx.putImageData(out, 0, 0);
            console.timeEnd('threshold');
        }
    };
}
