$(document).ready(function(){
    var $input_form = $('#input_form')
    , $output = $('#output')
    , $input = $('#input')
    , $submit_btn = $("#form_submit")
    , $mxhr_output = $('#mxhr-output')
    , $standard_output = $('#standard-output')
    , submit_default = $submit_btn.val()
    , file_ext_regex = /\.([a-z]*?)$/i
    , streamStart
    , totalAssets = 0
    , assets = {}
    ;

    String.prototype.trim = function () {
        return this.replace(/^\s*/, "").replace(/\s*$/, "");
    }
      

    function assetLinkClick(e){
        e.preventDefault();
        var $target = $(e.target);
        if($target.text().charAt(0) == '+'){
          _gaq.push(['_trackEvent', 'Click', 'Show', $target.text()]);
          $target.text($target.text().replace('+', '-'));
      }else{
          _gaq.push(['_trackEvent', 'Click', 'Hide', $target.text()]);
          $target.text($target.text().replace('-', '+'));
      }
      $target.next().toggle('slow');
      return false;
    }

    function formSubmit(e){
        e.preventDefault();
        _gaq.push(['_trackEvent', 'Click', 'Generate']);
        var $this = $(this);
        //reset every thing
        $submit_btn.val('Loading...').attr('disabled', 'disabled');
        $standard_output.empty();
        $mxhr_output.empty();

        //ajax to the server to build the cache
        console.log("ajaxin", $input.val());
        $.ajax({
          url : $this.attr('action'),
          type : $this.attr('method'),
          dataType: 'json',
          data: {
            payload : $input.val()
          },
          success : function(json){
            console.log("success", json);
            if(json.cache){
              mxhr_call(json.cache);
            }
          }
        });

        return false;
    }
      
      // --------------------------------------
      // mxhr listner setup
      // --------------------------------------
      
      //handle images
      function processImage(payload, metaData, mime){
        console.log("image processesed");
        var content = '<a href="#" class="asset_link">+ '+mime+'</a><img src="data:image/gif;base64,'+payload+'" style="display:none;"/> <br />\n';
        if(!assets.images){
          assets.images = {count: 0, content: ''};
        }
        assets.images.count++;
        assets.images.content += content;
      }
      
      //handle 'scripts'
      function processScript(payload, metaData, mime){
        console.log("script processed");
        mime = mime.split('/')[1];
        var content = '<a href="#" class="asset_link">+ '+mime+'</a><pre style="display:none;">'+payload+'</pre> <br />\n';
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
      $.mxhr.listen('application/x-javascript', processScript);
      $.mxhr.listen('text/css', processScript);
      
      $.mxhr.listen('complete', function(text) {
        console.log("mxhr complete", text);
        var time = new Date().getTime() - streamStart;
        _gaq.push(['_trackEvent', 'Complete', 'MXHR', time, $input.val()]);
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
        $mxhr_output.prepend('<label>'+totalAssets+' assets in a MXHR request took: <strong>'+time+'ms</strong> about '+ (Math.floor(100 * (time / totalAssets)) / 100) + 'ms per asset</label>');
        
        //we haave to decode the pretags content from base64 to display it as readable code
        $mxhr_output.find('pre').each(function(){
           var $this = $(this);
           $this.html(Base64.decode($this.html()));
        });
       
        //process assets in a traditional manner
        var normalStart = new Date().getTime();
        var std_assets = $input.val().trim().split('\n');
        var std_assets_data = {};
        var count = 0;
        
        function standardIncrement(){
          count++;
          if(count == std_assets.length){
            var time = new Date().getTime() - normalStart;
            _gaq.push(['_trackEvent', 'Complete', 'Standard', time, $input.val()]);
            for(var asset in std_assets_data){
              if(std_assets_data.hasOwnProperty(asset)){
                var $the_bin = $standard_output.find('.'+asset+'_bin');
                $the_bin.find('.asset_link:first').text("+ " + std_assets_data[asset].count + " " + asset);
                $the_bin.show();
              }
            }
            $standard_output.prepend('<label>'+std_assets.length+' individual assets took: <strong>'+time+'ms</strong> about '+ (Math.ceil(100 * (time / totalAssets)) / 100) + 'ms per asset</label>');
          }
        }
        
        $.each(std_assets, function(index, value){
          var matches = value.match(file_ext_regex);
          if(matches == null){ return false;}
          var ext = matches[1];
          
          
          /*
          * Handle images
          */
          if(ext == 'gif' || ext == 'jpeg' || ext == 'jpg' || ext == 'png'){
            if(!std_assets_data.image){
              std_assets_data.image = {count : 0, content: ''};
            }
            
            //make a bin 'containin div' for the imates
            if($standard_output.find('.image_bin').length <= 0){
              $standard_output.append('<div class="asset_bin image_bin" style="display:none;"><div style="display:none;"></div></div>');
            }
            
            //build the image
            var img = document.createElement('img');
            img.src = value + "?cache_bust=" + new Date().getTime() * Math.random();
            img.onload = function(){
              std_assets_data.image.count += 1;
              standardIncrement();
            };
            
            //build the link
            img.style.display = "none";
            var img_link = document.createElement('a');
            img_link.href = "#";
            img_link.className = "asset_link";
            img_link.innerHTML = '+ '+ext;
            
            //build the break
            var br = document.createElement('br');
            
            //if theres no top level link create one
            if($standard_output.find('.image_bin .asset_link').length <= 0){
              $standard_output.find('.image_bin').prepend('<a href="#" class="asset_link">+ '+std_assets_data.image.count+' images</a> \n');
            }
            
            var node = $standard_output.find('.image_bin div:first').get();
            node[0].appendChild(img_link);
            node[0].appendChild(img);
            node[0].appendChild(br);
          }
          
          /*
          * Scripts, js, css
          */
          if(ext == 'css' || ext == 'js'){
            if(!std_assets_data[ext]){
              std_assets_data[ext] = {count : 0, content: ''};
            }
            
            if($standard_output.find('.'+ext+'_bin').length <= 0){
              $standard_output.append('<div class="asset_bin '+ext+'_bin" style="display:none;"><div style="display:none;"></div></div>');
            }
            
            var src = value + "?cache_bust=" + new Date().getTime() * Math.random();
            var iframe = $('<iframe src="'+src+'"></iframe>');
            iframe.css({'display' : 'none'});
            iframe.load(function(){
              std_assets_data[ext].count += 1;
              standardIncrement();
            });
           
            var scp_link = $('<a href="#" class="asset_link">+ '+ext+'</a>');

            //only append one link per asset type
            if($standard_output.find('.'+ext+'_bin .asset_link').length <=0){
              $standard_output.find('.'+ext+'_bin').prepend('<a href="#" class="asset_link">+ '+std_assets_data[ext].count+' '+ ext + '</a> \n');
            }
            $standard_output.find('.'+ext+'_bin div:first').append(scp_link).append(iframe).append('<br />');
          }

            $output.val(text);//I forgot what this does deprecated?
           
        });
        $('#form_submit').val(submit_default).removeAttr('disabled');
      });
      
      //function to call the mxhr request
      function mxhr_call(cache_name){
        console.log("mxhr_call", cache_name, $input_form.attr('method'));
        _gaq.push(['_trackEvent', 'Cache', cache_name, $input.val()]);
        streamStart = new Date().getTime();
        assets = {};
        totalAssets = 0;
        //use mxhr request for assets
        $.mxhr.load({
          url : '/cache/'+cache_name,
          type : $input_form.attr('method')
        });
      }

      $(document).on('click', '.asset_link', assetLinkClick);
      $input_form.submit(formSubmit);
     
    });