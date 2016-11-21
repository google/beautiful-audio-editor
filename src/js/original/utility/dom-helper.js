/**
 * Copyright 2016 Google Inc.
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
 */
goog.provide('audioCat.utility.DomHelper');

goog.require('goog.asserts');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * Facilitates interaction with the DOM.
 * @constructor
 * @extends {goog.dom.DomHelper}
 */
audioCat.utility.DomHelper = function() {
  goog.base(this);

  // Figure out which property name the browser supports.
  var transformPropertyName = 'transform';
  var styleObject = this.createElement('div').style;
  if (!goog.isDef(styleObject[transformPropertyName])) {
    transformPropertyName = 'webkitTransform';
    if (!goog.isDef(styleObject[transformPropertyName])) {
      transformPropertyName = 'MozTransform';
      if (!goog.isDef(styleObject[transformPropertyName])) {
        transformPropertyName = 'msTransform';
        if (!goog.isDef(styleObject[transformPropertyName])) {
          // Ugh, we give up. No valid definition of transform available.
          transformPropertyName = 'transform';
        }
      }
    }
  }
  /**
   * The name of the CSS transform property to use.
   * @private {string}
   */
  this.transformPropertyName_ = transformPropertyName;
};
goog.inherits(audioCat.utility.DomHelper, goog.dom.DomHelper);

/**
 * @return {!Element} The first element with a certain class name. Assumes that
 *     at least 1 element with the class name exists.
 * @param {string} className The name of the class.
 * @param {!Element|!Node} container The DOM container in which to look.
 */
audioCat.utility.DomHelper.prototype.getElementByClassForSure =
    function(className, container) {
  return /** @type {!Element} */ (this.getElementByClass(
      className, /** @type {!Element} */ (container)));
};

/**
 * Listens to an event associated with the user pressing. For Desktop, this
 * event is click. For tablets and mobile devices, this may differ.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @param {boolean=} opt_listenOnce If true, only listens once. If false or not
 *     provided, listens for many occurences of the event.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.listenForPress =
    function(src, listener, opt_capture, opt_handler, opt_listenOnce) {
  var listenFunction =
      opt_listenOnce ? goog.events.listenOnce : goog.events.listen;
  listenFunction(src, 'click', listener, opt_capture, opt_handler);
};

/**
 * Listens to an event associated with the user entering an element. For
 * Desktop, this event is mouseover. For tablets and mobile devices, this may
 * differ.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @param {boolean=} opt_listenOnce If true, only listens once. If false or not
 *     provided, listens for many occurences of the event.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.listenForMouseOver =
    function(src, listener, opt_capture, opt_handler, opt_listenOnce) {
  var listenFunction =
      opt_listenOnce ? goog.events.listenOnce : goog.events.listen;
  var eventType = FLAG_MOBILE ? 'touchstart' : 'mouseover';
  listenFunction(src, eventType, listener, opt_capture, opt_handler);
};

/**
 * Stops listening to an event associated with the user entering an element. For
 * Desktop, this event is mouseover. For tablets and mobile devices, this may
 * differ.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @param {boolean=} opt_listenOnce If true, only listens once. If false or not
 *     provided, listens for many occurences of the event.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.unlistenForMouseOver =
    function(src, listener, opt_capture, opt_handler, opt_listenOnce) {
  var eventType = FLAG_MOBILE ? 'touchstart' : 'mouseover';
  goog.events.unlisten(src, eventType, listener, opt_capture, opt_handler);
};

/**
 * Listens to an event associated with the user leaving an element. For
 * Desktop, this event is mouseout. For tablets and mobile devices, this may
 * differ.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @param {boolean=} opt_listenOnce If true, only listens once. If false or not
 *     provided, listens for many occurences of the event.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.listenForMouseOut =
    function(src, listener, opt_capture, opt_handler, opt_listenOnce) {
  var listenFunction =
      opt_listenOnce ? goog.events.listenOnce : goog.events.listen;
  var eventType = FLAG_MOBILE ? 'touchend' : 'mouseout';
  listenFunction(src, eventType, listener, opt_capture, opt_handler);
};

/**
 * Stops listening to an event associated with the user leaving an element. For
 * Desktop, this event is mouseout. For tablets and mobile devices, this may
 * differ.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @param {boolean=} opt_listenOnce If true, only listens once. If false or not
 *     provided, listens for many occurences of the event.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.unlistenForMouseOut =
    function(src, listener, opt_capture, opt_handler, opt_listenOnce) {
  var eventType = FLAG_MOBILE ? 'touchend' : 'mouseout';
  goog.events.unlisten(src, eventType, listener, opt_capture, opt_handler);
};

/**
 * Removes listeners to an event associated with the user clicking.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.unlistenForPress =
    function(src, listener, opt_capture, opt_handler) {
  goog.events.unlisten(src, 'click', listener, opt_capture, opt_handler);
};

/**
 * Listens to an event associated with the user pressing down. For Desktop, this
 * event is mousedown. For tablets and mobile devices, this may differ.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @param {boolean=} opt_listenOnce If true, only listens once. If false or not
 *     provided, listens for many occurences of the event.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.listenForUpPress =
    function(src, listener, opt_capture, opt_handler, opt_listenOnce) {
  var listenFunction =
      opt_listenOnce ? goog.events.listenOnce : goog.events.listen;
  var eventType = FLAG_MOBILE ? 'touchend' : 'mouseup';
  listenFunction(src, eventType, listener, opt_capture, opt_handler);
};

/**
 * Removes listeners to an event associated with the user pressing down. For
 * Desktop, this event is mousedown. For tablets and mobile devices, this may
 * differ.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @param {boolean=} opt_listenOnce If true, only listens once. If false or not
 *     provided, listens for many occurences of the event.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.unlistenForUpPress =
    function(src, listener, opt_capture, opt_handler, opt_listenOnce) {
  var functionToUse = goog.events.unlisten;
  var eventType = FLAG_MOBILE ? 'touchend' : 'mouseup';
  functionToUse(src, eventType, listener, opt_capture, opt_handler);
};

/**
 * Listens to an event associated with the user pressing down. For Desktop, this
 * event is mousedown. For tablets and mobile devices, this may differ.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.listenForDownPress =
    function(src, listener, opt_capture, opt_handler) {
  var eventType = FLAG_MOBILE ? 'touchstart' : 'mousedown';
  goog.events.listen(src, eventType, listener, opt_capture, opt_handler);
};

/**
 * Removes listeners to an event associated with the user pressing down. The
 * event type may differ between Desktop and mobile.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.unlistenForDownPress =
    function(src, listener, opt_capture, opt_handler) {
  var eventType = FLAG_MOBILE ? 'touchstart' : 'mousedown';
  goog.events.unlisten(src, eventType, listener, opt_capture, opt_handler);
};

/**
 * Listens to an event associated with the user moving within some area. For
 * Desktop, this event is mouseover.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.listenForMove =
    function(src, listener, opt_capture, opt_handler) {
  var eventType = FLAG_MOBILE ? 'touchmove' : 'mousemove';
  goog.events.listen(src, eventType, listener, opt_capture, opt_handler);
};

/**
 * Removes listeners to an event associated with the user moving within some
 * area.
 * @param {goog.events.ListenableType} src Event source.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @template T,EVENTOBJ
 */
