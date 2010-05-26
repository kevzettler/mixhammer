    $(document).ready(function(){
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
        var content = '<a href="#" class="asset_link">+ '+mime+'</a><pre style="display:none;">'+payload+'</pre> \n';
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
        totalAssets = 0;
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
            lazy_mode : true
          }
        });
        
        return false;
      });
      
      
      $output.focus(function(){
        var $this = $(this);
        $this.select();
      });
      
    });