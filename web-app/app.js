var qr = require('qr-image');
 
var svg_string = qr.imageSync("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc at felis ut magna cursus fringilla. Cras pellentesque, turpis vel finibus lacinia, tortor ante pretium erat, eget luctus diam est nec quam. Curabitur in vehicula quam. Etiam dictum massa sit amet mauris fermentum dapibus. Sed risus leo, hendrerit eu ex id, condimentum tincidunt ante. Nunc tempus ex id risus viverra, sed placerat erat convallis. Sed non urna ut arcu iaculis volutpat. Curabitur iaculis faucibus tristique."
	, { type: 'svg', size: 5 });

console.log(svg_string)