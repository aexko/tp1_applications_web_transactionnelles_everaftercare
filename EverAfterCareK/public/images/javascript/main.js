// var _request = new XMLHttpRequest();
// _request.open('GET', 'https://api.github.com/users');
// _request.onload = function() {
//     var _data = JSON.parse(_request.responseText);
// }
// _request.send();

// function renderHTML(data) {
//     var htmlString = "";

// }

async function start() {
	const res = await fetch("https://api.github.com/users");
	const data = await res.json();
	console.log(data);
}

start();