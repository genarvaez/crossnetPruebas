$( document ).ready(function(){

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
				enableCall()
				$(".sub-menu-option").css({"display": "none"})
			}

		});
	});
	var closeWindow = $(".close-video-section").click(function(){
		$(".video-call-section").css({"display":"none"})
	})

   	
   	/*********************************callSession****************************************/

   	//10.14.0.39:8086
   	function enableCall(){
	   	var configuration = {
	   		'webrtc_gateway': 'http://10.14.0.39:8086',
	   		'stun_server': 'stun.genesyslab.com:3478',
	   		'dtls_srtp' : true
	   	};

	   	var grtcClient = new Grtc.Client(configuration);
	   	window.onbeforeunload = function(){
	   	    grtcClient.disconnect();
	   	};



	   	
	   	grtcClient.onMediaSuccess.add(function (obj) {
	        grtcClient.setViewFromStream(document.getElementById("localView"), obj.stream);
	        grtcClient.onConnect.add(function () {
	            $("#localStatus").empty();
	            $("#localStatus").append("connected anonymously");
	            // create a MediaSession instance and make a call on it
	            grtcSession = new Grtc.MediaSession(grtcClient);
	            grtcSession.onRemoteStream.add(function (data) {
	                grtcClient.setViewFromStream(document.getElementById("remoteView"), data.stream);
	            });
	            grtcSession.makeCall("1020");
	        });
	        grtcClient.onFailed.add(function (e) { window.alert(e.message); });
	        grtcClient.connect();
	    });
	    grtcClient.onMediaFailure.add(function (obj) {
	        window.alert(obj.message);
	    });
	    // enable microphone and camera
	    grtcClient.enableMediaSource();
	}

	function availableDevices(){
		navigator.mediaDevices.enumerateDevices()
		.then(gotDevices)
		.catch(errorCallback)

		function gotDevices (deviceInfo){
			if(deviceInfo.length == 0){
				errorCallback()
				return false
			}

			deviceInfo.find(function(device){
				if(device.kind == "audioinput" || device.kind == "videoinput"){
					console.log("hay dispositivos disponibles")
					return true
				}
			})
		}
		function errorCallback(){
			alert("no pudimos encontrar dispositivos conectados")
		}
	}
	console.log(availableDevices())
});