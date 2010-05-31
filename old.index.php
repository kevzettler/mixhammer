<?php
  $request = array_merge($_GET, $_POST);
  if(empty($request)){
    include_once('splash.html');
  }else{  
    /*
    $callback = (isset($request['callback'])) ? $request['callback'] : '';
    $payloads = array();
    $images = array('');
    $stream = array();
		$sep = chr(1); # control-char SOH/ASCII 1
		$newline = chr(3); # control-char ETX/ASCII 3
		
    
    if(isset($request['payload'])){
      if(isset($request['form_submit'])){
        $payloads['files'] = explode("\n", trim($request['payload']));
      }else{
        $payloads = json_decode(stripslashes($request['payload']), true);
      }
    }
    
    if(empty($payloads)){
      exit(json_encode(array('error' => 'the payload was empty or not propely formatted')));
    }
    
    $mh = curl_multi_init();
    
    foreach($payloads as $payload_type => $payload_items){
      $count = 0;
      foreach($payload_items as $key => $item){
        if(preg_match("/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/", $item)){
          $count = $count+1;
          $name = $payload_type . $count;
          $$name = curl_init();
          curl_setopt(${$name}, CURLOPT_URL, $item);
          curl_setopt(${$name}, CURLOPT_RETURNTRANSFER, 1);
          curl_multi_add_handle($mh,${$name});
        }else{
          print "<pre>{$name} was not a valid url \n</pre>";
          unset($payloads[$payload_type][$key]);
        }
      }
    }
    
     // Start performing the request
    do {
        $execReturnValue = curl_multi_exec($mh, $runningHandles);
    } while ($execReturnValue == CURLM_CALL_MULTI_PERFORM);
    // Loop and continue processing the request
    while ($runningHandles && $execReturnValue == CURLM_OK) {
      // Wait forever for network
      $numberReady = curl_multi_select($mh);
      if ($numberReady != -1) {
        // Pull in any new data, or at least handle timeouts
        do {
          $execReturnValue = curl_multi_exec($mh, $runningHandles);
        } while ($execReturnValue == CURLM_CALL_MULTI_PERFORM);
      }
    }
    
    // Check for any errors
    if ($execReturnValue != CURLM_OK) {
      error_log("Curl multi read error $execReturnValue\n", E_USER_WARNING);
    }
    
    foreach($payloads as $payload_type => $payload_items){
      $count = 0;
      foreach($payload_items as $item){
        $count = $count+1;
        $name = $payload_type . $count;
        // Check for errors
        $curlError = curl_error($$name);
        if($curlError == "") {
          $res[$$name] = array( 
            'content_type' => curl_getinfo($$name, CURLINFO_CONTENT_TYPE),
            'data' => curl_multi_getcontent($$name),
            'id' => $count - 1
          );
          if(strstr($res[$$name]['content_type'], 'image/')){
            $res[$$name]['data'] = base64_encode($res[$$name]['data']);
          }
          
        } else {
          print "Curl error on handle $name : $curlError\n\r";
        }
        // Remove and close the handle
        curl_multi_remove_handle($mh, ${$name});
        curl_close(${$name});
      }
    }
    
    // Clean up the curl_multi handle
    curl_multi_close($mh);
    // Print the response data
    foreach($res as $result){
      $stream[] =  $result['content_type'] . $sep . (isset($result['id']) ? $result['id'] : '') . $sep . $result['data'];
    }
    
    echo 1 . $newline . implode($newline, $stream) . $newline;
    */
    ?>
1image/gif0R0lGODlhMAAwAOYAAP////v58ff39+/v7/ju1vPkvebm5t7e3uffydbW1uDXvN3QsczMzNrGkP/MAMXFxffEAL29vd+8YPXBALq5t/C9ALW1tee0AMStfa2trdarNsuqVNSuGt+sALOoi6WlpaihlsmnT52hqdqnANajAMehGcSgRKObj8CdR5mZmcyZAJOXpZmZmaCTgMaSAIyQnLGKNLuWGJ6PcoqOmcOPAKSKVImNlr2OGJ6JYoyMjL6LALeKCrOGHpeFa4SEhLaDAH2BiJZ/WrJ7AJh7SZt8Na16AHt+gqV9Ent7e5t1KKp0AJZ4OKVyAJh0GnN1e3Nzc3RwaqNuAIFrS5lmAHFuYoxkIGptc2ZmZpJkE5lmAI1mMJlmAItjEHFgT2djW2ZmZnxgK2ZmZpZeAIxZAH9bGYlWAIhVBl5eX1lZWXVRKYVSAHtTD4JMAFJSUnZGBn1KAGVIK3pDAEtNUUhISGlFD3RBAF8/H2ZADEJCQm47AD1BR1Q9Gzo6OmYzAD42KzMzMyH5BAQUAP8ALAAAAAAwADAAAAf/gACCg4SFhoeIiYqLjAIHFjkpDAOMlZUGDx8+PikZKU9IGQcCigQSGhIIpJYCCZCRGRERFLQUGTlWEZSHBTskFyQ6Gwqrh46ZkR8WshQWzhnNHylWOQzFgwE3Fw7cFSo6IcSGBjk5yrLOzxYMD7fln0gR14INLhMT3N0qPyEL1wkZDLjKQHDdAQbu3qVIYQSJhV2EUKjocKEChHwOvP0w4U8QQAOjBhwYkECTj3KRFqq8ksKAIR4uSJCgWAFjRhVCOA5AeKDnAAtITipUqfKDFR8JDB35oUMFiREU8XGDAMFbTg8fQB4wQAEl0aIfwqa4kgGioCNMivyg4XTEhQtS/x1QreCiiYiePROkJBq2b9gMVowkuAZjypS0a51SvHARI4e7eAfsTeHXL8EMaFoSwhDF8GEhOlwortjYAYcVeEdKo1z5w+WCH9poFmSAiOcpUZSAjjmTtGnUCYL3ZG35dUEKsX2MAiCAQY3buJUwVaECKtzTB4IHH1D8dTpnFGadybG81Ykk0KOobVr9QokX2bX3dG38uwVaDyx8uPLkoSABXOEA3WFqsUVCDDPEp90AEVxm330RMGCBSmg8URYhJIGwhBjQIebCDQlqt2BB31HAgCsoRSKHFRTMA2AEMmDB4W1MCHGEDQqKaMB3D2T3QYrv4GHFA/P8d0AGQ4wxo/9hUWCBo4jycZUAJikMlaKQ1iSyUwtVjHEbF09CqR0Ar6BkxRXUlOPDikkp4ogFQZjh5RRcAJEjlAMIlQMQXjShBBZUzDDDExUeUAlJJ2ihhhh13qmjnl78IGkRShCByxlGGFrJiz2ssYadYson1BU70KCDpJIyAYYcylnyXwIgSJFpqNqdZMQS1NFgqg5TiCEGHEMWuciOSDgq4klXrMWWCy4Y5usabXxgliUMFEtrAgxs0oUQQkzHhGFjjKGGHq266tETxgb3gA9OgBGFemv5Kka44zqhqbkJoHttBD5YQQaHUfwQha/0viFHseZ6ZIWCDDTcsCtGXLFGuGL8EO7/xWrQcUa5+FqBrcMgAxSxG2+oUYYSZaSshhps7MGSSwkzcMVBIDtckhFW3FFHHG9MsTLLb7zhB1nTVpLAFR/XfGIKSDxhRx951DEGG0EHfceKRCYMQAJn0Kz0ATkggQQafZQddBxoxzE0x/iekXTNB/ggNhJnwAF1HHXkvcccRGu9dddKN3yAEU7MjQQUdOSheBp/XIGUsIwkgMcDbzt8wBOYZ/6EE12k0YUVjfvntwA5/JFC5SdqrvoTcvBxBRJt+g2AASnw4XHNCVixOqF/nHGGhUUnbABmc1AOMn+an8FHG2im8ADMsg8ywANO/PHBxw8g/4QVeOBxxRU5RLBcTvSFtFI77AlEgHzrV2AqSvDkMzd8G3IwEIEVaPT++/Xwxy/9A0/ggxGW17znQc5/hGhFDpgHvggY4IAILB9XUmCB8UXQVQMwQP8uyMFAAAA7application/javascript1    $(document).ready(function(){
      var $input_form = $('#input_form');
      var $output = $('#output');
      var $input = $('#input');
      var $submit_btn = $("#form_submit");
      var $mxhr_output = $('#mxhr-output');
      var $standard_output = $('#standard-output');
      var submit_default = $submit_btn.val();
      var file_ext_regex = /\.([a-z]*?)$/i;
      var streamstart;
      
      $('body').click(function(e){
        var $target = $(e.target);
        if($target.hasClass('asset_link')){
          if($target.text().charAt(0) == '+'){
            $target.text($target.text().replace('+', '-'));
          }else{
            $target.text($target.text().replace('-', '+'));
          }
          $target.next().toggle('slow');
          return false;
        }
      });
      
      // --------------------------------------
      // Test code mxhr listner setup
      // --------------------------------------
      var totalAssets = 0;
      var assets = {};
      
      function processImage(payload, payloadId, mime){
        var content = '<a href="#" class="asset_link">+ '+mime+'</a><img src="data:image/gif;base64,'+payload+'" style="display:none;"/>';
        if(!assets.images){
          assets.images = {count: 0, content: ''};
        }
        assets.images.count++;
        assets.images.content += content;
      }
      
      function processScript(payload, payloadId, mime){
        mime = mime.split('/')[1];
        var content = '<a href="#" class="asset_link">+ '+mime+'</a><pre style="display:none;">'+payload+'</pre>';
        if(!assets[mime]){
          assets[mime] = {count: 0, content: ''};
        }
        assets[mime].count++;
        assets[mime].content += content;
      }
      
      $.mxhr.listen('image/gif', processImage);
      $.mxhr.listen('image/jpeg', processImage);
      $.mxhr.listen('image/jpg', processImage);
      $.mxhr.listen('image/png', processImage);
    
      $.mxhr.listen('text/html', processScript);
      $.mxhr.listen('application/javascript', processScript);
      $.mxhr.listen('text/css', processScript);
    
      $.mxhr.listen('complete', function(text) {
        var time = new Date().getTime() - streamStart;
        for(var asset in assets){
          if(assets.hasOwnProperty(asset)){
            totalAssets += assets[asset].count;
            if(assets[asset].count > 0){
              if($mxhr_output.find('.'+asset+'_bin').length <= 0){
                $mxhr_output.append('<div class="asset_bin '+asset+'_bin"><div style="display:none;"></div></div>');
              }
              $mxhr_output.find('.'+asset+'_bin').prepend('<a href="#" class="asset_link">+ '+assets[asset].count+' '+ asset + '</a> \n');
              $mxhr_output.find('.'+asset+'_bin div:first').append(assets[asset].content);
            }
          }
        }    
        $mxhr_output.prepend('<label>'+totalAssets+' assets in a MXHR request took: <strong>'+time+'ms</strong> about '+ (Math.round(100 * (time / totalAssets)) / 100) + 'ms per asset</label>');
        
        totalAssets = 0;
        //assets = {};
        
        //process assets in a traditional manner
        var normalStart = new Date().getTime();
        var std_assets = $input.val().split('\n');
        var std_assets_data = {};
        var count = 0;
        
        function standardIncrement(){
          count++;
          if(count == std_assets.length){
            var time = new Date().getTime() - normalStart;
            for(var asset in std_assets_data){
              if(std_assets_data.hasOwnProperty(asset)){
                var $the_bin = $standard_output.find('.'+asset+'_bin')
                $the_bin.find('.asset_link:first').text("+ " + std_assets_data[asset].count + " " + asset);
                $the_bin.show();
              }
            }
            $standard_output.prepend('<label>'+std_assets.length+' regular uncached assets took: <strong>'+time+'ms</strong> about '+ (Math.round(100 * (time / totalAssets)) / 100) + 'ms per asset</label>');
          }
        }
        
        $.each(std_assets, function(index, value){
          var ext = value.match(file_ext_regex)[1];          

          if(ext == 'gif' || ext == 'jpeg' || ext == 'jpg' || ext == 'png'){
            if(!std_assets_data.image){
              std_assets_data.image = {count : 0, content: ''};
            }
            
            if($standard_output.find('.image_bin').length <= 0){
              $standard_output.append('<div class="asset_bin image_bin" style="display:none;"><div style="display:none;"></div></div>');
            }
            
            var img = document.createElement('img');
            img.src = value + "?cache_bust=" + (new Date).getTime() * Math.random();
            img.onload = function(){
              std_assets_data.image.count += 1;
              standardIncrement();
            };
            img.style.display = "none";
            var link = document.createElement('a');
            link.href = "#";
            link.className = "asset_link";
            link.innerHTML = '+ '+ext;
            if(typeof std_assets_data.image.content == 'string'){
              std_assets_data.image.content = document.createDocumentFragment();
            }
            std_assets_data.image.content.appendChild(link);
            std_assets_data.image.content.appendChild(img);
            
            $standard_output.find('.image_bin').prepend('<a href="#" class="asset_link">+ '+std_assets_data.image.count+' images</a> \n');
            var node = $standard_output.find('.image_bin div:first').get();
            node[0].appendChild(std_assets_data.image.content.cloneNode(true));
          }
                      
          if(ext == 'css' || ext == 'js'){
            if(!std_assets_data[ext]){
              std_assets_data[ext] = {count : 0, content: ''};
            }
            
            if($standard_output.find('.'+ext+'_bin').length <= 0){
              $standard_output.append('<div class="asset_bin '+ext+'_bin" style="display:none;"><div style="display:none;"></div></div>');
            }
            
            var src = value + "?cache_bust=" + (new Date).getTime() * Math.random();
            var iframe = $('<iframe src="'+src+'"></iframe>');
            iframe.load(function(){
              std_assets_data[ext].count += 1;
              standardIncrement();
            });
           
            var link = $('<a href="#" class="asset_link">+ '+ext+'</a>');
            
            $output.text(text);
            $standard_output.find('.'+ext+'_bin').prepend('<a href="#" class="asset_link">+ '+std_assets_data[ext].count+' '+ ext + '</a> \n');
            $standard_output.find('.'+ext+'_bin div:first').append(link).append(iframe);
          }
           
        });
        $('#form_submit').val(submit_default).removeAttr('disabled');
      });
      
      //form submit
      $input_form.submit(function(){
        $submit_btn.val('Loading...').attr('disabled', 'disabled');
        $standard_output.empty();
        $mxhr_output.empty();
        var $this = $(this);
        
        streamStart = new Date().getTime();
        //use mxhr request for assets
        $.mxhr.load({
          url : $this.attr('action'),
          type : $this.attr('method'),
          data : {
            payload : $input.val(),
            form_submit : true
          }/*,
          success : function(data, status){
            $output.val(data);
          }*/
        });
        
        return false;
      });
      
      
      $output.focus(function(){
        var $this = $(this);
        $this.select();
      });
      
      /*
      var xhr = $.ajax({ url : "./"});

      xhr._onreadystatechange = xhr.onreadystatechange;
      
      xhr.onreadystatechange = function() {
           xhr._onreadystatechange();
           if (xhr.readyState == 3){alert('Interactive');}
      };
      */
      
    });text/css2@import url('reset.css');
@import url('960.css');
@import url('text.css');


/* start of custom styles */
body{
	font-size:62.5%;
	font-family: "Trebuchet MS",Helvetica,Jamrul,sans-serif;
}

*{margin:0;padding:0;}
/* sticky footer stuff */
html, body, #wrap {height: 100%;}
body > #wrap {height: auto; min-height: 100%;}
body:before{/*opera */
  content:"";
  height:100%;
  float:left;
  width:0;
  margin-top:-32767px;
}

p{font-size: 1.8em;}
label{font-size: 1.2em;}

#main{overflow:auto;padding-bottom:25px;/*must be footer height*/padding-top:25px;}
#footer{background-color:#e1e1e1;border-radius:5px;-webkig-border-radius:5px;-moz-border-radius:5px;color:#696969;position:relative; margin-top:-25px; height:25px; clear:both;}
#footer a{color:#696969;}
#footer *{padding-top:5px;}

pre{display:block; overflow:scroll;}
textarea, iframe, pre{width:98%;height:300px;padding:5px; border:1px solid black;}

.asset_bin div{padding-left:10px;}
.asset_link{font-size:1.2em;}
<?php
}
?>