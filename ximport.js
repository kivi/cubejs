// 
//  amazon.js
//  trigger to import amazon file using a Command in our PHP code
//  
//  Created by Vikas on 2012-02-16.
// 

// ============
// = includes =
// ============
var inspect = require('eyes').inspector({maxLength: 1000});
var sys = require('util')
var exec = require('child_process').exec;
var child;
var fs_files = require('fs');

var Seq = require('seq');


// ==================
// = congfiguration =
// ==================
var config = {
	amazongrabber: '../app/console productsource:import:amazon ',
	
	/* -----[ directories ]----- */
	path: { 'output': __dirname + '/output/'
	  	   ,'data':  __dirname + '/data/'},

	/* -----[ general handling config ]----- */
	interval: 10,
	offset: 1,
}
config['id_file'] = config.path['data'] + 'products_with_params.csv'


// command line args
var startingId = process.argv[2];


// ==========
// = helper =
// ==========
var lines = require('fs').readFileSync(config.id_file).toString().split('\n');

// this is a very dirty work arround, otherwise could not pass throught cmd line
var mysqlEscape = function (str) {
	return ((str.replace(/(')/g, "A_SINGLE_QUOTE")).replace(/(")/g, "\\$1"));
}


// ========
// = main =
// ========

// set the offset, if id in cmd line given
var startOffset = config.offset;

if (startingId && parseInt(startingId) > 0) {
	for (var i = 0; i < lines.length; i++) {
		ds_product_id = lines[i].substr(1,lines[i].indexOf('"',1)-1)
		if (startingId == ds_product_id) {
			startOffset = i;
			break;
		};
	};
};


function amazon (offset) {
	// =====================================================================================================================
	// = wie use sequences, otherwise javascript would go through iterations and slow processes would be executed parallel =
	// =====================================================================================================================
	Seq()
		// main handling sequence 
		.seq(function () {
			
			// jump out if end of lines reached
			if (offset > lines.length) {
				return;
			};			
			
			var line_for_this_batch = lines.slice(offset,offset+config.interval);
			
			// "Produktnummer","Produktname","Kategorie","EAN","ASIN","ISBN"
			for (var i = line_for_this_batch.length - 1; i >= 0; i--){
				// line_for_this_batch[i].replace(/^("45",")('|"|\x00|\n|\r|\,|\x1a)/g, "\\$2/")
				current_line_to_escape = line_for_this_batch[i].split('","');
				current_line_to_escape[1] = mysqlEscape(current_line_to_escape[1]);
				line_for_this_batch[i] = current_line_to_escape.join('","');
			};
			
			var cmd = config['amazongrabber'] + "'[[" + line_for_this_batch.join('],[') + "]]'";
			var child = exec(cmd, this);
				console.log('' + cmd);
		})
		// logging and error handling
		.seq(function (error, stdout, stderr) {
			console.log(stdout);
			if (stderr && stderr !== null) {
				console.log('stderr: ' + stderr);	
			}
	  		if (error && error !== null) {
	    		console.log('exec error: ' + error);
	  		}
			exec("sleep 1", this);
		})
		// loop
		.seq(function () {
			setTimeout(amazon, 500, offset+config.interval);
		})
		// catch block, in case of refusing or slow connection, we try again.
		.catch(function (err) {
			console.log("trying again")
		  		  	console.error(err.stack ? err.stack : err)
			// exec("sleep 1", this);
			setTimeout(function () {amazon(offset+config.interval)},10000);
			  	})
		;
}


amazon(startOffset);
