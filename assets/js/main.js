$( document ).ready(function(){
 	var isAvailable = false;
	var buttonsubMenu = $(".sub-menu-button");
	var videoLLamadaButton = $(".video-llamada-on");


	$('.carousel.carousel-slider').carousel({fullWidth: true});
	$(".button-collapse").sideNav();
	setInterval(function(){
		$('.carousel').carousel('next');
	}, 6000);


	buttonsubMenu.click(function(){
		$(".sub-menu-option").toggle("fast", function(){
			$(this).addClass("bounceIn");
		});
	});

	var videoLLamada = videoLLamadaButton.click(function(){
		$(".video-call-section").toggle("fast", function(){

			if($(this).css("display") == "block"){
				$(".caller, .calle, .videocall-button").css({"display": "block"});
				$("video").css({"display": "none"})
				availableDevices()
				$(".sub-menu-option").css({"display": "none"})
			}
		});
	});
	var startVideocall = $(".videocall-button").click(function(){
		enableCall();
	})
	

   	
   	/*********************************callSession****************************************/




   	//10.14.0.39:8086
   	function enableCall(){
   		if($(".device-inf").text() == "Dispositivos de audio/video disponibles"){
   			$(".caller, .calle, .videocall-button").css({"display": "none"});
   			$("video").css({"display": "block"})
   		}
   		var conf = {
   		        "webrtc_gateway": "http://10.14.0.39:8086",
   		        "stun_server": "stun.genesyslab.com:3478",
   		        "dtls_srtp" : true
   		    };
   		    // construct a Grtc.Client instance
   		var grtcClient = new Grtc.Client(conf);
   		   
   		grtcClient.enableMediaSource();
   		grtcClient.onMediaSuccess.add(function (obj) {
   		    grtcClient.setViewFromStream(document.getElementById("localView"), obj.stream);
   		    grtcClient.onConnect.add(function () {
   		        console.log("estas conectado local")
   		    });
   		    grtcClient.onFailed.add(function (e) { window.alert(e.message); });
   		    grtcClient.connect();
   		});
   		grtcClient.onMediaFailure.add(function (obj) {
   		    window.alert(obj.message);
   		});
   		grtcSession = new Grtc.MediaSession(grtcClient);
   		grtcSession.makeOffer(self, true, true)
   	

   		    
   		var closeWindow = $(".close-video-section").click(function(){
   			$(".video-call-section").css({"display":"none"})
   		  	grtcClient.onDisconnect.add(function () { 
   		  		grtcClient.disableMediaSource();
   		  	});
   		  	grtcClient.disconnect()
   		})
   		 
   		function terminateCall() {
   		    grtcSession.terminateCall();
   		    grtcSession = null;
   		    $("#remoteStatus").empty();
   		}
	}


/************************************************CALLE***************************************************/
	var configuration = {
		"webrtc_gateway": "http://10.14.0.39:8086",
		"stun_server": "stun.genesyslab.com:3478",
		"dtls_srtp" : true
	};
	    // construct a Grtc.Client instance
	var newClient = new Grtc.Client(configuration);

	

	newClient.onIncomingCall.add(function (data1) {
		grtcSession = new Grtc.MediaSession(newClient);
	    var user_said = window.confirm("Do you want to accept the call from " + data1.peer + "?");
	    if (user_said === true) {
	        grtcSession.acceptCall();
	    } 
	    else {
	        grtcSession.rejectCall();
	        grtcSession = null;
		}
	})
	
	newClient.onMediaSuccess.add(function (obj) {
	    newClient.setViewFromStream(document.getElementById("remoteView"), obj.stream);
	        // once microphone and camera are enabled, connect to gateway
	    newClient.onConnect.add(function () {
	          console.log("conectado remoto")
	    });
	    newClient.onFailed.add(function (e) { window.alert(e.message); });
	    newClient.connect();
	});
	newClient.onMediaFailure.add(function (obj) {
	    window.alert(obj.message);
	});
	    // enable microphone and camera
	newClient.enableMediaSource();


	   
	

	    
	var closeWindow = $(".close-video-section").click(function(){
		$(".video-call-section").css({"display":"none"})
	  	newClient.onDisconnect.add(function () { 
	  		newClient.disableMediaSource();
	  	});
	  	newClient.disconnect()
	})
	 
	function terminateCall() {
	    grtcSession.terminateCall();
	    grtcSession = null;
	    $("#remoteStatus").empty();
	}

/***********************************************FIN CALLE****************************************************/





	function availableDevices(){
		var audio = $("#micro-off");
		var video = $("#video-off");

		var devicesInfo = $(".device-inf");
		if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
		  console.log("enumerateDevices() not supported.");
		  return;
		}
		return navigator.mediaDevices.enumerateDevices()
		.then(function(devices){
		  devices.find(function(device){
		  	if(device.kind == "videoinput" && device.kind == "videoinput"){
		   		audio.css({"color":"rgb(0, 253, 92)"})
		   		video.css({"color":"rgb(0, 253, 92)"})
		   		devicesInfo.text("Dispositivos de audio/video disponibles");
			}
		  });
		})
	}
});