/*
*node.js implementation of mixhammer backend
*/

/*
*Trim 
*removes whitespace on start and end of string
*/
String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

//require node js librarys
var sys = require('sys'),
  http = require('http'),
  fs = require('fs'),
  url = require('url'),
  crypto = require('crypto'),
  base64 = require('./base64'),
  querystring = require('querystring');

//html content for splash page
var  splash_html = fs.readFileSync('/home/vekz/mixhammer.com/index.html');
  
//regex for validating urls
var  url_regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i;

http.createServer(function (request, response) {
  var data = "",
      cache_hash = "",
      payloads = {},
      images = {},
      stream = [],
      mxhr_tree = {},
      sep = String.fromCharCode(1);  //seperator character for MXHR response
      newline = String.fromCharCode(3), //newline character for MXHR response
      urlQuery = url.parse(request.url).query;
      
   //function for iterating over th mxhr tree and building the final response   
   function processMxhrTree(){
     //this first peice is supposed to be the mxhr version num, and a newline
     mxhr_string = "1"+newline;
     for(var asset in mxhr_tree){
        for(var i=0; i<mxhr_tree[asset].count; i++){
          mxhr_string += mxhr_tree[asset].mxhr;
        }
     }
    return mxhr_string;
  }     
  
  //fires as data arrives
  request.addListener("data", function(chunk){
    data += chunk;
  });
  
  
  //fires when request is complete
  request.addListener("end", function(){
    var totalassets = 0
        ,count = 0;
    if(!data && !urlQuery){ //if no data(POST) or urlQuery(GET) display the splash page
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(splash_html);
      response.end();
    }else{
     if(!data){// if no data(POST) assume urlQuery(GET) request
      data = urlQuery;
     }
    
     var httpParams = querystring.parse(data)
        ,headers = {
          'Date' : 'fake date'
          ,'Content-Type' : 'text/html; charset=utf-8'
          ,'Vary' : 'Accept-Encoding'
          ,'Content-Encoding' : 'base64'
          ,'Server' : 'node-apache'
        };
        
        
     total_response = response;
     total_response.writeHead(200, headers);
     
    //build up what files the request is for
    if(httpParams.payload){
      if(httpParams.lazy_mode){//lazy mode is for the demo 
       
       //check for a cache, we hash the payload for cachename
        var md5 = crypto.createHash('md5');
        md5.update(httpParams.payload);
        cache_hash = md5.digest('hex'); 
        
        //try reading the cache file
       try{
          var cache_stat = fs.readFileSync('/home/vekz/mixhammer.com/cache/'+ cache_hash + '.txt');
          if(cache_stat){
            sys.puts("Payload was cached" + cache_hash + "\n");
            total_response.write('{"cache" : "'+cache_hash+'"}');
            total_response.end();
            return;
          }
        }catch(err){ //we have to build it other wise
          payloads.files = httpParams.payload.split('\n');
          sys.puts("No Cache, building payload" + cache_hash + "\n" + sys.inspect(payloads));
        }
      }else{
        //sys.puts("not in lazy mode ....?");
        //if were nto using lazy mode and passing more verbose data like ids
        //payloads = json_decode(stripslashes($request['payload']), true);
      }
    }
    //iterate over each payload_type. css, js, images, etc. Only 'files' for a lazy load      
    for(var payload_type in payloads){
      //totalassets += payloads[payload_type].length; //total up the assets for each section
      
      //iterate over each url in the payload collection and build the mxhr_tree
      for(var i=0; i<payloads[payload_type].length; i++){ 
        var asset_url = payloads[payload_type][i].trim();
        if(!mxhr_tree[asset_url]){//set it if its not there
          mxhr_tree[asset_url] = {count : 1, mxhr : ''};
        }else{//otherwise increment it
          mxhr_tree[asset_url].count += 1;
        }
      }
    }
    
    //iterate over the mxhr_tree and call each url 
    for (var asset in mxhr_tree){
      totalassets += 1;
      //create a closure to pair the asset with the asynch procedure
      (function(asset){
      
        var rep_data = '',
            urlObj = url.parse(asset.trim()),
            httpClient = http.createClient(80, urlObj.hostname), //create a httpClient for each asset
            httpC_req = httpClient.request('GET', urlObj.pathname, {'host' : urlObj.hostname}); //use the httpClient to request the assets url

        httpC_req.addListener('response', function(response){
          if (response.headers['content-type'] && response.headers['content-type'].match('image')) { //images have to be encoded to binary
            response.setEncoding('binary');
          }
          
          response.addListener('data', function(chunk){
            rep_data += chunk;            
          });
          
          response.addListener('end', function(){
           //before we were only encoding the images, lets try encoding all general badassery
           //can decode on frontend for displaying css / js
           rep_data = base64.encode(rep_data);

            mxhr_tree[asset].mxhr = response.headers['content-type'] + sep + ' ' + sep  + rep_data + newline;
            count++;

            if(count == totalassets){
              httpC_req.end();
              fs.writeFileSync('/home/vekz/mixhammer.com/cache/'+cache_hash+'.txt', processMxhrTree());
              total_response.write('{"cache" : "'+cache_hash+'"}');
              total_response.end();
              
            }
            
          });//end of the response 'end' listener
        });//end of the httpC_req 'response' listener
        
        httpC_req.end(); //if we get here make sure to kill the httpC_req
      })(asset); //call the closure pass it i for a local scope
     }
     
    }
  });

}).listen(8000); //end of the server

sys.puts('Server running at http://127.0.0.1:8000/');
