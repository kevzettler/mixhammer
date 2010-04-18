<?php
  ini_get('display_errors');
 $_POST['payload'] = array(
    "images" => array(
      "http://kev.dev.myfit.com/images/img-doc_talk.png",
      "http://kev.dev.myfit.com/images/header-logo.jpg",
      "http://kev.dev.myfit.com/images/img-logo_techcrunch.png"
    )
  );
  
  
  if(!isset($_GET['payload']) && !isset($_POST['payload'])){
    include_once('index.html');
  }else{  
    $payloads = array();
    $images = array('');
    $stream = array();
    $newline = chr(1);
    
    if(isset($_GET['payload'])){
      $payloads = json_decode(stripslashes($_GET['payload']), true);
    }else if(isset($_POST['payload'])){
      $_POST['payload'] = json_encode($_POST['payload']);
      $payloads = json_decode(stripslashes($_POST['payload']), true);   
    }
    
    echo "<pre>";
var_dump($payloads);
echo "</pre>";
    
    if(empty($payloads)){
      exit(json_encode(array('error' => 'the payload was empty or not propely formatted json')));
    }
    
    $mh = curl_multi_init();
    
    foreach($payloads as $payload_type => $payload_items){
      $count = 0;
      foreach($payload_items as $item){
        $count = $count+1;
        $name = $payload_type . $count;
        $$name = curl_init();
        curl_setopt(${$name}, CURLOPT_URL, $item);
        curl_setopt(${$name}, CURLOPT_RETURNTRANSFER, 1);
        curl_multi_add_handle($mh,${$name});
      }
    }
    
    echo "<pre> about to execute mh";
var_dump($mh);
echo "</pre>";
    
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
    
    echo "<pre> made it through shitty while loop";
var_dump($execReturnValue, $numberReady);
echo "</pre>";

    // Check for any errors
    if ($execReturnValue != CURLM_OK) {
      trigger_error("Curl multi read error $execReturnValue\n", E_USER_WARNING);
    }
    
    
    foreach($payloads as $payload_type => $payload_items){
      $count = 0;
      foreach($payload_items as $item){
        $count = $count+1;
        $name = $payload_type . $count;
        // Check for errors
        $curlError = curl_error($$name);
        if($curlError == "") {
          $res[$$name] = curl_multi_getcontent($$name);
        } else {
          print "Curl error on handle $i: $curlError\n";
        }
        // Remove and close the handle
        curl_multi_remove_handle($mh, ${$name});
        curl_close(${$name});
      }
    }
    
    // Clean up the curl_multi handle
    curl_multi_close($mh);
    
    // Print the response data
    echo 'printing result';
    print_r($res);

    
  }

?>