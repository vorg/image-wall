/**
 * Copyright (c) 2011 Zauber S.A. <http://www.zaubersoftware.com/>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * @author Damian Mendez Romera - damianmendez AT zauberlabs DOT com
 * 
 * A CSS Transforms helper that can be used to apply transforms on DOM elements.
 * Values set with this library can be read later by just calling the same method
 * with no arguments. Transforms applied by CSS, however, won't be read by this code.
 * E.g.
 * 
 * Translate an element:
 * $('#myElem').translate(100, 100);
 * var translation = $('myElemen').translate();
 * // translation = {x: 100, y: 100, left: 100, top: 100, unit: 'px'}
 * 
 * // Reading values from CSS is not supported
 * var translation = $('<div style="transform: translate(100, 100);"></div>').translate()
 * // translation = {x: 0, y: 0}
 * 
 * Set/get transforms origin
 * $('#myElem').origin(50, 50);
 * $('#myElem').origin(); // {x: 50, y: 50}
 * 
 * Set/get rotation
 * $('#myElem').rotate(45); // only degrees are supported
 * $('#myElem').rotate() // {val: 45, unit: 'deg'}
 * 
 * Set/get scale
 * $('#myElem').scale(2);
 * $('#myElem').scale(); // 2
 * 
 * Clear all transforms applied by this plugin
 * $('#myElem').clearTransforms();
 * 
 * You can also set the transform by calling $('#myElem').transform('rotate(45)'), but then you
 * won't be able to read this value from the .rotate() method.
 * 
 * When available, the plugin will try to use 3D transforms, as they run amazingly fast in iOS. This is
 * transparent and should not interfere with they way you use the library. All major browsers with
 * support of CSS 2D Transforms are supported, including Android browser and iOS Safari.
 * 
 * We accept pull requests! If possible, try to create a test case for your changes (or try to modify an
 * existent one). The test folder should have all you need to to this.
 */
