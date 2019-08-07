/*生成随机数*/
function randomNum(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
} 
/*弹出Toast*/
function popup(html,timeout=5000,callback=function(){}){
	M.toast({
		html:html,
		displayLength:timeout,
		completeCallback:callback
	});
}
/*设置新Modal*/
function addModal(title,content,primary="确认",secondary="取消",primaryCallback,secondaryCallback){
	//初始化
	$(".modalButton:not(.recommand)").unbind();
	$(".modalButton.recommand").unbind();
	//设置标题
	$(".modalTitle").html(title);
	//设置内容
	$(".modalText").html(content);
	//设置主要按钮文字
	$(".modalButton.recommand").html(primary);
	//设置次要按钮文字
	$(".modalButton:not(.recommand)").html(secondary);
	//绑定次要按钮事件(如果有)
	if(secondaryCallback){
		$(".modalButton:not(.recommand)").on("click",secondaryCallback);
	}else{
		$(".modalButton:not(.recommand)").on("click",function(){
			hideModal();
		});
	}
	//绑定主要按钮事件(如果有)
	if(primaryCallback){
		$(".modalButton.recommand").on("click",primaryCallback);
	}else{
		$(".modalButton.recommand").on("click",function(){
			hideModal();
		});
	}
	//设置遮罩模式
	$(".mask").data("mode","modal");
	//设置遮罩图层
	$(".mask").css("z-index",900);
	//显示Modal和遮罩
	$(".modal,.mask").fadeIn();
}
/*隐藏现有Modal*/
function hideModal(){
	//初始化遮罩模式
	$(".mask").data("mode","");
	//隐藏Modal和遮罩
	$(".modal,.mask").fadeOut();
	//移除设置的遮罩图层
	$(".mask").attr("style","");
}
/*显示现有Modal*/
function showModal(){
	//设置遮罩模式
	$(".mask").data("mode","modal");
	//设置遮罩图层
	$(".mask").css("z-index",900);
	//显示Modal和遮罩
	$(".modal,.mask").fadeIn();
}

addModal("提示","请谨慎修改您的路由器配置，作者不对由此程序造成的任何后果负责。QQ交流群:222637159");

