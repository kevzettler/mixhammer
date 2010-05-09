(function(){
  var mixhammer = {
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
			'MSXML2.XMLHTTP.3.0', // Doesn't support readyState == 3 header requests.
		],
		
  }


})();