// 'use strict';

debug = false;
// var socket = io();

// function setIntent(roomName) {
//     io.intent = roomName;
//     console.log('intent set: ' + io.intent);
// }

// function joinRoom(roomName) {
//     socket.emit('subscribe', roomName);

    // var socket = io();
    var canvas = document.getElementsByClassName('whiteboard')[0];
    var colors = document.getElementsByClassName('color');
    var context = canvas.getContext('2d');
    canvas.width = 720;
    canvas.height = 480;

    var divPos = {};
    var offset;
    updateOffset();

    $(document).ready(updateOffset);


    $(document).mousemove(function(e){
        //console.log('mousemove');
        //console.log("offset" + offset.left+", "+offset.top);
        //console.log("e"+e.pageX+", "+e.pageY);
        divPos = {
            left: e.pageX - offset.left,
            top: e.pageY - offset.top
        };
        //console.log("divPos"+divPos.left+", "+divPos.top);
    });





    var current = {
        color: 'black'
    };


    var drawing = false;



    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
	canvas.addEventListener('touchstart', onTouch, false);
	canvas.addEventListener('touchmove', onTouchMove, false);
	canvas.addEventListener('touchend', onTouchLift, false);


    for (var i = 0; i < colors.length; i++){
        colors[i].addEventListener('click', onColorUpdate, false);
    }

    socket.on('drawing', onDrawingEvent);
    socket.on('history', swapCanvas);
	socket.on('clearCanvas',function(img){
		context.clearRect(0,0,canvas.width,canvas.height);
	});

	$('#clrBtn').on('click', function(){
		context.clearRect(0,0,canvas.width,canvas.height);
		let canvasData = canvas.toDataURL();
		socket.emit('clrCanvas', {
			canvas: canvasData
		});
	});

	$('#dlBtn').on('click',function(e){
		let data = context.getImageData(0, 0, canvas.width, canvas.height);
		let compositeOperation = context.globalCompositeOperation;
		context.globalCompositeOperation = "destination-over";
		context.fillStyle = "white";
		context.fillRect(0,0,canvas.width,canvas.height);
		$('#dlBtn').attr("href",canvas.toDataURL('image/png'));
		$('#dlBtn').attr("download",roomName + ".png");

		//clear the canvas
		context.clearRect (0,0,canvas.width,canvas.height);

		//restore it with original / cached ImageData
		context.putImageData(data, 0,0);

		//reset the globalCompositeOperation to what it was
		context.globalCompositeOperation = compositeOperation;


		console.log('hi');

	});

    window.addEventListener('resize', updateOffset, false);

    //Modified to draw points from top left of canvas instead of page
    function drawLine(x0, y0, x1, y1, color, emit){
        context.beginPath();
        context.moveTo(x0 + $("#canvasContainer").scrollLeft(), y0);
        context.lineTo(x1 + $("#canvasContainer").scrollLeft(), y1);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();

        if (!emit) { return; }
        var w = canvas.width;
        var h = canvas.height;

        let canvasData = canvas.toDataURL();
        socket.emit('drawing', {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color
        });
    }

	function onTouch(event){
		if(event.touches.length == 1){
			current.x = event.targetTouches[0].pageX - offset.left;
			current.y = event.targetTouches[0].pageY - offset.top;
			console.log("touch" + current.x + ", " + current.y);
		}
	}

	function onTouchMove(event){
		event.cancellable = true;
		if(event.touches.length >1){
			console.log("touchMove2");

		}else{
			event.preventDefault();
			let newX = event.targetTouches[0].pageX - offset.left;
			let newY = event.targetTouches[0].pageY - offset.top;
			//console.log("touchCOORD" + newX + ", " + newY);

			drawLine(current.x,current.y,newX,newY,current.color,true);
			current.x = newX;
			current.y = newY;
		}
	}



	function onTouchLift(event){
		if(event.touches.length == 0 ){

			let newX = event.changedTouches[0].pageX - offset.left;
			let newY = event.changedTouches[0].pageY - offset.top;
			console.log("LIFT" + newX + ",  " +newY)
			drawLine(current.x,current.y,newX,newY,current.color,true);
			current.x = newX;
			current.y = newY;
		}else if (event.touches.length == 1){
			event.preventDefault();
			current.x = event.targetTouches[0].pageX - offset.left;
			current.y = event.targetTouches[0].pageY - offset.top;

		}

	}

    function onMouseDown(e){
        drawing = true;
        current.x = divPos.left;
        current.y = divPos.top;
    }

    function onMouseUp(e){
        if (!drawing) { return; }
        drawing = false;
        drawLine(current.x, current.y, divPos.left, divPos.top, current.color, true);
    }

    function onMouseMove(e){
        if (!drawing) { return; }
        drawLine(current.x, current.y, divPos.left, divPos.top, current.color, true);
        current.x = divPos.left;
        current.y = divPos.top;
    }

    function onColorUpdate(e){
        current.color = e.target.className.split(' ')[1];
    }

    // limit the number of events per second
    function throttle(callback, delay) {
        var previousCall = new Date().getTime();
        return function() {
            var time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

    function onDrawingEvent(data){
        debug && console.log('onDrawingEvent');
        var w = canvas.width;
        var h = canvas.height;
        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }

    // update the position relative screen corners
    function updateOffset() {
        offset = $('.whiteboard').offset();
    }

    function swapCanvas(data){
        if (data) {
            decodeCanvas(data, canvas, context);
            debug && console.log(data);
        }

        function decodeCanvas(d, canv, cont) {
            let img = new Image();
            img.src = d;
            img.onload = function() {
                canv.width = 720;
                canv.height = 480;
                cont.drawImage(img, 0, 0);
            }
        }
    }
//}
