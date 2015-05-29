var io = require('socket.io')();

var port = process.env.PORT || 5000;

io.on('connection', function(socket){
	console.log("connection successful");

	socket.on('compile', function(compile) {
		var exec = require('child_process').exec;
		var fs = require('fs');
		fs.writeFile(compile.filename, decodeURI(compile.code), function(err) {
		    if(err) {
		        return console.log(err);
		    }
		});
		//echo 'compile.code' > compile.filename; compile.compiler compile.filename
		//var commands = 'echo \'' + decodeURI(compile.code) + '\' > ' + compile.filename + '; ' + compile.compiler + ' '+ compile.filename;
		var commands = compile.compiler + ' ' + compile.filename;
		if(compile.filename == "solution.java") {
			commands += "; java solution"
		}
		console.log(commands);
		exec(commands, function (error, stdout, stderr) {
			if(stdout) {
				console.log("stdout is:" + stdout);
			}
			if(stderr) {
				console.log("stderr is:" + stderr);
			}
			socket.emit('output', {stdout: stdout, stderr: stderr});
		});
	});

	socket.on('connect', function() {
		console.log("connected");
	});
});
io.listen(port);
