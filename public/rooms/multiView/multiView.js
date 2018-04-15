
debug = false;
let scale = .5;
	//createCanvas;
    //var canvas = document.getElementsByClassName('whiteboard')[0];
    //var colors = document.getElementsByClassName('color');
    //var context = canvas.getContext('2d');
    //canvas.width = 720;
    //canvas.height = 480;

	
    //var offsetList = [];
	//let listOfContext = [];
	let listOfConvas = [];
	let listOfRooms = [];
    $(document).ready(function(){
		socket.emit('getCanvas',checkedList);
	});
	
	





   

    socket.on('multiDrawing', onMultiDrawingEvent);// have to do
	socket.on('canvasFromServer', setUpCanvas);

    //window.addEventListener('resize', updateOffset, false);
	
	function setUpCanvas(data){
		let counter = 0;
		data.forEach(function(nameCanvasPair){
			
			
			var canvas = document.createElement('canvas');
			var div = document.createElement('div');
			div.classList.add('multiView');
			canvas.width = 720*scale;
			canvas.height = 480*scale;
			div.id = "canvasContainer" + counter;
			canvas.classList.add('whiteboard');
			canvas.addEventListener("click",function(){
				
				$("#includedContent").load("/rooms/canvases/canvas.html");
				setIntent(nameCanvasPair.name);
			});
			
			
			var roomTitle = document.createElement('h3');
			roomTitle.innerText = nameCanvasPair.name;
			div.appendChild(roomTitle);
			div.appendChild(canvas);
			
			listOfRooms.push(nameCanvasPair.name);
			listOfCanvas[nameCanvasPair.name] = {
				container : counter,
				canvas : canvas,
				context : canvas.getContext('2d'),
				offset : 0
				
			};
			swapACanvas(nameCanvasPair.name,nameCanvasPair.encoding);
			
			var list = document.getElementById('listOfCanvas');
			list.appendChild(div);
			counter++;
			
			
		});
		//updateOffset();

		
	};

    //Modified to draw points from top left of canvas instead of page
    function drawLine(name,x0, y0, x1, y1, color, emit){
        listOfCanvas[name].context.beginPath();
        listOfCanvas[name].context.moveTo((x0 + $("#canvasContainer" + listOfCanvas[name].container).scrollLeft()), y0);
        listOfCanvas[name].context.lineTo((x1 + $("#canvasContainer" + listOfCanvas[name].container).scrollLeft()), y1);
        listOfCanvas[name].context.strokeStyle = color;
        listOfCanvas[name].context.lineWidth = 2*scale;
        listOfCanvas[name].context.stroke();
        listOfCanvas[name].context.closePath();


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

    function onMultiDrawingEvent(info){
        debug && console.log('onDrawingEvent');
		console.log('drawing');
        var w = listOfCanvas[info.name].canvas.width;
        var h = listOfCanvas[info.name].canvas.height;
        drawLine(info.name, info.canvasData.x0 * w, info.canvasData.y0 * h, info.canvasData.x1 * w, info.canvasData.y1 * h, info.canvasData.color);
    }

    // update the position relative screen corners
   /* function updateOffset() {
		listOfRooms.forEach(function(name){
			console.log(name);
			listOfCanvas[name].offset = listOfCanvas[name].canvas.offset();
			console.log('offset ' +listOfCanvas[name].offset.top );

			
		});
    }*/

    function swapACanvas(name,data){
        if (data) {
            decodeCanvas(data, listOfCanvas[name].canvas, listOfCanvas[name].context);
            debug && console.log(data);
        }

        function decodeCanvas(d, canv, cont) {
            let img = new Image();
            img.src = d;
            img.onload = function() {
                canv.width = 720*scale;
                canv.height = 480*scale;
                cont.drawImage(img, 0, 0, 720, 480,
				0,0,canv.width,canv.height);
            }
        }
    }
//}
