<?php
if(!isset($_REQUEST["action"])){
	displayError("缺少参数。");
}
switch($_REQUEST["action"]){
	case "connect":
		/*检查用户是否提交了需要的参数*/
		if(!isset($_REQUEST["addr"]) || !isset($_REQUEST["password"])){
			displayError("缺少参数。");
		}
		/*匹配参数用的正则*/
		$keyReg = "/(?<=key: ').*?(?=',)/";
		$macReg = "/(?<=var deviceId = ').*?(?=';)/";
		/*获取用户提交的参数*/
		$addr = $_REQUEST["addr"];
		$rawPassword = $_REQUEST["password"];
		/*生成baseUrl*/
		$baseUrl = "http://".$addr;
		/*获取token*/
		$url = "http://".$addr."/cgi-bin/luci/web/home";
		$loginPage = sendRequest($url,false);
		preg_match($keyReg,$loginPage,$keyMatch);
		preg_match($macReg,$loginPage,$macMatch);
		$key = $keyMatch[0];
		$mac = $macMatch[0];
		$rand = mt_rand(1000,10000);
		$nonce = "0_".$mac."_".time()."_".$rand;
		$pwd = sha1($rawPassword.$key);
		$pwd = sha1($nonce.$pwd);
		$auth = Array(
			'username' => 'admin',
			'password' => $pwd,
			'logtype' => '2',
			'nonce' => $nonce
		);
		$url = $baseUrl."/cgi-bin/luci/api/xqsystem/login";
		$result = postRequest($url,$auth);
		$loginInfo = json_decode($result,true);
		if($loginInfo["code"] == 0){
			$token = $loginInfo["token"];
		}else{
			displayError("登录失败:请检查地址或密码是否正确。");
		}
		/*获取WiFi信息*/
		$url = $baseUrl."/cgi-bin/luci/;stok=".$token."/api/xqnetwork/wifi_detail_all";
		$wifiDetail = sendRequest($url);
		//echo json_encode($wifiDetail);
		$return["code"] = 1;
		$return["bsd"] = $wifiDetail["bsd"];
		$return["24"]["ssid"] = $wifiDetail["info"][0]["ssid"];
		$return["24"]["encryption"] = $wifiDetail["info"][0]["encryption"];
		$return["24"]["hidden"] = $wifiDetail["info"][0]["hidden"];
		$return["24"]["txpwr"] = $wifiDetail["info"][0]["txpwr"];
		$return["24"]["password"] = $wifiDetail["info"][0]["password"];
		$return["5"]["ssid"] = $wifiDetail["info"][1]["ssid"];
		$return["5"]["encryption"] = $wifiDetail["info"][1]["encryption"];
		$return["5"]["hidden"] = $wifiDetail["info"][1]["hidden"];
		$return["5"]["txpwr"] = $wifiDetail["info"][1]["txpwr"];
		$return["5"]["password"] = $wifiDetail["info"][1]["password"];
		$return["token"] = $token;
		$return["addr"] = $addr;
		echo json_encode($return,JSON_UNESCAPED_UNICODE);
		break;
	case "update":
		/*检查用户是否提交了需要的参数*/
		if(!isset($_REQUEST["bsd"]) || !isset($_REQUEST["ssid1"]) || !isset($_REQUEST["encryption1"]) || !isset($_REQUEST["hidden1"]) || !isset($_REQUEST["txpwr1"]) || !isset($_REQUEST["pwd1"]) || !isset($_REQUEST["ssid2"]) || !isset($_REQUEST["encryption2"]) || !isset($_REQUEST["hidden2"]) || !isset($_REQUEST["txpwr2"]) || !isset($_REQUEST["pwd2"]) || !isset($_REQUEST["token"]) || !isset($_REQUEST["addr"])){
				displayError("缺少参数。");
		}
		/*获取用户提交的参数*/
		$addr = $_REQUEST["addr"];
		$baseUrl = "http://".$addr;
		$bsd = $_REQUEST["bsd"];
		$ssid1 = $_REQUEST["ssid1"];
		$encryption1 = $_REQUEST["encryption1"];
		$hidden1 = $_REQUEST["hidden1"];
		$txpwr1 = $_REQUEST["txpwr1"];
		$pwd1 = $_REQUEST["pwd1"];
		$ssid2 = $_REQUEST["ssid2"];
		$encryption2 = $_REQUEST["encryption2"];
		$hidden2 = $_REQUEST["hidden2"];
		$txpwr2 = $_REQUEST["txpwr2"];
		$pwd2 = $_REQUEST["pwd2"];
		$token = $_REQUEST["token"];
		/*更新WiFI信息*/
		$url = $baseUrl."/cgi-bin/luci/;stok=".$token."/api/xqnetwork/set_all_wifi";
		$data = Array(
			'bsd' => $bsd,
			'on1' => '1',
			'ssid1' => $ssid1,
			'encryption1' => $encryption1,
			'channel1' => '0',
			'bandwidth1' => '0',
			'hidden1' => $hidden1,
			'txpwr1' => $txpwr1,
			'pwd1' => $pwd1,
			'on2' => '1',
			'ssid2' => $ssid2,
			'encryption2' => $encryption2,
			'channel2' => '0',
			'bandwidth2' => '0',
			'hidden2' => $hidden2,
			'txpwr2' => $txpwr2,
			'pwd2' => $pwd2
		);
		$result = postRequest($url,$data);
		$result = json_decode($result,true);
		if($result["code"] == 0){
			$return["code"] = 0;
			$return["msg"] = "success";
			echo json_encode($return,JSON_UNESCAPED_UNICODE);
		}else{
			displayError("出现未知错误，请在项目中提交Issue.");
		}
		break;
	default:
		displayError("未知操作");
		break;
}

/*轮子*/
function postRequest($url, $post_data){
		$postdata = http_build_query($post_data);
	$options = array(
		'http' => array(
		'method' => 'POST',
		'header' => 'Content-type:application/x-www-form-urlencoded',
		'content' => $postdata,
		'timeout' => 60
		)
	);
	$context = stream_context_create($options);
	$result = file_get_contents($url, false, $context);
	return $result;
}
function sendRequest($requestUrl,$decode=true){
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $requestUrl);
	curl_setopt($ch, CURLOPT_HEADER,0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$result = curl_exec($ch);
	curl_close($ch);
	if ($decode){
		$result = json_decode($result,true);
	}
	return $result;
}
function displayError($msg){
	$return["code"] = 0;
	$return["msg"] = $msg;
	echo json_encode($return,JSON_UNESCAPED_UNICODE);
	exit();
}
?>