self.onmessage = function (event) {
    //http://dl.dropbox.com/u/30836238/frac.zip
    var data = event.data;
    var max_iter = data.max_iter;
    var escape = data.escape;
    var c_i = (data.i_min - data.i_max) * data.row / data.height + data.i_max;
    data.values = [];
    for (var i = 0; i < data.width; i++) {
        var c_r = data.r_min + (data.r_max - data.r_min) * i / data.width;
        var z_r = 0, z_i = 0;
        for (iter = 0; z_r*z_r + z_i*z_i < escape && iter < max_iter; iter++) {
            // zn+1 = zn^2 + c
            // z^2 = r^2 + 2ri - i^2
            var tmp = z_r*z_r - z_i*z_i + c_r; 
            z_i = 2 * z_r * z_i + c_i;
            z_r = tmp;
        }
        if (iter == max_iter) {
            iter = -1;
        }
        data.values.push(iter);
    }
    self.postMessage(data);
}