audioCat.utility.DomHelper.prototype.unlistenForMove =
    function(src, listener, opt_capture, opt_handler) {
  var eventType = FLAG_MOBILE ? 'touchmove' : 'mousemove';
  goog.events.unlisten(src, eventType, listener, opt_capture, opt_handler);
};

/**
 * Creates a DIV element with a certain class.
 * @param {string=} opt_elementClass An optional class to assign to the element.
 * @return {!Element} The created element.
 */
audioCat.utility.DomHelper.prototype.createDiv = function(opt_elementClass) {
  return this.createElement_('div', opt_elementClass);
};

/**
 * Creates a SPAN element with a certain class.
 * @param {string=} opt_elementClass An optional class to assign to the element.
 * @return {!Element} The created element.
 */
audioCat.utility.DomHelper.prototype.createSpan = function(opt_elementClass) {
  return this.createElement_('span', opt_elementClass);
};

/**
 * Creates an element with a certain class.
 * @param {string} tagName The tag name of the element to create.
 * @param {string=} opt_elementClass An optional class to assign to the element.
 * @return {!Element} The created element.
 * @private
 */
audioCat.utility.DomHelper.prototype.createElement_ = function(
    tagName, opt_elementClass) {
  var element = this.createElement(tagName);
  if (opt_elementClass) {
    goog.dom.classes.add(element, opt_elementClass);
  }
  return element;
};

/**
 * Sets the raw inner HTML for an element without escaping.
 * @param {!Element} element The element.
 * @param {string} rawInnerHtml The raw inner HTML.
 */
audioCat.utility.DomHelper.prototype.setRawInnerHtml = function(
    element,
    rawInnerHtml) {
  element.innerHTML = rawInnerHtml;
};

/**
 * Sets the CSS transform property for an element. Handles browser differences.
 * @param {!Element} element The element.
 * @param {string} value The CSS transform value.
 */
audioCat.utility.DomHelper.prototype.setCssTransform = function(
    element,
    value) {
  element.style[this.transformPropertyName_] = value;
};

/**
 * Creates a javascript tag.
 * @param {string} src The source of the javascript.
 * @return {!Element} The new javascript tag.
 */
audioCat.utility.DomHelper.prototype.createJavascriptTag = function(src) {
  var scriptTag = this.createElement('script');
  scriptTag.setAttribute('type', 'text/javascript');
  scriptTag.src = src;
  return scriptTag;
};

/**
 * Sets the value of an attribute for an element.
 * @param {!Element} element
 * @param {string} attributeName The name of the attribute.
 * @param {string} value The value of the attribute.
 */
