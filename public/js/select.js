(function(window) {
	var utils = {},
		defaultOptions = {
			multiSelect: false,
			sources: {
				local: [],
				remote: ""
			},
			showImages: true
		},
		key = {
			backspace: 8,
			del: 46
		};
	utils.extend = function (target) {
		var i,j,from;
		for(i=1; i<arguments.length; ++i) {
			from = arguments[i];
			if(typeof from !== 'object') {
				continue;
			}
			for(j in from) {
				if(from.hasOwnProperty(j)) {
					target[j] = Object.prototype.toString.call(from[j]) ==='[object Object]' ? utils.extend({}, target[j], from[j]) : from[j];
				}
			}
		}
		return target;
	};
	utils.empty = function(element) {
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	};
	utils.escapeRegExp = function(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	};

	function SelectVK(element, options) {
		this.element = element;
		this.options = {};
		utils.extend(this.options,defaultOptions,options);
		this.init();
	}

	SelectVK.prototype.init = function() {
		this.selectedOptions = [];
		this.render();
		if(this.options.multiSelect) {
			this.getInputMinWidth();
		}
		if(this.options.sources.remote !== "") {
			this.req = null;
		}
		this.initEvents();
		setTimeout(this.calculateInputWidth.bind(this),0);
	};

	SelectVK.prototype.render = function(){
		this.headerElement = this.element.querySelector('.select-header');
		this.caretElement = this.headerElement.querySelector('.caret');
		this.inputElement = this.headerElement.querySelector('input[type="text"]');
		this.inputElement.insertAdjacentHTML('beforebegin', '<div class="selected"></div>');
		this.inputElement.insertAdjacentHTML('beforebegin', '<div class="tag add" style="display:none"><span>Добавить</span><div class="tag-x"></div></div>');
		this.headerElement.insertAdjacentHTML('afterend', '<div class="drop-down" style="display:none"><div class="drop-down-container"><div class="drop-down-list"></div><div class="drop-down-shadow-1"></div><div class="drop-down-shadow-2"></div></div></div>');
		this.dropDownElement = this.element.querySelector('.drop-down');
		this.dropDownListElement = this.dropDownElement.querySelector('.drop-down-list');
		this.addButtonElement = this.headerElement.querySelector('.add');
		this.selectedOptionsElement = this.headerElement.querySelector('.selected');
	};

	SelectVK.prototype.getInputMinWidth = function(){
		var tmpButton;
		this.inputMinWidth = 85;
		tmpButton = this.addButtonElement.cloneNode(true);
		this.headerElement.appendChild(tmpButton);
		tmpButton.style.position = 'absolute';
		tmpButton.style.visibility = 'hidden';
		tmpButton.style.display = 'block';
		setTimeout(function(){
			this.inputMinWidth = tmpButton.offsetWidth || this.inputMinWidth;
			tmpButton.parentNode.removeChild(tmpButton);
		}.bind(this),0);
	};

	SelectVK.prototype.initEvents = function() {
		this.caretElement.addEventListener('click', function(e){e.preventDefault();});
		this.caretElement.addEventListener('mousedown', this.caretClick.bind(this));
		this.inputElement.addEventListener('focus', this.showDropDown.bind(this));
		this.inputElement.addEventListener('blur', this.hideDropDown.bind(this));
	};

	SelectVK.prototype.calculateInputWidth = function() {
		var width,
			lastTag,
			lastTagEnd,
			newWidth;
		width = this.headerElement.offsetWidth - this.caretElement.offsetWidth;
		if (this.options.multiSelect){
			width = this.headerElement.offsetWidth - this.caretElement.offsetWidth;
			if (this.selectedOptionsElement.children.length) {
				lastTag = this.selectedOptionsElement.querySelectorAll('.tag')[this.selectedOptionsElement.querySelectorAll('.tag').length-1];
				lastTagEnd = lastTag.offsetLeft + lastTag.offsetWidth + parseInt((lastTag.currentStyle || getComputedStyle(lastTag)).marginRight);
				newWidth = width - lastTagEnd;
				width = (newWidth < this.inputMinWidth)?width:newWidth;
			}
		}
		this.inputElement.style.width = width + 'px';
	};

	SelectVK.prototype.caretClick = function(e){
		if(document.activeElement === this.inputElement) {
			this.inputElement.blur();
		} else {
			this.inputElement.focus();
		}
		e.preventDefault();
	};

	SelectVK.prototype.showDropDown = function(){
		this.addButtonElement.style.display = 'none';
		this.inputElement.focus();
		if(this.options.multiSelect) {
			this.inputElement.removeAttribute('style');
			this.calculateInputWidth();
		}
		utils.empty(this.dropDownListElement);
		this.dropDownElement.style.display = 'block';
		this.updateDropDown();
		this.element.scrollIntoView();

		this.fnUpdateDropDown = this.updateDropDown.bind(this);
		this.fninputEventIE9Fix = this.inputEventIE9Fix.bind(this);

		this.inputElement.addEventListener('propertychange', this.fnUpdateDropDown);
		this.inputElement.addEventListener('input', this.fnUpdateDropDown);
		this.inputElement.addEventListener('keyup', this.fninputEventIE9Fix);

	};

	SelectVK.prototype.inputEventIE9Fix = function(e){
		if (navigator.appVersion.indexOf("MSIE 9") !== -1 && (e.which === key.backspace || e.which === key.del )) {
			this.updateDropDown();
		}
	};

	SelectVK.prototype.hideDropDown = function(){
		this.inputElement.removeEventListener('propertychange', this.fnUpdateDropDown);//ie8 - 9
		this.inputElement.removeEventListener('input', this.fnUpdateDropDown);
		this.inputElement.removeEventListener('keyup', this.fninputEventIE9Fix);

		this.dropDownElement.style.display = 'none';
		if(this.options.multiSelect) {
			if(this.selectedOptions.length) {
				this.addButtonElement.style.display = 'block';
				this.inputElement.style.width = '0px';
				this.inputElement.style.paddingLeft = '0';
				this.inputElement.style.paddingRight = '0';
			} else {
				this.inputElement.removeAttribute('style');
				this.addButtonElement.style.display = 'none';
				this.calculateInputWidth();
			}
		}
	};

	SelectVK.prototype.matchesQuery = function(obj, queries){
		var queryArr,
			match = false,
			tmpMatch,
			i,
			j;
		for (j = 0; j < queries.length; j++) {
			queryArr = queries[j].split(/ +/g);
			tmpMatch = true;
			for (i = 0; i < queryArr.length; i++) {
				if (queryArr[i] !== '') {
					tmpMatch = tmpMatch && (new RegExp("(" + utils.escapeRegExp(queryArr[i]) + ")", 'gi').test(obj[1]));
				}
			}
			match = tmpMatch || match;
		}
		return match;
	};

	SelectVK.prototype.generateAlternativeQueries = function(query){
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
				result = result.replace(new RegExp("(" + utils.escapeRegExp(c1) + ")", 'g'),c2);
				result = result.replace(new RegExp("(" + utils.escapeRegExp(c1.toUpperCase()) + ")", 'g'),c2.toUpperCase());
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
	};

	SelectVK.prototype.renderEmptyDropDown = function() {
		utils.empty(this.dropDownListElement);
		this.dropDownListElement.innerHTML = '<div class="empty">Пользователь не найден</div>';
	};

	SelectVK.prototype.scrollToSelected = function() {
		var el = this.dropDownListElement.querySelector('.selected');
		if(el) {
			el.scrollIntoView();
		}
	};

	SelectVK.prototype.updateDropDown = function(){
		var i,
			count = 0,
			query = this.inputElement.value.trim(),
			queries = this.generateAlternativeQueries(query),
			data,
			singleSelectSelected = (!this.options.multiSelect && this.selectedOptions.length),
			filteredLocalIdArr = [],
			dropDownEmpty = false;
		if(!this.options.multiSelect && this.selectedOptions[0] && this.selectedOptions[0][1] !== query) {
			this.selectedOptions.splice(0, this.selectedOptions.length);
			singleSelectSelected = false;
		}

		if(this.options.sources.local.length) {
			for (i = 0; i < this.options.sources.local.length; i++) {
				if(query === "" || this.matchesQuery(this.options.sources.local[i], queries) || singleSelectSelected){
					(function(obj){
						var option;
						if(this.selectedIndex(obj) === -1 || !this.options.multiSelect) {
							if(!dropDownEmpty){
								dropDownEmpty = true;
								utils.empty(this.dropDownListElement);
							}
							count ++;
							filteredLocalIdArr.push(obj[0]);
							option = this.renderDropDownItem(obj,(!this.options.multiSelect && this.selectedIndex(obj) !== -1), query, !singleSelectSelected);
							this.dropDownListElement.appendChild(option);
							option.addEventListener('mousedown', this.addOption.bind(this, obj));
						}
					}).call(this,this.options.sources.local[i]);
				}
			}
			if(singleSelectSelected){
				this.scrollToSelected();
			}
		}
		if(this.options.sources.remote !== "") {
			if (this.req && this.req.readyState !== 4){
				this.req.abort();
			}
				this.req = new XMLHttpRequest();
			this.req.open('GET', this.options.sources.remote + '?q=' + (singleSelectSelected? '' : encodeURIComponent(query)), true);

			this.req.onreadystatechange = function() {
				if (this.req.readyState === 4) {
					if (this.req.status >= 200 && this.req.status < 400) {
						data = JSON.parse(this.req.responseText);
						for (i = 0; i < data.length; i++) {
							(function(obj){
								var option;
								if(filteredLocalIdArr.indexOf(obj[0]) === -1 && (this.selectedIndex(obj) === -1 || !this.options.multiSelect)) {
									if(!dropDownEmpty){
										dropDownEmpty = true;
										utils.empty(this.dropDownListElement);
									}
									count ++;
									option = this.renderDropDownItem(obj,(!this.options.multiSelect && this.selectedIndex(obj) !== -1), query, !singleSelectSelected);
									this.dropDownListElement.appendChild(option);
									option.addEventListener('mousedown', this.addOption.bind(this, obj));
								}
							}).call(this,data[i]);
						}
						if(singleSelectSelected){
							this.scrollToSelected();
						}
						if(count === 0) {
							this.renderEmptyDropDown();
						}
					} else {
						if(count === 0) {
							this.renderEmptyDropDown();
						}
						console.log("error");
					}
				}
			}.bind(this);

			this.req.send();
			//request = null;

		} else if(count === 0) {
			this.renderEmptyDropDown();
		}
	};

	SelectVK.prototype.renderDropDownItem = function(item, selected, query, highlight){
		var itemElement = document.createElement('div'),
			queryArr = query.split(' '),
			name = item[1],
			i;
		for (i = 0; i < queryArr.length; i++) {
			if (queryArr[i]!=='' && highlight) {
				name = name.replace(new RegExp("(" + utils.escapeRegExp(queryArr[i]) + ")", 'gi'), "<b>$1</b>");
			}
		}

		itemElement.className='item' + (selected?' selected':'');
		itemElement.innerHTML = (this.options.showImages ? ('<div class="image"><img src="' + item[3] + '"></div>') : '') + '<div class="name">' + name + '</div><div class="school">' + item[2] + '</div>';
		return itemElement;
	};

	SelectVK.prototype.selectedIndex = function(obj){
		var i,
			selectedIndex = -1;
		for (i = 0; i < this.selectedOptions.length; i++) {
			if(this.selectedOptions[i][0] === obj[0]) {
				selectedIndex = i;
				break;
			}
		}
		return selectedIndex;
	};

	SelectVK.prototype.addOption = function(obj){
		if(this.options.multiSelect) {
			if (this.selectedIndex(obj) === -1) {
				this.selectedOptions.push(obj);
				this.updateOptions();
			}
		} else {
			this.selectedOptions = [obj];
			this.inputElement.value = obj[1];
			this.inputElement.blur();
		}
	};

	SelectVK.prototype.removeOption = function(obj){
		var index = this.selectedIndex(obj);
		if(index !== -1) {
			this.selectedOptions.splice(index, 1);
			this.updateOptions();
			this.hideDropDown();
		}
	};

	SelectVK.prototype.updateOptions = function(){
		var i;
		utils.empty(this.selectedOptionsElement);
		if(this.selectedOptions.length) {
			for (i = 0; i < this.selectedOptions.length; i++) {
				(function(obj){
					var optionElement = document.createElement('div');
					optionElement.className='tag';
					optionElement.innerHTML = '<span>' + obj[1] + '</span><div class="tag-x"></div>';
					this.selectedOptionsElement.appendChild(optionElement);
					optionElement.addEventListener('click', function(e){
						e.preventDefault();
					});
					optionElement.querySelector('.tag-x').addEventListener('mousedown', this.removeOption.bind(this, obj));
				}).call(this,this.selectedOptions[i]);
			}
		}
	};

	window.SelectVK = SelectVK;
})(window);

