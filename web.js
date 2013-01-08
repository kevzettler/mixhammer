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
  express = require('express'),
  mongo = require('mongodb').MongoClient,
  app = express(),
  querystring = require('querystring'),
  port = process.env.PORT || 8080;

  try{
      var env = JSON.parse(fs.readFileSync('/home/dotcloud/environment.json', 'utf-8'));
      console.log(env);
  }catch(ex){

  }

  var mongoURL = (env) ? env.DOTCLOUD_DB_MONGODB_URL : "mongodb://localhost:27017/mixhammer";

  console.log(mongoURL);

  
//regex for validating urls
var  url_regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i;

app.use('/public', express.static(__dirname+'/public'));
app.get('/', function(req,res){
    res.render("index.ejs");
});

app.get('/cache/:id', function(req, res){
    var cache_hash = req.params.id;

    mongo.connect(mongoURL, function(err, db) {
      if(err) { return console.log("mongo connect for cache looup",err); }

      var collection = db.collection('cache');
      collection.findOne({hash: cache_hash}, function(err, item){
        if(err) { return console.log("mongo cache lookup init",err); }
        res.send(item.package);
    });
  });
});

app.post('/', function (request, response) {
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
  request.on("data", function(chunk){
    data += chunk;
  });
  
  
  //fires when request is complete
  request.on("end", function(){
    var totalassets = 0
        ,count = 0;

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
     //total_response.writeHead(200, headers);
     
    //build up what files the request is for
    if(httpParams.payload){
       //check for a cache, we hash the payload for cachename
       var md5 = crypto.createHash('md5');
       md5.update(httpParams.payload);
       cache_hash = md5.digest('hex'); 
       var cache_stat;        
        //try reading the cache file
        // try{
        mongo.connect(mongoURL, function(err, db) {
            if(err) { 
                payloads.files = httpParams.payload.split('\n');
                console.log("No Cache, building payload" + cache_hash + "\n", payloads);
                return console.log("mongo connect for cache:",err);
            }

            var collection = db.collection('cache');
            collection.findOne({hash: cache_hash}, function(err, item){
            if(err) {
                payloads.files = httpParams.payload.split('\n');
                console.log("No Cache, building payload" + cache_hash + "\n", payloads);
                return console.log("mongo query for cache:",err);
            }
               cache_stat = item.package;
               if(cache_stat){
                  sys.puts("Payload was cached" + cache_hash + "\n");
                  total_response.write('{"cache" : "'+cache_hash+'"}');
                  total_response.end();
                  return;
               }
           });
        });


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
    console.log("iterating over assets", mxhr_tree);
    for (var asset in mxhr_tree){
      if(asset == ''){ continue; }
      totalassets += 1;
      //create a closure to pair the asset with the asynch procedure
      (function(asset){
      
        var rep_data = '',
            urlObj = url.parse(asset.trim()),
            httpOpts = {
                port: 80, 
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: "GET"};

        console.log("requesting", httpOpts);

        var req = http.request(httpOpts, function(response){
          if (response.headers['content-type'] && response.headers['content-type'].match('image')) { //images have to be encoded to binary
            response.setEncoding('binary');
          }
          
          response.on('data', function(chunk){
            rep_data += chunk;            
          });
          
          response.on('end', function(){
            console.log("got response for ", httpOpts);
           //before we were only encoding the images, lets try encoding all general badassery
           //can decode on frontend for displaying css / js
           rep_data = base64.encode(rep_data);

            mxhr_tree[asset].mxhr = response.headers['content-type'] + sep + ' ' + sep  + rep_data + newline;
            count++;

            if(count == totalassets){              
              req.end();
              mongo.connect(mongoURL, function(err, db){
                if(err) { 
                    console.log("mongo connect for write: ",err); 
                    total_response.send('{"cache" : "'+cache_hash+'"}');
                    total_response.end();
                }

                var cache = db.collection('cache');
                var record = {hash: cache_hash,
                              package :processMxhrTree()};
                cache.insert(record, function(err, items){
                    if(err) { console.log('mongo write:',err); }
                    console.log("ending total response");
                    total_response.send('{"cache" : "'+cache_hash+'"}');
                    total_response.end(); 
                });
              });             
            }
            
          });//end of the response 'end' listener
        });//end of the httpC_req 'response' listener
        
        req.end(); //if we get here make sure to kill the httpC_req
      })(asset); //call the closure pass it i for a local scope
     }
     
  });

})
app.listen(port);
sys.puts('Server running at http://127.0.0.1:8080/');