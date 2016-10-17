var windows = [];
var regions = [];
var windowMoveInterval;

var ERROR_Y = 25;
var ERROR_X = 0;

var windowAttrs = {};
windowAttrs.marginX = 0;
windowAttrs.marginY = 65;
windowAttrs.width = screen.width/3 - windowAttrs.marginX;
windowAttrs.height = screen.height/2 - windowAttrs.marginY;
windowAttrs.top = 0;
windowAttrs.left = 0;
windowAttrs.bottom = 460;
windowAttrs.middle = Math.floor(screen.width/2 - windowAttrs.width/2);
windowAttrs.right = screen.width - windowAttrs.width;



var events = {
	mousedown : false,
}



function Position(x,y){
	this.x = x;
	this.y = y;
}

(function(){
	this.equals = function(x,y,errorX, errorY){
		return Math.abs(this.x - x) <= errorX && Math.abs(this.y - y) <= errorY
	};
}).call(Position.prototype);

function WindowFrame(window, position, index){
	this.window = window;
	this.position = position;
	this.oldPosition = new Position(this.window.screenX, this.window.screenY);
	this.movedTimer = null;
	this.index = index;
	this.ready = false;
}

(function() {
    this.snap = function() {
        var x = this.position.x;
		var y = this.position.y;
		this.window.moveTo(x,y);
    };
    this.close = function(){
    	this.window.close();
    };
    this.moving = function(){
    	return this.oldPosition.equals(this.window.screenX, this.window.screenY, ERROR_X, ERROR_Y)
    }
    this.changedPosition = function(){
    	return !this.position.equals(this.window.screenX, this.window.screenY, ERROR_X, ERROR_Y)
    }
    this.checkMoved = function(){
    	if(this.changedPosition() && !this.moving()){
    		clearTimeout(this.movedTimer);
    		this.movedTimer = setTimeout(this.movedHandler.bind(this), 100);
    	}
    	this.oldPosition = new Position(this.window.screenX, this.window.screenY);
    };
    this.movedHandler = function(){
    	for (var i = windows.length - 1; i >= 0; i--) {
    		if(this.in(windows[i]) && this.index != i){
    			console.log(this.index, " in " + i);
    			this.switchWindows(windows[i]);
    			return;
    		}
    	}

    	this.snap();
    }
    this.switchWindows = function(windowFrame){
    	var pos = this.position;
		var index = this.index;
		this.position = windowFrame.position;
		windowFrame.position = pos;
		this.index = windowFrame.index;
		windowFrame.index = index;
		this.snap();
		windowFrame.snap();
		this.oldPosition = new Position(this.window.screenX, this.window.screenY);
		windowFrame.oldPosition = new Position(windowFrame.window.screenX, windowFrame.window.screenY);
    }
    this.in = function(windowFrame){
    	var centerX = (this.window.screenX+this.window.screenX+this.window.outerWidth)/2;
    	var centerY = (this.window.screenY+this.window.screenY+this.window.outerHeight)/2;
    	return ((centerX >= windowFrame.window.screenX && (centerX <= windowFrame.window.screenX + windowFrame.window.outerWidth)
    		&&  (centerY >= windowFrame.window.screenY && (centerY <= windowFrame.window.screenY + windowFrame.window.outerHeight))));
    };
}).call(WindowFrame.prototype);

function openWindow(ref, index, x, y, width, height){
	var windowFeatures = [];
	windowFeatures.push("left="+x);
	windowFeatures.push("top="+y);
	windowFeatures.push("width="+width);
	windowFeatures.push("height="+height);
	windowFeatures.push("toolbar=no");
	windowFeatures.push("menubar=no");
	windowFeatures.push("resizable=yes");
	windowFeatures.push("titlebar=no");
	return window.open("./windows/inner"+index+".html", ref, windowFeatures.join(","));
}

function drawAllWindows(){
	for(var i = 1; i <= 6; i++){
		var y = 0;
		var x = 0;
		if(i%2 == 1){
			//top
			y = windowAttrs.top;
		}else{
			//bottom
			y = windowAttrs.bottom
		}
		if(i%3==1){
			//left
			x = windowAttrs.left;
		}else if(i%3==2){
			//middle
			x = windowAttrs.middle;
		}else{
			//right
			x = windowAttrs.right;
		}
		windows.push(new WindowFrame(openWindow("Inner" + i, i, x, y, windowAttrs.width, windowAttrs.height), new Position(x,y), i-1));

	}
}

function closeAllWindows(){
	for (var i = windows.length - 1; i >= 0; i--) {
		windows[i].close();
		windows.pop();
	}
}

function allWindowsStationary(){
	var allStationary = true;
	for (var i = windows.length - 1; i >= 0; i--) {
	   allStationary = allStationary && !windows[i].moving();
	}
	return allStationary;
}

function checkWindowMove(){
	for (var i = windows.length - 1; i >= 0; i--) {
	   if(windows[i].ready){
	   		windows[i].checkMoved();
	   }
	}
}

function init(){
	$("#start-end-button").click(function(){
		if($(this).hasClass("start")){
			if(!windows.length){
				drawAllWindows();
			}
			$(this).toggleClass('start').toggleClass('end');
		}else if($(this).hasClass("end")){
			closeAllWindows();
			$(this).toggleClass('start').toggleClass('end');
		}
	});
	window.addEventListener("mouseout", function(evt){ 
	  if (evt.toElement === null && evt.relatedTarget === null) {
	    //if outside the window...
	    windowMoveInterval = setInterval(checkWindowMove, 150);
	  } else {
	    //if inside the window...
	    clearInterval(windowMoveInterval);
	  }
	});
}

$(init);