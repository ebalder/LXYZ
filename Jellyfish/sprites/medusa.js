

window.addEventListener('load', inicio);

window.requestAnimationFrame = (function(){ 
	"use strict";
  // return  window.requestAnimationFrame       ||
  //         window.webkitRequestAnimationFrame ||
  //         window.mozRequestAnimationFrame    ||
     return function( callback ){
            window.setTimeout(callback, 30);
          };
})();


 var i = 0,
	frame, //fotograma actual (incrementa)
	l, //rango de z
	dx, //desplazamiento de la coordenada x
	dy, //desplazamiento de la coordenada y
	a, //alfa
	s, //escala
	c, //cálculos
	steps, //capas de la medusa
	current,
	points = [], //lista de puntos actuales de la medusa
	//rrate = 50,
	ctx,
	canvas;

function inicio(){
	"use strict";
	var aux;
	for(var i in sprites.medusa){
		aux = new Image();
		aux.src = sprites.medusa[i];
		sprites.medusa[i] = aux;
	}
	aux = null;

	canvas = document.getElementById('lienzo');
	ctx = canvas.getContext('2d');

	i = 0;
	current = 0;
	frame = 0;
	l = 300;
	dx = 200;
	dy = 0;
	c = calc();

	points.push({x: c.x, y: c.y, s : c.s, a: c.a});
	steps = sprites.medusa.length - 1;
	window.requestAnimationFrame(spawn);
	// spawnI = setTimeout(spawn, rrate);
}

function spawn(){
	"use strict";
	c = calc();
	points.push({x: c.x, y: c.y, s: c.s, a: c.a});
	if(i <= steps){
		ctx.clearRect( 0, 0, canvas.width, canvas.height);
		current = 0;
		for (var k=0; k <= i; k++){
			var p = points[i-k];
			draw(ctx, p.x, p.y, p.s, p.a);
		}
		i++;
		// spawnI = setTimeout(spawn, rrate);
		window.requestAnimationFrame(spawn);
	} else {
		// playI = setTimeout(play, rrate);
		window.requestAnimationFrame(play);
	}
}
function play (){
	"use strict";
	c = calc();
	points.push({x: c.x, y: c.y, s: c.s, a: c.a});
	ctx.clearRect( 0, 0, canvas.width, canvas.height );
	current = 0;
	i = 0;
	var plen = points.length-1;
	for(i; i <= steps; i++){
		var p = points[plen - i];
		draw(ctx, p.x, p.y, p.s, p.a);
	}
	points.shift();
	if (frame >= 1260){
		frame = 0;
		// spawnI = setTimeout(spawn, rrate);
		window.requestAnimationFrame(spawn);
	} else {
		// playI = setTimeout(play, rrate);
		window.requestAnimationFrame(play);
	}
}
function calc(){
	"use strict";
	var t, //progresión de tiempo (aceleración)
		o, //frecuencia y radio de oscilación
		x, //x calculada
		y, //y calculada
		z, //z calculada
		nx, //x mostrada
		ny, //y mostrada
		px, //proyección en x (distorsión por z)
		py; //proyección en y (distorsión por z)
	frame += 0.8;
	t = frame*0.8+10*Math.cos(frame/12);
	o = 180+50*Math.cos(t/12);
	y = o*Math.cos(t/55)*0.4+260;
	x = o*Math.sin(t/40);
	z = o*Math.cos(t/40)+170;
	px = x-(x)*(z/(l+z));
	py = y-(y)*(z/(l+z));

	nx = px+dx;
	ny = py+dy;
	a = 1-(z+50)/500;
	if (a > 0.2){ a = 0.2; }
	s = 0.7*(l/(l+z));
	return {
		x: nx.toFixed(1),
		y: ny.toFixed(1),
		a: a.toFixed(2),
		s: s.toFixed(2)
	};
}
function draw(context, x, y, s, a){
	"use strict";
	var img = sprites.medusa[current];
	var width = img.width*s;
	var height = img.height*s;
	context.globalAlpha = a;
	context.drawImage(img, x - width/2, y - height/2, width, height);
	current ++;
}