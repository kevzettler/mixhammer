<?php
  
  if(empty($_GET) && empty($_POST)){
    include_once('splash.html');
  }else{  
  
    $method = (isset($_POST['payload'])) ? $_POST : $_GET;
    $callback = (isset($method['callback'])) ? $method['callback'] : '';
    $payloads = array();
    $images = array('');
    $stream = array();
		$sep = chr(1); # control-char SOH/ASCII 1
		$newline = chr(3); # control-char ETX/ASCII 3
		
    
    if(isset($method['payload'])){
      if(isset($method['form_submit'])){
        $payloads['files'] = explode("\n", trim($method['payload']));
      }else{
        $payloads = json_decode(stripslashes($method['payload']), true);
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
            'data' => base64_encode(curl_multi_getcontent($$name)),
            'id' => $count - 1
          );
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
  }
?>