(function($, undefined) {

	var VALID_TRANSFORMATIONS = {
		"rotate": true,  
		"rotate3d": true, 
		"rotateX": true, 
		"rotateY": true, 
		"skew": true, 
		"skewX": true, 
		"skewY": true,
		"scale": true, 
		"scaleX": true, 
		"scaleY": true, 
		"scaleZ": true,
		"translate": true,  
		"translate3d": true, 
		"translateX": true, 
		"translateY": true
	};	
	
	/*
	var TRANSFORM_PROPERTY = $.browser.mozilla  ? '-moz-transform' : 
								$.browser.webkit ? '-webkit-transform' : 
									$.browser.msie ? '-ms-transform' :
										$.browser.opera ? '-o-transform'
											: 'transform';
	*/

	var TRANSFORM_PROPERTY = '-webkit-transform';

	var HAS_3D = ('WebKitCSSMatrix' in window) && ('m11' in new WebKitCSSMatrix());
	
	/**
	 * The browser prefix for CSS properties
	 */
	/*var BROWSER_PREFIX = $.browser.webkit ? '-webkit-' : 
							$.browser.mozilla ? '-moz-' :
								$.browser.opera ? '-o-' : 
									'';
	*/
	var BROWSER_PREFIX = '-webkit-';
	/**
	 * Specifies the rotation function and tries to use hardware acceleration when available
	 */
	var ROTATE_TRANSFORM = 'rotate' + (HAS_3D ? '3d' : '') + '(' + (HAS_3D ? '0,0,0,' : '') + '$value$' + 'deg)';

	/**
	 * Specified the translation function and tries to use hardware acceleartion when available.
	 */
	var TRANSLATE_TRANSFORM = 'translate' + (HAS_3D ? '3d' : '') + '($value.x$px, $value.y$px' + (HAS_3D ? ', 0px' : '') + ')';
	
	var SCALE_TRANSFORM = 'scale($value$)';
	
	var TRANSFORM_ORIGIN_PROPERTY = BROWSER_PREFIX + 'transform-origin';
	
	function def(val) {
		return typeof val !== 'undefined'; 
	}

	/**
	 * Sets/Gets the transform origin.
	 */
	$.fn.clearTransforms = $.fn.clearTransform = function() {
	    return this.css(TRANSFORM_PROPERTY, 'none').each(function() {
	    	delete this.cssTransformations;
	    });
	};
	
	/**
	 * Sets/Gets the transformation origin (pixels)
	 */
	$.fn.origin = function(x, y) {
		if (def(x) && def(y)) {
			return this.css(TRANSFORM_ORIGIN_PROPERTY, x + 'px ' + y + 'px');
		} else {
			var cssValue = this.css(TRANSFORM_ORIGIN_PROPERTY);
			var values = cssValue.match(/[-]?[\d]*[.]?[\d]*px/gi);
//			var unit = cssValue.match() // TODO
			var top, left;
			if (values) {
				left = Number(values[0].replace('px', ''));
				top = Number(values[1].replace('px', ''));
				return {unit: 'px', left: left, top: top, x: left, y: top};
			} else { // No origin set, default to center.
				return null;
			}
		}
	};
	
	/**
	 * Translate the element the given amount of pixels. Uses hardware acceleration when available.
	 */
	$.fn.translate = function(x,y) {
		if (def(x) && def(y)) {
			var translate = TRANSLATE_TRANSFORM.replace('$value.x$', x).replace('$value.y$', y);
			return this.transform(translate);
		} else {
			var translateValue = this.transform(TRANSLATE_TRANSFORM.substr(0, TRANSLATE_TRANSFORM.indexOf('(')));
			translateValue = translateValue.substr(1, translateValue.indexOf(')') - 1);
			console.log(translateValue)
			xy = translateValue.match(/[-]?[\d]*[.]?[\d]/gi);
			return {
				x: Number(xy[0]),
				left: Number(xy[0]),
				y: Number(xy[2]),
				top: Number(xy[2]),
				unit: 'px'
			};
		}
	};
	
	/**
	 * Scales the element the given value
	 * Does not support 3D scale.
	 * @param value the scale (1 is normal value).
	 */
	$.fn.scale = function(value) {
		if (def(value)) {
			var scale = SCALE_TRANSFORM.replace('$value$', value);
			return this.transform(scale);
		} else {
			var scaleValue = this.transform(SCALE_TRANSFORM.substr(0, SCALE_TRANSFORM.indexOf('(')));
			scaleValue = scaleValue == null ? '(1)' : scaleValue;
			// '(xxx.xx)' turns into -> xxx.xx (number)
			return Number(scaleValue.substr(1, scaleValue.length - 2));
		}
	};
	
	/**
	 * Rotates an element the given amount of degrees. Uses hardware acceleration when possible.
	 * @param val the amount of degrees you want to use.
	 */
	$.fn.rotate = function(val) {
		if (def(val)) {
			val = parseFloat(val) || 0;
			var rotate = ROTATE_TRANSFORM.replace('$value$', val);
			
			return this.transform(rotate);
		} else {
			var rotateFunction = ROTATE_TRANSFORM.substr(0, ROTATE_TRANSFORM.indexOf('('));
			var rotationValue = this.transform(rotateFunction);
			var unit;
			
			if (rotationValue == null) {
				rotationValue  = 0;
				unit = 'deg';
			} else {
				// find the '-' character plus the '.' for float values.
				rotationValue = rotationValue.match(/[-]?[\d]*[.]?[\d]*deg|[-]?[\d]*[.]?[\d]*rad/g)[0];
				unit = rotationValue.match(/deg|rad/)[0]
				rotationValue = parseFloat(rotationValue.replace(unit, ''));
			}
			
			return {
				value: rotationValue,
				val: rotationValue, // Syntactic sugar
				unit: unit
			};
		}
	};

	/**
	 * @param cssTransform the transformation function (string). eg 'rotate(45deg)', 'translate(25px, 25px)'
	 */
	$.fn.transform = function(cssTransform) {
		var cssFunction, 
			cssFunctionValues, 
			isValidTransform,
			el = this[0];

		if (!cssTransform) {
			return el.cssTransformations || 'none';
		}

		if (cssTransform.indexOf('(') == -1) {
			cssFunction = cssTransform;
			return (el.cssTransformations && el.cssTransformations[cssFunction]) || null;
			
		} else {
			cssFunction = cssTransform.substr(0, cssTransform.indexOf('(')).replace(' ', '');
			cssFunctionValues = cssTransform.replace(cssFunction, '');
		}
		
		isValidTransform = (cssFunction in VALID_TRANSFORMATIONS);
		
		if (!isValidTransform) {
			throw new Error('I cannot handle this transform: ' + cssTransform + '.');
		}
		
		return this.each(function(){
			el = this;
			
			var transformString = '';
			
			// Using the element to store the data is more performant than
			// using $el.data('property') on iPad 1
			var currentTransformations = el.cssTransformations || {};
			currentTransformations[cssFunction] = cssFunctionValues; 
			for (var transform in currentTransformations) {
				transformString += transform + currentTransformations[transform] + ' ';
			}
			$(el).css(TRANSFORM_PROPERTY, transformString);
			el.cssTransformations = currentTransformations;
		});
	};
	
})(jQuery);