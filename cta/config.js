// 
//  config.js
//  
//  Created by Vikas on 2012-02-15.
// 

var config = {
	url_base: "http://",
	url_product_path: "filename",
	
	index_file_daily_diff: "filename",
	index_file:			   "filename",
	
	datasource_id: 10,
	table: { 'category': 'ds_category'
			,'category_lang': 'ds_category_lang'
			,'product': 'ds_product'
			,'product_lang': 'ds_product_lang'},
	
	/* -----[ language mapping and enabling for import ]----- */
	lang: [ 
		{'id': 1
		,'ds_lang_id': 1
		,'ds_lang_code': 'EN' }
		,{'id': 2
		,'ds_lang_id': 4
		,'ds_lang_code': 'DE' }
	],
	// Deutsch = 4
	// English = 1

	/* -----[ directories ]----- */
	path: { 'output': __dirname + '/output/'
	  	   ,'data':  __dirname + '/data/'}
};

config['url_base_credentials'] =  "http://URL...",
module.exports = config;


/* -----[ inspect for debugging ]----- */
module.exports.inspect = require('eyes').inspector({maxLength: 1000});


/* -----[ category id's to import ]----- */
module.exports.categories = [
 2
,77
,198
,201
,202
,204
,207
,208
,2096
,1779
,1780
,1786
,1787
,1791
,1792
,1794
,1797
,1798
,1809
,1823
,1825
,1832
,1835
,1842
,1855
,1860
,1862
,186
];
