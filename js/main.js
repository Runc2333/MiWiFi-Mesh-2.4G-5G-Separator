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
	var psw = $(".input[placeholder=psw]").val();
	$.post("/api/api.php",{
		action:"connect",
		addr:addr,
		password:psw
	},function(data){
		var wifiInfo = JSON.parse(data);
		if(wifiInfo.code == 0){
			popup(wifiInfo.msg);
		}else{
			popup("连接成功kira~");
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
			$("#submit").data("token",wifiInfo.token);
			$("#submit").data("addr",wifiInfo.addr);
			$(".testConnection").hide();
			$(".baseInfomation").show();
		}
	});
});

/*更改配置*/
$("#submit").on("click",function(){
	popup("正在尝试提交配置...");
	$.post("/api/api.php",{
		action:"update",
		bsd:$("#bsd").val(),
		ssid1:$("input[placeholder='2.4G SSID']").val(),
		encryption1:$("input[placeholder='2.4G Encryption']").val(),
		hidden1:$("#24hidden").val(),
		txpwr1:$("#24txpwr").val(),
		pwd1:$("input[placeholder='2.4G Password']").val(),
		ssid2:$("input[placeholder='5G SSID']").val(),
		encryption2:$("input[placeholder='5G Encryption']").val(),
		hidden2:$("#5hidden").val(),
		txpwr2:$("#5txpwr").val(),
		pwd2:$("input[placeholder='5G Password']").val(),
		token:$("#submit").data("token"),
		addr:$("#submit").data("addr")
	},function(data){
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
	})
});