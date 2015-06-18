var express = require('express');
var app = express();
var path = require('path');

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/api', function (req, res) {
	var query=req.query.q||"",
		queries,
		resultArr = [],
		serverFriendsList,
		i;
	function escapeRegExp(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}
	function generateAlternativeQueries(query){
		var tmpArr,
			uniqueArr = [],
			j,
			tmpObj = {};
		function switchTransliteration(query, rusToLat) {
			var i, c1, c2,
				result = query,
				rus = "щ   ш  ч  ц  ю  я  ё  ж  ы э а б в г д е з и й к л м н о п р с т у ф х ь".split(/ +/g),
				lat = "shh sh ch cz yu ya yo zh y e a b v g d e z i j k l m n o p r s t u f h '".split(/ +/g);
			for (i = 0; i < rus.length; i++) {
				c1 = rusToLat?rus[i]:lat[i];
				c2 = rusToLat?lat[i]:rus[i];
				result = result.replace(new RegExp("(" + c1 + ")", 'g'),c2);
				result = result.replace(new RegExp("(" + c1.toUpperCase() + ")", 'g'),c2.toUpperCase());
			}
			return result;
		}
		function switchKeyboardCase(query, rusToLat) {
			var i, c1, c2,
				result = query,
				rus = "й ц у к е н г ш щ з х ъ   ф ы в а п р о л д ж Ж э Э    я ч с м и т ь б Б ю Ю   ё Ё".split(/ +/g),
				lat = "q w e r t y u i o p [ ]   a s d f g h j k l ; : ' \"   z x c v b n m , < . >   ` ~".split(/ +/g);
			for (i = 0; i < rus.length; i++) {
				c1 = rusToLat?rus[i]:lat[i];
				c2 = rusToLat?lat[i]:rus[i];
				result = result.replace(new RegExp("(" + escapeRegExp(c1) + ")", 'g'),c2);
				result = result.replace(new RegExp("(" + escapeRegExp(c1.toUpperCase()) + ")", 'g'),c2.toUpperCase());
			}
			return result;
		}
		tmpArr = [query, switchKeyboardCase(query, true), switchTransliteration(switchKeyboardCase(query, true), false), switchKeyboardCase(query, false), switchTransliteration(query, true), switchTransliteration(query, false)];
		for (j = 0; j < tmpArr.length; j++) {
			if(!tmpObj.hasOwnProperty(tmpArr[j])) {
				uniqueArr.push(tmpArr[j]);
				tmpObj[tmpArr[j]] = 1;
			}
		}
		return uniqueArr;
	}
	function matchesQuery(obj, queries){
		var queryArr,
			match = false,
			tmpMatch,
			tmpMatchDomain,
			i,
			j;
		for (j = 0; j < queries.length; j++) {
			queryArr = queries[j].split(/ +/g);
			tmpMatch = true;
			tmpMatchDomain = true;
			for (i = 0; i < queryArr.length; i++) {
				if (queryArr[i] !== '') {
					tmpMatch = tmpMatch && (new RegExp("(" + escapeRegExp(queryArr[i]) + ")", 'gi').test(obj[1]));
					tmpMatchDomain = tmpMatchDomain && (new RegExp("(" + escapeRegExp(queryArr[i]) + ")", 'gi').test(obj[4]));
				}
			}
			match = tmpMatch || match || tmpMatchDomain;
		}
		return match;
	}

	queries = generateAlternativeQueries(query);

	serverFriendsList=[
		["7232","Анастасия","ИВЭСЭП","https://pp.vk.me/c624724/v624724990/2c88d/XVIpS5Xhr5o.jpg","/henikilan"],
		["7035","Максим","СПбГУАП","https://pp.vk.me/c622123/v622123558/2a261/03HYvG_N7IM.jpg","/madmaxxbass"],
		["1111","Андрей Рогозов","ЦУМ","https://pp.vk.me/c413622/v413622683/6022/HTMKLhG3wKY.jpg","/id45235345243534445"]
	];
	for (i = 0; i < serverFriendsList.length; i++) {
		if(query === "" || matchesQuery(serverFriendsList[i], queries)){
			resultArr.push(serverFriendsList[i]);
		}
	}

	res.send(JSON.stringify(resultArr));
});

var server = app.listen(8080, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});