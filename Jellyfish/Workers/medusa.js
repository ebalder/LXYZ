
window.addEventListener('load', inicio);


function Jellyfish(calc, stage){
	self = this;
	this.current = 0;
	this.stage = stage;
	this.x = calc.x;
	this.y = calc.y;
	this.scale = calc.s;
	this.alpha = calc.a;
	this.workers = []; //calculate tentacle layers
	this.maxWorkers = 3;
	this.steps = [];
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
		if(self.current <= self.circles.length){
			self.redraw[0]();
		} else if (self.current > self.circles.length && 
		self.current <= self.circles.length + self.tentacles){
			if(self.workers.length >= self.maxWorkers){
				var len = self.workers.length;
				var i = 0;
				for(; i < len; i++){
					if(self.workers[i].idle){
						self.current++;
						setTimeout(self.animate, 5);
						break;
					}
				}
				if (i >= self.workers.length) {
					self.current ++;
					return 0; //if too busy, skip this layer
				} 
			} else {
				var i = self.workers.length;
				var worker = new Worker('worker.js');
				worker.onmessage = self.refresh;
				self.workers.push(worker);
			}
			var data = {
				curdot : self.current - self.circles.length,
				scale : self.scale,
				dots : self.dots,
				x : self.x,
				y : self.y,
				alpha : self.alpha
			};
			self.workers[i].idle = false;
			self.workers[i].postMessage(data);
		}
		self.current ++;
	},
	redraw : [
		function(){
			self.context.strokeStyle = 'rgba(0,0,0,'+ self.alpha +')';
			self.context.beginPath();
			self.context.arc(self.x, self.y, (self.circles[self.current])*self.scale, 0, 7, false);
			self.context.stroke();
		},
		function(ev){
			ev.target.idle = true;
			var d = ev.data;
			// console.log(d.dots);
			self.context.save();
			//self.context.translate(d.x, d.y);
			self.context.rotate(d.rotate); 
			self.context.fillStyle = 'rgba(0, 0, 0, ' + d.alpha + ')';
			var len = d.dots.length;
			var i = 0;
			for(; i < len; i+=2){  
				self.context.beginPath();
				self.context.arc(d.dots[i] + d.x, d.dots[i+1] + d.y, 
					d.scale, 7, false);
				self.context.fill();
			}
			self.context.restore();
		},
	],
	refresh : function(ev){
		self.steps[ev.data.curdot] = ev.data;
	}
}

function inicio(){
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
		canvas = document.getElementById('lienzo');
		stage = new Kinetic.Stage({
			container : 'wrapCanvas',
			width: 800,
			height: 500
		});
		layer = new Kinetic.Layer();
		

	i = 1;
	frame = 0;
	l = 300;
	dx = 200;
	dy = 0;

	var calc = new Calculation();
	jellyfish = new Jellyfish(calc(), stage);
	steps = jellyfish.tentacles + jellyfish.circles.length;

	var head = new Kinetic.Layer();
	stage.add(head);
	var spawn = new Kinetic.Animation(spawn, head);
	spawn.start();

	function spawn(frame){
		var p = calc();
		jellyfish.current = 0;
		//jellyfish.animate(p);
		if (i < jellyfish.circles.length){
			var layer = this.layers[0];
			layer.setAbsolutePosition(p.nx, p.ny);
			var circle = new Kinetic.Circle({
				x : (points.length > 0 ? points[0].attrs.x :  p.nx),
				y : (points.length > 0 ? points[0].attrs.y : p.ny),
				radius : jellyfish.circles[i] * p.s,
				stroke : 'black',
				strokeWidth: 4,
				opacity : p.a
			});
			points.push(circle);
			var k = 0;
			for(k; k <= i; k++){
				
			}
		} else if (i <= steps) {
			this.stop();
			var layer = new Kinetic.Layer();
			var layer = new Kinetic.Layer();
			var circle = new Kinetic.Circle({
				x : p.nx,
				y : p.ny,
				radius : 2-(i * 0.012) * p.s,
				fill : 'black',
				opacity : p.a
			});
			this.addLayer(layer);
			stage.add(layer);
		} else {

		}

		// for (var k=0; k <= i; k++){
		// 	jellyfish.x = points[i-k].x.toFixed(1);
		// 	jellyfish.y = points[i-k].y.toFixed(1);
		// 	jellyfish.scale = s.toFixed(2);
		// 	jellyfish.alpha = a.toFixed(2);
		// 	jellyfish.animate();
		// }
		layer.add(circle);
		i++;
	}
	function play (){
		calc();
		points.push({x: nx, y: ny});
		ctx.clearRect( 0, 0, canvas.width, canvas.height );
		//jellyfish.current = 0;
		i = 1;
		while (i <= steps){
			jellyfish.x = points[points.length-i].x.toFixed(1);
			jellyfish.y = points[points.length-i].y.toFixed(1);
			jellyfish.scale = s.toFixed(2);
			jellyfish.alpha = a.toFixed(2);
			jellyfish.animate();
			i++;
		}
		if (frame >= 100/*1260*/){
			i = 1;
			frame = 0;
			requestAnimationFrame(spawn);
		} else {
			requestAnimationFrame(play);
		}
	}
	/*get properties for the next position of the jellyfish*/
	function Calculation(){
		var frame = 0;
		var t, o, y, x, z, px, py, nx, ny, a, s;
		return function(){
			frame += 0.8;

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
			s = 1.5*(l/(l+z));
			return {
				nx : nx,
				ny : ny,
				s : s,
				a : a
			}
		}
	}
}

