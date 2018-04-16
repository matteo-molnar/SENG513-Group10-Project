let roomsArray;
let rooms_count = 0;
let canvas_room_str = "Canvas Room ";

$("#view-btn").on("click",function(){
	var listItems = $(":checkbox");
	listItems.each(function(index){
		if($(this).is(':checked')){
			let name = $(this).attr('id');
			console.log(name);	

			let parsedName = name.substring(3);
			checkedList.push(parsedName);
		}
		
	});
	
	$("#includedContent").load("/rooms/multiView/multiView.html");

});
socket.on('roomData', function(data) {
	roomsArray = data;
	//rooms_count = roomsArray.length;
	console.log(roomsArray.length);
	var i;
	for(i = rooms_count + 1; i <= roomsArray.length; i++){
		let element = $('<li>');
		let channelElement = document.createElement('div');
		channelElement.classList.add('checkRect');
		let checkbox = document.createElement('input');
		let element_add = $('#btn-add-li');
		let myButton = document.createElement('button');
		//rooms_count = i + 1;

		let button_id = 'btn' + i;
		let button_txt = roomsArray[i-1].id;
		let checkbox_id = 'chk'+ button_txt;

		console.log(button_txt);
		
		//console.log(button_class);
		checkbox.type="checkbox";
		checkbox.id=checkbox_id;
		checkbox.classList.add("checkmark");
		//checkbox = "<input type=\"checkbox\" id=\"" + checkbox_id +  "\" class=\"checkmark\">";
		channelElement.appendChild(checkbox);
		myButton.id = button_id;
		myButton.type="button";
		myButton.classList.add("channelButton");
		myButton.innerHTML = button_txt;
		//myButton = "<button id =" + button_id + " type=\"button\" class=\"channelButton\">" + button_txt + "</button>";
		channelElement.appendChild(myButton);
		element.append(channelElement);
		element.insertBefore(element_add);
		//add event listener for button
		document.getElementById(button_id).addEventListener('click', function(){
			$("#includedContent").load("/rooms/canvases/canvas.html");
			setIntent($('#'+button_id).text());
		})

		
	}
	rooms_count = roomsArray.length;
});


function previewFile() {
    var preview = document.querySelector('img');
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();

    reader.addEventListener("load", function () {
        preview.src = reader.result;
    }, false);

    if (file) {
        reader.readAsDataURL(file);
        console.log(reader);
    }
}

$('#createRoomBtn').on('click', function(){
    let room_name = document.getElementById('roomNameInput').value;
	rooms_count++;//increment rooms count
	console.log(canvas_room_str + rooms_count);
	let element = $('<li>');
    let channelElement = document.createElement('div');
	channelElement.classList.add('checkRect');
	let checkbox = document.createElement('input');
	let element_add = $('#btn-add-li');

	let myButton = document.createElement('button');
	let button_id = 'btn' + rooms_count;
	let button_txt = room_name;
	let checkbox_id = 'chk' + button_txt;

	


	
	
    checkbox.type="checkbox";
	checkbox.id=checkbox_id;
	checkbox.classList.add("checkmark");
	//checkbox = "<input type=\"checkbox\" id=\"" + checkbox_id +  "\" class=\"checkmark\">";
	channelElement.appendChild(checkbox);
	myButton.id = button_id;
	myButton.type="button";
	myButton.classList.add("channelButton");
	myButton.innerHTML = button_txt;
	//myButton = "<button id =" + button_id + " type=\"button\" class=\"channelButton\">" + button_txt + "</button>";
	channelElement.appendChild(myButton);
	element.append(channelElement);
	element.insertBefore(element_add);
	//add event listener for button
	document.getElementById(button_id).addEventListener('click', function(){
		$("#includedContent").load("/rooms/canvases/canvas.html");
		setIntent($('#'+button_id).text());
	})
   

	socket.emit('makeRoom', {
		'name': room_name,
		'path': 'stock_apple.png'
	})
})
