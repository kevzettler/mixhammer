/**
 * DUI.Stream: A JavaScript MXHR client
 *
 * Copyright (c) 2009, Digg, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, 
 *   this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, 
 *   this list of conditions and the following disclaimer in the documentation 
 *   and/or other materials provided with the distribution.
 * - Neither the name of the Digg, Inc. nor the names of its contributors 
 *   may be used to endorse or promote products derived from this software 
 *   without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * @module DUI.Stream
 * @author Micah Snyder <micah@digg.com>
 * @author Jordan Alperin <alpjor@digg.com>
 * @description A JavaScript MXHR client
 * @version 0.0.3
 * @link http://github.com/digg/dui
 *
 */
(function($) {

	// ================================================================================
	// MXHR
	// --------------------------------------------------------------------------------
	// F.mxhr is a porting of DUI.Stream (git://github.com/digg/stream.git).
	//
	// We ripped out the jQuery specific code, and replaced it with normal for() loops. 
	// Also worked around some of the brittleness in the string manipulations, and 
	// refactored some of the rest of the code.
	// 
	// Images don't work on IE yet, since we haven't found a way to get the base64
	// encoded image data into an actual image (RFC 822 looks promising, and terrifying:
	// http://www.hedgerwow.com/360/dhtml/base64-image/demo.php)
	//
	// Another possible approach uses "mhtml:", 
	// http://www.stevesouders.com/blog/2009/10/05/aptimize-realtime-spriting-and-more/ 
	//
	// --------------------------------------------------------------------------------
	// GLOSSARY
	// packet:  the amount of data sent in one ping interval
	// payload: an entire piece of content, contained between control char boundaries
	// stream:  the data sent between opening and closing an XHR. depending on how you 
	//          implement MHXR, that could be a while.
	// ================================================================================

  /*
  
  $.getJSON("http://kev.dev.myfit.com/js/hammer.php?callback=?", function(data){
      console.log(data.hammer);
  });
  
  */

$.mxhr = {
	  
	  // --------------------------------------------------------------------------------
		// Variables that must be global within this object.
		// --------------------------------------------------------------------------------
		getLatestPacketInterval: null,
		lastLength: 0,
		listeners: {},
		
		boundary: "\u0003", 		// IE jumps over empty entries if we use the regex version instead of the string.
		fieldDelimiter: "\u0001",

		_msxml_progid: [
			'MSXML2.XMLHTTP.6.0',
			'MSXML3.XMLHTTP',
			'Microsoft.XMLHTTP', // Doesn't support readyState == 3 header requests.
			'MSXML2.XMLHTTP.3.0' // Doesn't support readyState == 3 header requests.
		],
    
		// --------------------------------------------------------------------------------
		// load()
		// --------------------------------------------------------------------------------
		// Instantiate the XHR object and request data from url.
		// --------------------------------------------------------------------------------

		load: function(url) {
			this.req = this.createXhrObject();
			if (this.req) {
				this.req.open('GET', url, true);

				var that = this;
				this.req.onreadystatechange = function() {
					that.readyStateHandler();
				}

				this.req.send(null);
			}
		}
  });  
})(jQuery);
