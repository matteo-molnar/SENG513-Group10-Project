let roomsArray;
let rooms_count = 0;
let canvas_room_str = "Canvas Room ";
window.onload = loadRooms();

function loadRooms(){

	console.log('load rooms');
	var pathname = window.location.pathname; // Returns path only
	let home_url = window.location.href;     // Returns full URL
	console.log(pathname);
	console.log(home_url);
	$.ajax({
		url: "/rooms.json",
		async: false,
		dataType: 'json',
		success: function(data) {
			roomsArray = data;
			rooms_count = roomsArray.length;
		}
	});

	console.log(roomsArray.length);
	var i;
	for(i = 0; i < roomsArray.length; i++){
		let element = $('<li>');
		let element_add = $('#btn-add-li');
		let myButton = document.createElement('button');
		rooms_count = i + 1;
		let button_id = 'btn' + rooms_count;
		let button_txt = canvas_room_str + rooms_count;
		let button_class = '';
		if(rooms_count%5===0){
			button_class = "\"btn btn-secondary\"";
		}
		else if(rooms_count%5===1){
			button_class = "\"btn btn-primary\"";
		}
		else if(rooms_count%5===2){
			button_class = "\"btn btn-success\"";
		}
		else if(rooms_count%5===3){
			button_class = "\"btn btn-warning\"";
		}
		else{
			button_class = "\"btn btn-danger\"";
		}
		//console.log(button_class);
		myButton = "<button id =" + button_id + " type=\"button\" class="+ button_class +">" + button_txt + "</button>";

		element.append(myButton);
		element.insertBefore(element_add);

		document.getElementById(button_id).addEventListener('click', function(){
			$("#includedContent").load("/rooms/canvases/canvas.html");
			setIntent($('#'+button_id).text());
		})

		// socket.emit('makeRoom', {
		//     'name': canvas_room_str + rooms_count,
		//     'path': 'stock_apple.png'
		// })
	}
}

//not used?
function gotoroom(room){
	let room_str = room;
	$('#btn4').on('click', function(){
		$("#includedContent").load("/rooms/canvas.html");
		setIntent($('#btn4').text());
	})
}

$('#btn-add').on('click', function(){
	rooms_count++;//increment rooms count
	console.log(canvas_room_str + rooms_count);

	let element = $('<li>');
	let element_add = $('#btn-add-li');
	let myButton = document.createElement('button');
	let button_id = 'btn' + rooms_count;
	let button_txt = canvas_room_str + rooms_count;
	let button_class = '';
	if(rooms_count%5===0){
		button_class = "\"btn btn-secondary\"";
	}
	else if(rooms_count%5===1){
		button_class = "\"btn btn-primary\"";
	}
	else if(rooms_count%5===2){
		button_class = "\"btn btn-success\"";
	}
	else if(rooms_count%5===3){
		button_class = "\"btn btn-warning\"";
	}
	else{
		button_class = "\"btn btn-danger\"";
	}
	//console.log(button_class);
	myButton = "<button id =" + button_id + " type=\"button\" class="+ button_class +">" + button_txt + "</button>";

	element.append(myButton);
	element.insertBefore(element_add);

	document.getElementById(button_id).addEventListener('click', function(){
		$("#includedContent").load("/rooms/canvases/canvas.html");
		setIntent($('#'+button_id).text());
	})

	socket.emit('makeRoom', {
		'name': canvas_room_str + rooms_count,
		'path': 'stock_apple.png'
	})
})