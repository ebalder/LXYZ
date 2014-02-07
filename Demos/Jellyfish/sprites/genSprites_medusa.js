
window.addEventListener('load', inicio);

var
	i, //contador genérico
	frame = 0, //fotograma actual (incrementa)
	l, //rango de z
	dx, //desplazamiento de la coordenada x
	dy, //desplazamiento de la coordenada y
	t, //progresión de tiempo (aceleración)
	o, //frecuencia y radio de oscilación
	x, //x calculada
	y, //y calculada
	z, //z calculada
	px, //proyección en x (distorsión por z)
	py, //proyección en y (distorsión por z)
	nx, //x mostrada
	ny, //y mostrada
	a, //alfa
	s, //escala
	jellyfish, //objeto de animación
	steps, //capas de la medusa
	points = []; //lista de puntos actuales de la medusa
	written = false;
	uris = [];
	rrate = 50;

function Jellyfish(x, y, context){
	self = this;
	this.current = 0;
	this.context = context;
	this.x = x;
	this.y = y;
	this.scale = 2;
	this.alpha = 1;
}
Jellyfish.prototype = {
	tentacles : 100,
	dots : [
		{x : 7, 	y: -3},
		{x : 3, 	y: -5},
		{x : 7, 	y: 4},
		{x : 1, 	y: 5},
		{x : 4, 	y: 1},
		{x : -6,	y: -3},
		{x : -2, 	y: -7},
		{x : -1, 	y: -1},
		{x : -8, 	y: 2},
		{x : -4, 	y: 7},
	],
	circles : [
		5, 12, 17, 22, 25, 27, 24, 15
	],
	animate : function(){
		if(this.current <= this.circles.length){
			this.redraw[0]();
		} else if (this.current > this.circles.length && 
		this.current <= this.circles.length + this.tentacles){
			this.redraw[1]();
		}
		this.current ++;
	},
	redraw : [
		function(){
			self.context.strokeStyle = 'rgba(0,0,0,'+ self.alpha +')';
			self.context.lineWidth = 1.5;
			self.context.beginPath();
			self.context.arc(self.x, self.y, (self.circles[self.current])*self.scale, 0, 7, false);
			self.context.stroke();
		},
		function(){
			self.context.save();
			var curdot = self.current - self.circles.length;
			self.context.translate(self.x, self.y);
			self.context.rotate(curdot * 0.02); 
			var dispersion = 0.7 + curdot*curdot*0.001;
			dispersion.toFixed(0);
			self.context.fillStyle = 'rgba(0, 0, 0, ' + self.alpha + ')';
			var scale = (2-(curdot*0.012))*self.scale;
			scale.toFixed(1);
			function cycle(){
				i=0;
				for(var i in self.dots){  
					self.context.beginPath();
					self.context.arc(self.dots[i].x * dispersion, self.dots[i].y * dispersion, 
						scale, 7, false);
					self.context.fill();
				}
			}
			cycle();
			self.context.restore();
		},
	]
}

function inicio(){
	canvas = document.getElementById('lienzo');
	ctx = canvas.getContext('2d');

	i = 1;
	frame = 0;
	l = 300;
	dx = 200;
	dy = 0;

	calc();
	points.push({x: nx, y: ny});
	jellyfish = new Jellyfish(points[0].x, points[0].y, ctx);
	steps = jellyfish.tentacles + jellyfish.circles.length;

	//spawnI = setTimeout(spawn, 40);
	playI = setTimeout(play, rrate);
}

function spawn(){
	calc();
	points.push({x: nx, y: ny});
	if(i <= steps){
		ctx.clearRect( 0, 0, canvas.width, canvas.height);
		jellyfish.current = 0;
		for (var k=0; k <= i; k++){
			jellyfish.x = points[i-k].x.toFixed(1);
			jellyfish.y = points[i-k].y.toFixed(1);
			jellyfish.scale = s.toFixed(2);
			jellyfish.alpha = a.toFixed(2);
			jellyfish.animate();
		}
		i++;
		spawnI = setTimeout(spawn, rrate);
	} else {
		playI = setTimeout(play, rrate);
	}
}
function play (){
	//calc();
	points.push({x: nx, y: ny});
	ctx.clearRect( 0, 0, canvas.width, canvas.height );
	i = 0;
	// while (i <= steps){
		// jellyfish.x = points[points.length-i].x.toFixed(1);
		// jellyfish.y = points[points.length-i].y.toFixed(1);
		jellyfish.x = canvas.width/2;
		jellyfish.y = canvas.height/2;
		// jellyfish.scale = s.toFixed(2);
		// jellyfish.alpha = a.toFixed(2);
		jellyfish.animate();
		i++;
	// }
	if(jellyfish.current <= steps){
		if(!written){
			uris.push("\n'"+canvas.toDataURL("image/png")+"'");
		}
	} else {
		if (!written){
			console.log("var sprites = { medusa:["+uris.toString()+"]\n};");
			written = true;
		}
		jellyfish.current = 0;
	}
	playI = setTimeout(play, rrate);
}
function calc(){
	frame += 1;
	if (frame >= 1260){
		frame = 0;
		spawnI = requestAnimationFrame(spawn, canvas);
	}
	t = frame*0.8+7*Math.cos(frame/10);
	o = 180+50*Math.cos(t/12);
	y = o*Math.cos(t/55)*0.4+260;
	x = o*Math.sin(t/40);
	z = o*Math.cos(t/40)+170;
	 px = x-(x)*(z/(l+z));
	 py = y-(y)*(z/(l+z));

	 nx = px+dx;
	 ny = py+dy;
	a = 1-(z+50)/500;
	a > 0.2
		? a = 0.2
		: null;
	s = 0.5*(l/(l+z));
}