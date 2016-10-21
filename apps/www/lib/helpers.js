const formatNumber = require('format-number');

const number = formatNumber({round:2});

exports.upper = function (str) {
  return str.toUpperCase();
};

exports.PercentChange = function (val, suffix) {
	if (typeof(suffix) != 'string') {
		suffix = '';	
	}

	if (val > 0) {
		return '<span class="green">' + number(val) + suffix + '</span>';
	} else if (val < 0) {
		return '<span class="red">' + number(val) + suffix +  '</span>';
	} else {
		return '<span>' + number(val) + suffix + '</span>';
	}
};

exports.numberFormat = function (val) {
	return number(val);
};

exports.selected = function (val1, val2) {
	return (parseInt(val1) == parseInt(val2)) ? 'selected="selected"' : "";
};

exports.isEqual = function(val1) {
	console.log('val1');
	return true;
	//return (val1 == val2)? true : false;
};

exports.ifCond = function(v1, v2)
{
	return (v1 == v2) ? true : false;
}

exports.autoReload = function(page) {
	if (page == undefined) {
		return '';
	}
	
	var html = `var socket = io.connect('http://www.stocks.local:3001');`;

	html += `socket.on('update-` + page +`-handler', function (data) {
        $("#content").html(data.message);
    });`;

	html += `setInterval(function() {`;
    html += `socket.emit('update-`+ page + `', '` + page + ` update');`;
    html += `}, 30000)`;
	
	return html;
}