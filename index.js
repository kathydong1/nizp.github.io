(function(w){
	var Drag = function (id){
		this.box = document.getElementById(id);
		this.disX = 0;
		this.disY = 0;
	}
	
	Drag.prototype.init = function(){
		var _this = this;
		this.box.addEventListener('mousedown',function(ev){
			_this.fnDown(ev);
			
		});
	}
	Drag.prototype.fnDown = function(ev){
		this.disX = ev.pageX - this.box.offsetLeft;
		this.disY = ev.pageY - this.box.offsetTop;
		var _this = this;
		document.addEventListener('mousemove',move1);
		document.addEventListener('mouseup',up1);
		
		function up1(){
			_this.fnUp(move1,up1);
		}
		function move1(ev){
			_this.fnMove(ev);
		}
		
		ev.preventDefault();
	}
	
	Drag.prototype.fnMove = function(ev){
		this.box.style.left= ev.pageX - this.disX + 'px';
		this.box.style.top= ev.pageY - this.disY + 'px';
		
	}
	
	Drag.prototype.fnUp = function(move1,up1){
		document.removeEventListener('mousemove',move1);
		document.removeEventListener('mouseup',up1);
	}
	
	
	
	w.Drag = Drag;
})(window);