/*连接设备*/
$("#testCon").on("click",function(){
	popup("正在尝试连接到路由器...");
	var addr = $(".input[placeholder=address]").val();
	$("#submit").data("addr",addr);
	var psw = $(".input[placeholder=psw]").val();
	var baseUrl = "http://"+addr
	$.ajax({
		url:baseUrl+"/cgi-bin/luci/web/home",
		type:"GET",
		success:function(data){
			var key = /(?<=key: ').*?(?=',)/.exec(data);
			var mac = /(?<=var deviceId = ').*?(?=';)/.exec(data);
			var rand = randomNum(1000,10000);
			var time = Math.round(new Date().getTime()/1000);
			var nonce = "0_"+mac+"_"+time+"_"+rand;
			var psw0 = sha1(psw+key);
			var psw1 = sha1(nonce+psw0);
			$.ajax({
				url:baseUrl+"/cgi-bin/luci/api/xqsystem/login",
				type:"POST",
				timeout:5000,
				data:{
					username:"admin",
					password:psw1,
					logtype:2,
					nonce:nonce
				},
				success:function(data){
					var rawtoken = JSON.parse(data);
					if(rawtoken.code == 0){
						var token = rawtoken.token;
						$("#submit").data("token",token);
						popup("token获取成功，正在尝试获取设备信息...")
						$.ajax({
							url:baseUrl+"/cgi-bin/luci/;stok="+token+"/api/xqnetwork/wifi_detail_all",
							type:"GET",
							timeout:5000,
							success:function(data){
								var detail = JSON.parse(data);
								console.log(detail);
								var wifiInfo = new Array();
								wifiInfo["24"] = new Array();
								wifiInfo["5"] = new Array();
								wifiInfo.bsd = detail.bsd;
								wifiInfo["24"].ssid = detail.info[0].ssid;
								wifiInfo["24"].encryption = detail.info[0].encryption;
								wifiInfo["24"].hidden = detail.info[0].hidden;
								wifiInfo["24"].txpwr = detail.info[0].txpwr;
								wifiInfo["24"].password = detail.info[0].password;
								wifiInfo["5"].ssid = detail.info[1].ssid;
								wifiInfo["5"].encryption = detail.info[1].encryption;
								wifiInfo["5"].hidden = detail.info[1].hidden;
								wifiInfo["5"].txpwr = detail.info[1].txpwr;
								wifiInfo["5"].password = detail.info[1].password;
								popup("获取成功kira~");
								popup("请尽情修改设备配置吧!");
								addModal("警告","请勿修改任何你不了解的配置，作者不对因此产生的任何后果负责。如果你想要关闭2.4G/5G双频合一，请首先将这个功能设置为关闭，之后更改5G SSID，提交即可。");
								$(".bsdOpt[value="+wifiInfo.bsd+"]").attr("selected","selected");
								$("input[placeholder='2.4G SSID']").val(wifiInfo["24"].ssid);
								$("input[placeholder='2.4G Encryption']").val(wifiInfo["24"].encryption);
								$("input[placeholder='2.4G Password']").val(wifiInfo["24"].password);
								$(".24hiddenOpt[value="+wifiInfo["24"].hidden+"]").attr("selected","selected");
								$("input[placeholder='5G SSID']").val(wifiInfo["5"].ssid);
								$("input[placeholder='5G Encryption']").val(wifiInfo["5"].encryption);
								$("input[placeholder='5G Password']").val(wifiInfo["5"].password);
								$(".5hiddenOpt[value="+wifiInfo["5"].hidden+"]").attr("selected","selected");
								$(".testConnection").hide();
								$(".baseInfomation").show();
							},
							error:function(xhr){
								popup("错误"+xhr.statusCode+":"+xhr.statusText);
								popup("出现未知错误，请在项目中提交Issue.");
							}
						});
					}else{
						popup("登录失败:请检查地址或密码是否正确。");
					}
				},
				error:function(xhr){
					popup("错误"+xhr.statusCode+":"+xhr.statusText);
					popup("出现未知错误，请在项目中提交Issue.");
				}
			});
		},
		error:function(xhr){
			popup("错误"+xhr.statusCode+":"+xhr.statusText);
			popup("出现未知错误，请在项目中提交Issue.");
		}
	});
});

/*更改配置*/
$("#submit").on("click",function(){
	popup("正在尝试提交配置...");
	var token = $("#submit").data("token");
	var addr = $("#submit").data("addr");
	var baseUrl = "http://"+addr;
	$.ajax({
		url:baseUrl+"/cgi-bin/luci/;stok="+token+"/api/xqnetwork/set_all_wifi",
		type:"POST",
		timeout:5000,
		data:{
			bsd:$("#bsd").val(),
			on1:1,
			ssid1:$("input[placeholder='2.4G SSID']").val(),
			encryption1:$("input[placeholder='2.4G Encryption']").val(),
			channel1:0,
			bandwidth1:0,
			hidden1:$("#24hidden").val(),
			txpwr1:$("#24txpwr").val(),
			pwd1:$("input[placeholder='2.4G Password']").val(),
			ssid2:$("input[placeholder='5G SSID']").val(),
			on2:1,
			encryption2:$("input[placeholder='5G Encryption']").val(),
			channel2:0,
			bandwidth2:0,
			hidden2:$("#5hidden").val(),
			txpwr2:$("#5txpwr").val(),
			pwd2:$("input[placeholder='5G Password']").val()
		},
		success:function(data){
			var update = JSON.parse(data);
			if(update.code == 0){
				popup("配置保存成功!");
				addModal("成功","修改成功啦~要不要去GitHub给作者点个Star呢嘻嘻~","跳转","拒绝",function(){
					window.location.href="https://github.com/Runc2333/MiWiFi-Mesh-2.4G-5G-Separator";
				});
			}else{
				popup("很抱歉..没能奏效meow~");
				addModal("失败","抱歉..修改失败。请在GitHub提交Issue，作者会尽快处理的。QQ交流群:222637159","跳转","取消",function(){
					window.location.href="https://github.com/Runc2333/MiWiFi-Mesh-2.4G-5G-Separator/issues/new";
				});
			}
		},
		error:function(xhr){
			popup("错误"+xhr.statusCode+":"+xhr.statusText);
			popup("出现未知错误，请在项目中提交Issue.");
		}
	});
});