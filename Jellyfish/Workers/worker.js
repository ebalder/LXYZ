/* Forma cadenas con la configuración de los polígonos */
self.onmessage = function(ev){
    var d = ev.data;
    var curdot = d.curdot;
    var rotate = curdot * 0.02; 
    var dispersion = 0.7+curdot*curdot*0.001;
    dispersion.toFixed(0);
    var scale = (2-(curdot*0.012))*d.scale;
    scale.toFixed(1);
    var len = d.dots.length;
    var i = 0;
    var dots = [];
    for(;i < len; i++){  
        dots.push(d.dots[i].x * dispersion); 
        dots.push(d.dots[i].y * dispersion);
    }
    var data = {
        rotate : rotate,
        dots : dots,
        scale : scale,        
        x : d.x,
        y : d.y,
        alpha : d.alpha
    }
    self.postMessage(data);
}
