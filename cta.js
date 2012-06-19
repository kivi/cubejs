function include(arr,obj) {
    return (arr.indexOf(obj) != -1);
}

(function() {
	var config = require('./cta/config.js');
	var inspect = require('./cta/config.js').inspect;
	var productsExtractor = require('./products.js');
	var File = require(config.path['data'] + 'files.js').File;

	var fs_files = require('fs');
	var events = require('events');
	var emitter = new events.EventEmitter();
	var sax_parser = require('sax').createStream(false);

	winston = require('winston');
	var winston = new (winston.Logger)({
	  transports: [
	    new (winston.transports.Console)(),
	    new (winston.transports.File)({ filename: config.path['output'] + 'cta.log', timestamp: true })
	  ]
	});

 	products = [];
	var lastProduct;
	var filesDone = 0;
	var fileCount = 0;

	var fileOffset = (process.argv[2] > 0) ? parseInt(process.argv[2]) : 0;
	var maxImportCount = (process.argv[3] > 0) ? parseInt(process.argv[3]) : 3;


	// =======================
	// = sqlize all products =
	// =======================
	emitter.on('sqlize', function  () {
		var sql="";
		if ((fileCount - filesDone) == 0) {
            sql = "REPLACE INTO " + config.table['product'] + " (ds_id, ds_product_id, eans, attributes, name, pic_thumb, pic_low, pic_high, created_at, ds_category_id, ds_parent_category_ids)  VALUES ";
            sql_lang = "REPLACE INTO " + config.table['product_lang'] + " (id, ds_id, lang_id, ds_product_id, name, description)  VALUES ";

			for (var product_number = 0; product_number < products.length; product_number++) {
				parent_category_id = products[product_number]['product'].pop();
				category_id = products[product_number]['product'].pop();
				sql += "('" + products[product_number]['product'].join("','") + "'," + category_id + "," + parent_category_id + "),\n" ;
				
				var product_lang = products[product_number]['product_lang'];
				for (var lang_number=0; lang_number < product_lang.length; lang_number++) {
					if (product_lang[lang_number]) {
						// first element is the query to get our productId
						sql_lang += "(" + product_lang[lang_number].shift();
						sql_lang += ", '" + product_lang[lang_number].join("','") + "'),\n" ;						
					};
				};
			};
			
			sql = sql.slice(0,-2) + ';' + sql_lang.slice(0,-2) + ';';

			var fileName = "sql_" + fileOffset + "_" + (fileOffset+maxImportCount) + ".sql";
			require('fs').writeFile(config.path['output'] + fileName, sql, function(err) {
    		if(err) {
					winston.log('error', err);
    		} else {
					winston.log('debug', "The file:" + fileName + " was saved!");
    		}
			});
		}
	});


	// ==============================
	// = fetch products			    =
	// ==============================
	emitter.on('product', function(index) {
		
		var product_url = File.list[index];
		product_url = config.url_product_path + product_url;
		
		var request = require('request');
		winston.log('debug', 'Index: ' + index + ' Request: ' + product_url);
		request (config['url_base_credentials'] + product_url, function (error, response, data) {
			xml2js = require('xml2js');
			var product_parser = new xml2js.Parser();
	
			// this block parses the content of product file	
			product_parser.on('end', function(p) {
				products.push(productsExtractor.add(p));
			});

			if (!error && response.statusCode == 200) {
				product_parser.parseString(data);
			} else {
				winston.log('error', 'Error requesting file.  Path:' + this.path + ' error:' + error);
			}

			if (index < fileOffset+maxImportCount) {
				setTimeout(function() {
					emitter.emit('product', ++index);
					}, 300);
			} else {
				emitter.emit('sqlize');
			};
		});
	});


	// start
	emitter.emit('product', fileOffset);
}).call();
