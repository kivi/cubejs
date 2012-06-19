// 
//  cta/product.js
//  xml mapping to datasource_products table matching
//  
//  Created by Vikas on 2012-02-15.
// 


require('./helpers');
var config = require('./config');
var inspect = require('./config').inspect;

// =============================================================
// = takes as a argument and the id of the language to be used =
// =============================================================
exports.add = function (p, ds_lang_id) {
	p = p['Product'];
	var eanField = '', description = '';

	if (p['EANCode'] && p['EANCode'].length) {
	 	var eans = [];
	 	for (var i = p['EANCode'].length - 1; i >= 0; i--) {
	 		eans.push(p['EANCode'][i]['@']['EAN']);
	 	};
	 	eanField = '[' + eans.join(',') + ']';
	}

	// if (p['ProductDescription']['@']) {	
	// 	description = p['ProductDescription']['@']['LongDesc'];
	// } else if (p['ProductDescription'] && p['ProductDescription'][0]) {

		// multilanguage mapping
		// walk through descriptions in all languages and map to enabled languages
		// if not an array then put in array
		var descriptions = (p['ProductDescription'][0]) ? p['ProductDescription'] : [p['ProductDescription']];
		var product_lang = [];

		for (var i=0; i < config.lang.length; i++) {
			for (var descriptions_number=0; descriptions_number < descriptions.length; descriptions_number++) {
				if (descriptions[descriptions_number]['@'] && config.lang[i]['ds_lang_id'] == descriptions[descriptions_number]['@']['langid']) {
					product_lang[i] = [ "(SELECT DISTINCT id FROM " + config.table['product'] + " WHERE ds_id = " + config.datasource_id + " AND ds_product_id = " + p['@']['ID'] + " LIMIT 1)"			// our product id
									  , config.datasource_id			// datasource_product_id
									  , config.lang[i]['id']			// lang id
									  , p['@']['ID']					// datasource_product_id
									  , mysqlEscape( p['@']['Title'])
									  , mysqlEscape( descriptions[descriptions_number]['@']['LongDesc'] )
									  ];
				};
			};
		}
	// };

	return ({
		// ds_id, ds_product_id, eans, attributes, name, pic_thumb, pic_low, pic_high, created_at, ds_category_id, ds_parent_category_ids,
		'product':  	[ config.datasource_id
						, p['@']['ID']					// datasource_product_id
						, eanField						// eans
						, ''							// attributes
						, mysqlEscape( p['@']['Title'])	// title
						, p['@']['ThumbPic']			// pic_thumb
						, p['@']['LowPic']				// pic_low
						, p['@']['HighPic']				// pic_high
						, 'NOW()'						// created_at
						, "(SELECT DISTINCT id FROM " + config.table['category'] + " WHERE ds_id = " + config.datasource_id + " AND ds_category_id = " + p['Category']['@']['ID'] + " LIMIT 1)"
						, "(SELECT DISTINCT parent_id FROM " + config.table['category'] + " WHERE ds_id = " + config.datasource_id + " AND ds_category_id = " + p['Category']['@']['ID'] + " LIMIT 1)"

						// , mysqlEscape(description)	// description
						],
		'product_lang': product_lang
	});
};


