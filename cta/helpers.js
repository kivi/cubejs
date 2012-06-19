// 
//  helpers.js
//  
//  Created by Vikas on 2012-02-15.
// 

// =============================
// = escape entities for mysql =
// =============================
mysqlEscape = function (str) {
	return str.replace(/('|"|\x00|\n|\r|\,|\x1a)/g, "\\$1");
}
