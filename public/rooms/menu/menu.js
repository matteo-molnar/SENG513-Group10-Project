let roomsArray;
let rooms_count = 0;
let canvas_room_str = "Canvas Room ";
socket.on('roomData', function(data) {
	roomsArray = data;
	//rooms_count = roomsArray.length;
	console.log(roomsArray.length);
	var i;
	for(i = rooms_count + 1; i <= roomsArray.length; i++){
		let element = $('<li>');
		let checkbox = document.createElement('input');
		let element_add = $('#btn-add-li');
		let myButton = document.createElement('button');
		//rooms_count = i + 1;

        let checkbox_id = 'checkbox' + i;
		let button_id = 'btn' + i;
		let button_txt = roomsArray[i-1].id;
		console.log(button_txt);
		let button_class = '';
		if(i%5===0){
			button_class = "\"btn btn-secondary\"";
		}
		else if(i%5===1){
			button_class = "\"btn btn-primary\"";
		}
		else if(i%5===2){
			button_class = "\"btn btn-success\"";
		}
		else if(i%5===3){
			button_class = "\"btn btn-warning\"";
		}
		else{
			button_class = "\"btn btn-danger\"";
		}
		//console.log(button_class);
		checkbox = "<input type=\"checkbox\" id=" + checkbox_id +  ">";
		myButton = "<button id =" + button_id + " type=\"button\" class="+ button_class +">" + button_txt + "</button>";
		element.append(checkbox);
		element.append(myButton);
		element.insertBefore(element_add);
		//add event listener for button
		document.getElementById(button_id).addEventListener('click', function(){
			$("#includedContent").load("/rooms/canvases/canvas.html");
			setIntent($('#'+button_id).text());
		})

		//add event listener for checkbox
        document.getElementById(checkbox_id).addEventListener( 'change', function() {
            if(this.checked) {
                console.log(checkbox_id + ' is checked');
            } else {
                // Checkbox is not checked..
            }
        });
	}
	rooms_count = roomsArray.length;
});
//not used?
function gotoroom(room){
	let room_str = room;
	$('#btn4').on('click', function(){
		$("#includedContent").load("/rooms/canvases/canvas.html");
		setIntent($('#btn4').text());
	})
}
$('#btn-add').on('click', function(){
    let room_name = prompt("Please enter name of canvas room", "ex. The Matrix");
	rooms_count++;//increment rooms count
	console.log(canvas_room_str + rooms_count);
	let element = $('<li>');
    let checkbox = document.createElement('input');
	let element_add = $('#btn-add-li');

	let myButton = document.createElement('button');
    let checkbox_id = 'checkbox' + rooms_count;
	let button_id = 'btn' + rooms_count;
	let button_txt = room_name;
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

    checkbox = "<input type=\"checkbox\" id=" + checkbox_id +  ">";
	myButton = "<button id =" + button_id + " type=\"button\" class="+ button_class +">" + button_txt + "</button>";
    element.append(checkbox);
	element.append(myButton);
	element.insertBefore(element_add);
	document.getElementById(button_id).addEventListener('click', function(){
		$("#includedContent").load("/rooms/canvases/canvas.html");
		setIntent($('#'+button_id).text());
	})

    //add event listener for checkbox
    document.getElementById(checkbox_id).addEventListener( 'change', function() {
        if(this.checked) {
            console.log(checkbox_id + ' is checked');
        } else {
            // Checkbox is not checked..
        }
    });

	socket.emit('makeRoom', {
		'name': room_name,
		'path': 'stock_apple.png'
	})
})