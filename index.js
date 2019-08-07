const { app, BrowserWindow } = require('electron')
function createWindow(){
	let win = new BrowserWindow({
		width:375,
		height:812,
		resizable:false,
		webPreferences:{
			nodeIntegration:true
		}
	});
	win.loadFile('index.html');
}
app.on("ready",createWindow);