audioCat.utility.DomHelper.prototype.setAttributeValue = function(
    element, attributeName, value) {
  element.setAttribute(attributeName, value);
};

/**
 * Sets the role of an element. Should be application or presentation.
 * @param {!Element} element The element to set the role for.
 * @param {string} role The role to set.
 */
audioCat.utility.DomHelper.prototype.setRole = function(element, role) {
  this.setAttributeValue(element, 'role', role);
};

/**
 * Sets the tab index for an element. Tab ordering is reverse tab index order
 * and then DOM ordering. Lets use 0 in general for consistency. -1 makes an
 * element unfocusable.
 * @param {!Element} element
 * @param {number} tabIndex
 */
audioCat.utility.DomHelper.prototype.setTabIndex = function(element, tabIndex) {
  this.setAttributeValue(element, 'tabindex', '' + tabIndex);
};

/**
 * Sets the aria label for an element. The aria label is the string spoken by
 * screen readers when describing an element.
 * @param {!Element} element
 * @param {string} label The aria label.
 */
audioCat.utility.DomHelper.prototype.setAriaLabel = function(element, label) {
  this.setAttributeValue(element, 'aria-label', label);
};

/**
 * Obtains the client X value of an event. - the X coord of an event relative to
 * the viewport. This assumes a mouse or touch related event.
 * @param {!goog.events.BrowserEvent} event The event.
 * @return {number} The X position in pixels relative to viewport.
 */
audioCat.utility.DomHelper.prototype.obtainClientX = function(event) {
  var eventType = event.type;
  if (eventType.indexOf('mouse') == 0 || eventType == 'click') {
    return event.clientX;
  } else if (eventType.indexOf('touch') == 0) {
    var browserEvent = event.getBrowserEvent();
    var changedTouches = browserEvent.changedTouches;
    goog.asserts.assert(changedTouches.length > 0);
    var touch = changedTouches[0];
    return touch.clientX;
  }
  goog.asserts.fail('This event should lack a client X value.');
};

/**
 * Obtains the client Y value of an event. - the Y coord of an event relative to
 * the viewport. This assumes a mouse or touch related event.
 * @param {!goog.events.BrowserEvent} event The event.
 * @return {number} The Y position in pixels relative to viewport.
 */
audioCat.utility.DomHelper.prototype.obtainClientY = function(event) {
  var eventType = event.type;
  if (eventType.indexOf('mouse') == 0 || eventType == 'click') {
    return event.clientY;
  } else if (eventType.indexOf('touch') == 0) {
    var browserEvent = event.getBrowserEvent();
    var changedTouches = browserEvent.changedTouches;
    goog.asserts.assert(changedTouches.length > 0);
    var touch = changedTouches[0];
    return touch.clientY;
  }
  goog.asserts.fail('This event should lack a client Y value.');
};

/**
 * Obtains the offset X value of an event. - the X coord of an event relative to
 * its container. This assumes a mouse or touch related event.
 * @param {!goog.events.BrowserEvent} event The event.
 * @return {number} The X position in pixels relative to viewport.
 */
audioCat.utility.DomHelper.prototype.obtainOffsetX = function(event) {
  var eventType = event.type;
  if (eventType.indexOf('mouse') == 0 || eventType == 'click') {
    return event.offsetX;
  } else if (eventType.indexOf('touch') == 0) {
    var browserEvent = event.getBrowserEvent();
    var changedTouches = browserEvent.changedTouches;
    goog.asserts.assert(changedTouches.length > 0);
    var touch = changedTouches[0];
    return touch.pageX - touch.target.clientLeft;
  }
  goog.asserts.fail('This event should lack an offset X value.');
};

/**
 * Obtains the offset Y value of an event. - the Y coord of an event relative to
 * its container. This assumes a mouse or touch related event.
 * @param {!goog.events.BrowserEvent} event The event.
 * @return {number} The Y position in pixels relative to viewport.
 */
audioCat.utility.DomHelper.prototype.obtainOffsetY = function(event) {
  var eventType = event.type;
  if (eventType.indexOf('mouse') == 0 || eventType == 'click') {
    return event.offsetY;
  } else if (eventType.indexOf('touch') == 0) {
    var browserEvent = event.getBrowserEvent();
    var changedTouches = browserEvent.changedTouches;
    goog.asserts.assert(changedTouches.length > 0);
    var touch = changedTouches[0];
    return touch.pageY - touch.target.clientTop;
  }
  goog.asserts.fail('This event should lack an offset Y value.');
};

/**
 * Obtains the left offset of an element.
 * @param {!Element} element The element.
 * @return {number} The left offset of an element in pixels - its distance from
 *     the left of its container.
 */
audioCat.utility.DomHelper.prototype.getLeftOffset = function(element) {
  return element.offsetLeft;
};

/**
 * Obtains the top offset of an element.
 * @param {!Element} element The element.
 * @return {number} The top offset of an element in pixels - its distance from
 *     the top of its container.
 */
audioCat.utility.DomHelper.prototype.getTopOffset = function(element) {
  return element.offsetTop;
};
