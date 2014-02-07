var Mandelbrot = function (canvas, n_workers) {
    var self = this; //En los eventos, this referencía al canvas, no al objeto Mandelbrot
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.row_data = this.ctx.createImageData(canvas.width, 1); //arreglo de pixeles rgba de una fila
    this.canvas.addEventListener("click", function(event) { 
        console.log(document.body.scrollLeft);
        self.click(event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft,
                   event.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop);
    }, false); //Obtener a qué posición posición del canvas pertenece el área del cliente al que se hizo click
    this.workers = [];
    for (var i = 0; i < n_workers; i++) {
        var worker = new Worker("worker.js");
        worker.onmessage = function(event) {
                self.received_row(event.target, event.data)
        }
        worker.idle = true;
        this.workers.push(worker);
    }
    this.i_max = 1.5;
    this.i_min = -1.5;
    this.r_min = -3;
    this.r_max = 2;
    this.max_iter = 500;
    this.escape = 4;

    this.zoom = 0;
    this.nextrow = 0;

    this.make_palette();
    this.redraw();
}

Mandelbrot.prototype = {
    make_palette: function() {
        this.palette = []
        // wrap values to a saw tooth pattern.
        function wrap(x) {
            x = (x+50 & 0xff)-200;
           // x = ((x + 256) & 0x1f5) - 256;
            if (x < 0) x = -x;
            return x;
        }
        for (i = 0; i <= this.max_iter; i++) {
            this.palette.push([wrap(i*3), wrap(i*7), wrap(i)]);
        }
    },

    draw_row: function(data) {
        var values = data.values;
        data.values[1]=3;
        var pdata = this.row_data.data;
        for (var i = 0; i < this.row_data.width; i++) {
            var pixel;
            pdata[4*i+3] = 255;
            if (values[i] < 0) {
                pdata[4*i] = 200;
                pdata[4*i+1] = 200;
                pdata[4*i+2] = 150;
            } else {
                var colour = this.palette[values[i]];
                pdata[4*i] = colour[0];
                pdata[4*i+1] = colour[1];
                pdata[4*i+2] = colour[2];
            }
        }
        this.ctx.putImageData(this.row_data, 0, data.row);
    },

    received_row: function (worker, data) {
        if (data.zoom == this.zoom) {
            // Interesting data: display it.
            this.draw_row(data);
        }
        this.process_row(worker);
    },

    process_row: function(worker) {
        var row = this.nextrow++; //fila tomada
        if (row >= this.canvas.height) {
            worker.idle = true; //cuando termine poner a todos en idle
        } else {
            worker.idle = false;
            worker.postMessage({
                row: row,
                width: this.canvas.width,
                height: this.canvas.height,
                zoom: this.zoom,
                r_min: this.r_min,
                r_max: this.r_max,
                i_min: this.i_min,
                i_max: this.i_max,
                max_iter: this.max_iter,
                escape: this.escape,
           })
        }
    },

    redraw: function() {
        this.zoom++; 
        this.nextrow = 0; //regresar a la fila 0
        for (var i = 0; i < this.workers.length; i++) {
            var worker = this.workers[i];
            if (worker.idle)
                this.process_row(worker);
        }
    },

    click: function(x, y) {
        var width = this.r_max - this.r_min;
        var height = this.i_min - this.i_max;
        var click_r = this.r_min + width * x / this.canvas.width;
        var click_i = this.i_max + height * y / this.canvas.height;

        this.r_min = click_r - width/8;
        this.r_max = click_r + width/8;
        this.i_max = click_i - height/8;
        this.i_min = click_i + height/8;
        this.redraw()
    },
}
