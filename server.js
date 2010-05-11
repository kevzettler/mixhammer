//node.js implementation of mixhammer backend
String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

var sys = require('sys'),
  http = require('http'),
  fs = require('fs'),
  url = require('url'),
  base64 = require('./base64'),
  querystring = require('querystring'),
  splash_html = fs.readFileSync('splash.html'),
  url_regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i;

http.createServer(function (request, response) {
  var data = "",
      payloads = {},
      images = {},
      stream = [],
      sep = String.fromCharCode(1);
      newline = String.fromCharCode(3),
      urlQuery = url.parse(request.url).query;
      
  request.addListener("data", function(chunk){
    data += chunk;
  });
  
  request.addListener("end", function(){
    var totalassets = 0
        ,count = 0;
    if(!data && !urlQuery){ //if no data jus display the splash page
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(splash_html);
      response.end();
    }else{
     if(!data){
      data = urlQuery;
     }
    
     var httpParams = querystring.parse(data)
        ,headers = {
          'Date' : 'fake date'
          ,'Content-Type' : 'text/html'
          ,'Vary' : 'Accept-Encoding'
          ,'Accept-Charset' : 'iso-8859-5, unicode-1-1;q=0.8'
          ,'Content-Encoding' : 'chunked'
          ,'Server' : 'node-apache'
        };
        
     sys.puts(sys.inspect(httpParams));   
        
     total_response = response;
     total_response.writeHead(200, headers);
     total_response.write("1"+newline);
    
    //build up what files the request is for
    if(httpParams.payload){
      if(httpParams.lazy_mode){//lazy mode is for the demo 
        payloads.files = httpParams.payload.split('\n');
      }else{
        //if were nto using lazy mode and passing more verbose data like ids
        //payloads = json_decode(stripslashes($request['payload']), true);
      }
    }
    
    for(var payload_type in payloads){
      totalassets += payloads[payload_type].length;
      for(var i=0; i<payloads[payload_type].length; i++){ (function(i){
        var rep_data = '',
            urlObj = url.parse(payloads[payload_type][i].trim()),
            httpClient = http.createClient(80, urlObj.hostname),
            httpC_req = httpClient.request('GET', urlObj.pathname, {'host' : urlObj.hostname});
        httpC_req.addListener('response', function(response){
          response.addListener('data', function(chunk){
            rep_data += chunk;
          });
          
          response.addListener('end', function(){
           var image_match = response.headers['content-type'].match('image')
           if (image_match && image_match.length >= 1){
              rep_data = base64.encode(rep_data);
            }
            total_response.write(response.headers['content-type'] + sep + rep_data + newline);
            count++;
            if(count == totalassets){
              httpC_req.end();
              total_response.end();
            }
          });
        });
        httpC_req.end();
      })(i);
     }
    }
   }
  });

}).listen(8000);

sys.puts('Server running at http://127.0.0.1:8000/');