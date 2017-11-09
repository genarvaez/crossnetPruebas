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
   	function enableCall(){
	   		var configuration = {
	   	  'webrtc_gateway': 'http://WebRTC.genesyslab.com:8086',
	   	  'stun_server': 'stun.genesyslab.com:3478',
	   	  'dtls_srtp' : true
	   	};

	   	var grtcClient = new Grtc.Client(configuration);
	   	window.onbeforeunload = function() {
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
});