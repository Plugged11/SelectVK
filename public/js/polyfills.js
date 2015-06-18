/* from https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/Trim*/
if (!String.prototype.trim) {
	(function() {
		// Вырезаем BOM и неразрывный пробел
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		String.prototype.trim = function() {
			return this.replace(rtrim, '');
		};
	})();
}

/* from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind */
if (!Function.prototype.bind) {
	Function.prototype.bind = function(oThis) {
		if (typeof this !== 'function') {
			// closest thing possible to the ECMAScript 5
			// internal IsCallable function
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var aArgs   = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP    = function() {},
			fBound  = function() {
				return fToBind.apply(this instanceof fNOP
						? this
						: oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}

/* from https://developer.mozilla.org/ru/docs/Web/API/EventTarget/addEventListener */
(function() {
  if (!Event.prototype.preventDefault) {
    Event.prototype.preventDefault=function() {
      this.returnValue=false;
    };
  }
  if (!Event.prototype.stopPropagation) {
    Event.prototype.stopPropagation=function() {
      this.cancelBubble=true;
    };
  }
  if (!Element.prototype.addEventListener) {
    var eventListeners=[];
    
    var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var self=this;
      var wrapper=function(e) {
        e.target=e.srcElement;
        e.currentTarget=self;
        try {
	        if (listener.handleEvent) {
	          listener.handleEvent(e);
	        } else {
	          listener.call(self,e);
	        }
        } catch(err) {}
      };
      if (type=="DOMContentLoaded") {
        var wrapper2=function(e) {
          if (document.readyState=="complete") {
            wrapper(e);
          }
        };
        document.attachEvent("onreadystatechange",wrapper2);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});
        
        if (document.readyState=="complete") {
          var e=new Event();
          e.srcElement=window;
          wrapper2(e);
        }
      } else {
        this.attachEvent("on"+type,wrapper);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
      }
    };
    var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var counter=0;
      while (counter<eventListeners.length) {
        var eventListener=eventListeners[counter];
        if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
          if (type=="DOMContentLoaded") {
            this.detachEvent("onreadystatechange",eventListener.wrapper);
          } else {
            this.detachEvent("on"+type,eventListener.wrapper);
          }
          eventListeners.splice(counter, 1);
          break;
        }
        ++counter;
      }
    };
    Element.prototype.addEventListener=addEventListener;
    Element.prototype.removeEventListener=removeEventListener;
    if (HTMLDocument) {
      HTMLDocument.prototype.addEventListener=addEventListener;
      HTMLDocument.prototype.removeEventListener=removeEventListener;
    }
    if (Window) {
      Window.prototype.addEventListener=addEventListener;
      Window.prototype.removeEventListener=removeEventListener;
    }
  }
})();

if (!window.console) {
	window.console = {};
	window.console.log = function(x) {};
}

/* from https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf */
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(searchElement, fromIndex) {
		var k;

		// 1. Положим O равным результату вызова ToObject с передачей ему
		//    значения this в качестве аргумента.
		if (this == null) {
			throw new TypeError('"this" is null or not defined');
		}

		var O = Object(this);

		// 2. Положим lenValue равным результату вызова внутреннего метода Get
		//    объекта O с аргументом "length".
		// 3. Положим len равным ToUint32(lenValue).
		var len = O.length >>> 0;

		// 4. Если len равен 0, вернём -1.
		if (len === 0) {
			return -1;
		}

		// 5. Если был передан аргумент fromIndex, положим n равным
		//    ToInteger(fromIndex); иначе положим n равным 0.
		var n = +fromIndex || 0;

		if (Math.abs(n) === Infinity) {
			n = 0;
		}

		// 6. Если n >= len, вернём -1.
		if (n >= len) {
			return -1;
		}

		// 7. Если n >= 0, положим k равным n.
		// 8. Иначе, n<0, положим k равным len - abs(n).
		//    Если k меньше нуля 0, положим k равным 0.
		k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

		// 9. Пока k < len, будем повторять
		while (k < len) {
			// a. Положим Pk равным ToString(k).
			//   Это неявное преобразование для левостороннего операнда в операторе in
			// b. Положим kPresent равным результату вызова внутреннего метода
			//    HasProperty объекта O с аргументом Pk.
			//   Этот шаг может быть объединён с шагом c
			// c. Если kPresent равен true, выполним
			//    i.  Положим elementK равным результату вызова внутреннего метода Get
			//        объекта O с аргументом ToString(k).
			//   ii.  Положим same равным результату применения
			//        Алгоритма строгого сравнения на равенство между
			//        searchElement и elementK.
			//  iii.  Если same равен true, вернём k.
			if (k in O && O[k] === searchElement) {
				return k;
			}
			k++;
		}
		return -1;
	};
}