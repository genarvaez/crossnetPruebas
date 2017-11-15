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

	var callIcon = videoLLamadaButton.click(function(){
		$(".video-call-section").toggle("fast", function(){
			if($(this).css("display") == "block"){
				$(".caller, .calle, .videocall-button").show();
			//	$("video").hide()
				availableDevices()
				$(".sub-menu-option").hide();
			}
		});
		testGrtcClientConstructor()
	});
	var startVideocall = $(".videocall-button").click(function(){
		testSelectAndCall();
	})

	function closeWindow (){
		$(".video-call-section").hide();
	}
	
	$(".close-video-section").click(closeWindow)
   	
   	/*********************************callSession****************************************/
   	var grtcClient = null;
   	var grtcSession = null;
   	var localID = "";
   	var remoteID = "";
   	var remoteStatusMsg = "";
   	var conf = null;
   	var remoteViewFactor = 1;
   	var newSessionOnNewOffer = false;
   	var useTalkEvent = false;
   	var callAudioConstraints = true;
   	var callVideoConstraints = true;
   	var savedStats = null;

   	function getConfig() {
   	    conf = {
   	        'webrtc_gateway': "https://10.14.0.39:8086",
   	        'turn_server': "localhost:3478",
   	        'turn_username': 'genesys',
   	        'turn_password': 'genesys',
   	    };
   	}

   	function check() {
   	    var rc = Grtc.isWebrtcSupported();
   	    if (rc) {
   	        // webrtc supported by browser
   	        $('#isWebrtcSupported-section').hide();
   	        $('#config-section').show();
   	    } else {
   	        // webrtc not supported by browser; warn the user
   	        alert("isWebrtcSupported: " + rc + ".\n" +
   	            "We recommend using the latest Chrome/Firefox/Opera browser.\n");
   	    }
   	}

   	function updateRemoteStatus(data) {
   	    // NOTE: when talk event is used, onNotifyEvent handler is used for this purpose.
   	    if (useTalkEvent === false) {
   	        $("#remoteStatus").empty();
   	        if (remoteID !== "") {      // A BYE could close session before we get here.
   	            $("#remoteStatus").append(remoteStatusMsg + " - established");
   	        }
   	    }
   	    return true;
   	}

   	function attachRemoteStream(data) {
   	    var element = document.getElementById("remoteView");
   	    if (element.getAttribute("src") === null) {
   	        console.log("Attaching remote stream");
   	    } else {
   	        console.log("Reattaching remote stream");
   	    }
   	    grtcClient.setViewFromStream(element, data.stream);
   	    return false;
   	}

   	function cleanupAfterCall() {
   	    savedStats = null;
   	    $("#remoteStatus").empty();
   	    remoteID = "";
   	    remoteStatusMsg = "";
   	}

   	// The main constructor function to create the grtc client, media session and the 
   	// associated event handlers.
   	function testGrtcClientConstructor(audioConstraints, videoConstraints) {
   	    if (typeof audioConstraints !== "undefined") {
   	        callAudioConstraints = audioConstraints;
   	    }
   	    if (typeof videoConstraints !== "undefined") {
   	        callVideoConstraints = videoConstraints;
   	    }
   	    
   	    console.log("Media types to be used by default: audio=" + callAudioConstraints + "; video=" + callVideoConstraints);
   	    
   	    getConfig();
   	    console.log("Creating Grtc.Client with configuration: " + JSON.stringify(conf));
   	    grtcClient = new Grtc.Client(conf);
   	    
   	    // Default log level in JSAPI is 3; use 4, for more, or a smaller value for less logging.
   	    grtcClient.setLogLevel(4);
   	    
   	    newSessionOnNewOffer = Grtc.getWebrtcDetectedBrowser() === "firefox";
   	    // The following isn't needed for Firefox, as it is on in JSAPI by default for Firefox.
   	    //grtcClient.setRenewSessionOnNeed(newSessionOnNewOffer);
   	    // The gateway configuration rsmp.new-pc-support should be set to 0 with this setting.
   	    // See https://docs.genesys.com/Special:Repository/webrtc_gateway85rn.html?id=2d43c995-1f2b-4fdb-8a66-60eefebb5534
   	    grtcClient.setRenewSessionOnNeed(false);
   	    
   	    // Set the media constraints to be used for creating offer or answer SDPs.
   	    // These may be necessary when JSAPI auto-responds with offer or answer SDPs
   	    // on session renegotiation or hold/talk events.
   	    grtcClient.setMediaConstraintsForOffer(callAudioConstraints, callVideoConstraints);
   	    grtcClient.setMediaConstraintsForAnswer(callAudioConstraints, callVideoConstraints);
   	    
   	    // Set max video bit rate (Kbps) (uses b=AS in SDP); the default in JSAPI is 500 Kbps.
   	    grtcClient.setVideoBandwidth(500);
   	    
   	    // Redefine grtcClient.filterIceCandidates() to discard candidates that may delay ICE.
   	    grtcClient.filterIceCandidates = function (Candidates) {
   	        outCandidates = [];
   	        var count = Candidates.length;
   	        for (var i = 0; i < count; i++) {
   	            var strCandidate = JSON.stringify(Candidates[i]);
   	            // Ignore private addresses, which aren't necessary and seem to add delay.
   	            // Also ignore tcp candidates that aren't used.
   	            if (strCandidate.match(/ 192\.168\.\d{1,3}\.\d{1,3} \d+ typ host/i) === null &&
   	                strCandidate.match(/ tcp \d+/i) === null) { 
   	                outCandidates.push(Candidates[i]);
   	            }
   	        }
   	        return outCandidates;
   	    };
   	    
   	    // Create a MediaSession instance to make or accept calls.
   	    // It's possible to reuse the same session instance for multiple calls, though a
   	    // new instance can be created for every call (as it used to be).
   	    grtcSession = new Grtc.MediaSession(grtcClient);
   	    grtcSession.onRemoteStream.add(updateRemoteStatus);
   	    grtcSession.onRemoteStream.add(attachRemoteStream);
   	    grtcSession.onSessionHold.add( function(isTrue) {
   	      if (isTrue) {
   	        console.log("Call on-hold");
   	        $("#remoteStatus").text(remoteStatusMsg + " - on-hold");
   	      }
   	    });

   	    // Register a handler to deal with an incoming call, with or without SDP offer.
   	    // This will simply accept or reject the call.  NOTE: This handler may not need
   	    // to be defined, if the call is going to be auto-answered on NOTIFY talk events.
   	    // NOTE: This handler is not invoked any more on session renegotiation.
   	    grtcClient.onIncomingCall.add(function (data) {
   	        var doAccept = true;
   	        try {
   	            // Ask user to confirm whether to accept or reject call, unless "talk"
   	            // event is to be used.
   	            var user_said = window.confirm("¿Desea recibir llamada de " + data.peer + "?");
   	            if (user_said === true) {
   	                remoteID = data.peer;
   	                $("#remoteStatus").empty();
   	                remoteStatusMsg = "Call from " + remoteID;
   	                $("#remoteStatus").append(remoteStatusMsg);
   	            } else {
   	                doAccept = false;
   	            }
   	           
   	        }catch (e) {
   	            alert("Could not accept call from " + data.peer);
   	            return false;
   	        }
   	        if (useTalkEvent) { return false; }
   	        if (doAccept) {
   	            //grtcSession.acceptCall(true, true, remoteID);
   	            grtcSession.acceptCall(callAudioConstraints, callVideoConstraints, remoteID);
   	        } else {
   	            grtcSession.rejectCall();
   	            //grtcSession = null;   // Don't set to null to reuse the session for future calls
   	        }
   	        return false;
   	    });
   	    
   	    // NOTE: This event is experimental, and not officially supported!
   	    grtcClient.onCallEvent.add(function (data) {
   	        console.log("Call event: " + data.event);
   	        return false;
   	    });
   	    
   	   
   	    grtcClient.onNotifyEvent.add(function (data) {
   	        console.log("Notify event received: " + data.event);
   	        if (remoteID === "") {
   	            remoteID = data.peer;
   	            remoteStatusMsg = "Call from " + remoteID;
   	        }
   	        $("#remoteStatus").empty();
   	        if (data.event === "talk") {
   	            $("#remoteStatus").append(remoteStatusMsg + " - established");
   	        }
   	        else if (data.event === "hold") {
   	            $("#remoteStatus").append(remoteStatusMsg + " - on-hold");
   	        }
   	        return false;
   	    });
   	    
   	    // Invoked when info data arrives from the peer.
   	    grtcClient.onInfoFromPeer.add(function (data) {
   	        alert("Got data from peer:\n" + JSON.stringify(data));
   	        return false;
   	    });
   	    
   	    // Invoked when call statistics arrives from the WebRTC Server.
   	    
   	    
   	    // Invoked on ICE failure after being established, say, due to a network problem.
   	    // The app should try to re-establish ICE by initiating an offer to the gateway.
   	    // Note, if sending offer fails, JSAPI will retry until it succeeds or session closes.
   	    grtcClient.onIceDisconnected.add(function (obj) {
   	        if (grtcSession) // && grtcSession.isEstablished())
   	        {
   	            console.log("Trying to restore ICE connection...");
   	            grtcSession.makeOffer();
   	        }
   	        return false;
   	    });
   	    
   	    // Invoked on connection error, such as hanging-get failure.  This could happen
   	    // when there is a network problem, or when the gateway goes down.
   	    // The app may retry sign-in in the HA case, or at least, warn the user.
   	    // Note, JSAPI will retry the hanging-get after 3s. Hence, may want to wait
   	    // sometime, and then sign out, wait 3s, and then try sign-in again.
   	    grtcClient.onConnectionError.add(function (obj) {
   	        if (grtcSession) // && grtcSession.isEstablished())
   	        {
   	            //alert("Got connection error: " + JSON.stringify(obj));
   	            //testDisconnect();
   	        }
   	        return false;
   	    });
   	    
   	    // Invoked on WebRTC Gateway error, which may be irrecoverable.
   	    // The app may want to end the session, or ignore the error.
   	    grtcClient.onGatewayError.add(function (obj) {
   	        //alert("Got gateway error: " + JSON.stringify(obj));
   	        //grtcSession.closeSession(true);
   	        return false;
   	    });
   	    
   	    // Invoked on WebRTC browser API error, which could be recoverable.
   	    // The app may want to ignore this error, log it, and/or inform the user.
   	    grtcClient.onWebrtcError.add(function (obj) {
   	        alert("Got WebRTC error: " + JSON.stringify(obj));
   	        return false;
   	    });
   	    
   	    // When the peer closes, this event is fired; do the necessary clean-up here.
   	    grtcClient.onPeerClosing.add(function () {
   	        if (grtcSession) {
   	            //grtcSession = null;
   	        }
   	        console.log("Call with " + remoteID + " has ended");
   	        cleanupAfterCall();
   	        return false;
   	    });
   	    
   	    // Fired on no-answer timeout after making an initial or updated offer to peer.
   	    grtcClient.onPeerNoanswer.add(function () {
   	        if (grtcSession) {
   	            grtcSession.closeSession(true);
   	            //grtcSession = null;
   	        }
   	        cleanupAfterCall();
   	        return false;
   	    });
   	    
   	    grtcClient.onMediaSuccess.add(function (obj) {
   	        document.getElementById("localView").style.opacity = 1;
   	        grtcClient.setViewFromStream(document.getElementById("localView"), obj.stream);
   	        return false;
   	    });
   	    
   	    grtcClient.onMediaFailure.add(function (obj) {
   	        alert(obj.message);
   	        return false;
   	    });
   	    
   	    function handleOnConnect(e) {
   	        $("#localStatus").empty();
   	        $("#localStatus").append("Registered anonymously");
   	        return false;
   	    }

   	    function handleOnRegister(e) {
   	        $("#localStatus").empty();
   	        $("#localStatus").append("Registered as " + localID);
   	        return false;
   	    }

   	    function handleOnConnectFailed(e) {
   	        alert(e.message);
   	        localID = "";
   	        return false;
   	    }
   	    
   	    grtcClient.onConnect.add(handleOnConnect);  
   	    grtcClient.onRegister.add(handleOnRegister);
   	    grtcClient.onFailed.add(handleOnConnectFailed);

   	    window.onbeforeunload = function() {
   	        grtcClient.disconnect();
   	    };
   	    setMediaSources()
   	    testRegister()
   	}

   	// This calls JSAPI to obtain a local media stream.
   	function testEnableMediaSource(audioConstraints, videoConstraints) {
   	    // calls Grtc.Client.enableMediaSource
   	    if (!grtcClient) { alert("Grtc.Client instance not created"); }
   	    else {
   	        // enable audio and/or video
   	        grtcClient.enableMediaSource(audioConstraints, videoConstraints);
   	    }
   	}

   	// This enables local media sources, based on the selection in the app.
   	function setMediaSources() {
   	    //if (!grtcClient) { alert("Grtc.Client instance not created"); return }
   	        testEnableMediaSource(true, { width : {ideal : 1280 } });
   	}

   	// This calls JSAPI to release the local media stream that was obtained earlier.
   	function testDisableMediaSource() {
   	    // calls Grtc.Client.disableMediaSource
   	    if (!grtcClient) { alert("Grtc.Client instance not created"); }
   	    else {
   	        grtcClient.disableMediaSource();
   	        document.getElementById("localView").src = "";
   	    }
   	}


   	// This calls connect method of JSAPI to register with the gateway anonymously.
   	function testConnect() {
   	    if (!grtcClient) { alert("Grtc.Client instance not created"); }
   	    else {
   	        localID = "anonymous";
   	        grtcClient.connect();
   	    }
   	}

   	// This calls register method of JSAPI to register with the gateway and SIP Server.
   	function testRegister() {
   	    if (!grtcClient) { 
   	        alert("Grtc.Client instance not created"); 
   	    }
   	    else {	
   	    		

   	            localID = "Anónimo";
   	            grtcClient.connect();   // Connect anonymously
   	            $("#localStatus").empty();
   	            $("#localStatus").append("Te has conectado como " + "<b>"+localID+ "</b>")
   	    }
   	}

   	/* testUnregister() isn't used now; testDisconnect() is used instead.
   	function handleOnDisconnect() {
   	    $("#localStatus").empty();
   	    $("#remoteStatus").empty();
   	}

   	function testUnregister() {
   	    // calls Grtc.Client.disconnect
   	    if (!grtcClient) { alert("Grtc.Client instance not created"); }
   	    else {
   	        grtcClient.onDisconnect.add(handleOnDisconnect);
   	        grtcClient.disconnect();
   	    }
   	} */

   	// Unregister/sign-out from WebRTC gateway.
   	function testDisconnect() {
   	    if (!grtcClient) { 
   	        alert("Grtc.Client instance not created"); 
   	    }
   	    else {
   	        grtcClient.disconnect();
   	        $("#localStatus").empty();
   	        cleanupAfterCall();
   	        //grtcSession = null;
   	        localID = "";
   	    }
   	}

   	// Accept or answer an incoming call manually.
   	function testAcceptCall() {
   	    if (!grtcClient) { alert("Grtc.Client instance not created"); }
   	    else if (grtcSession === null) {
   	        alert("Grtc.MediaSession instance is not created");
   	    }
   	    else {
   	        grtcSession.acceptCall(callAudioConstraints, callVideoConstraints);
   	    }
   	}

   	// Make a new call (with offer), or a new offer to peer to update an existing call.
   	function testCall(audioConstraints, videoConstraints, holdCall) {
   	    if (!grtcClient) { 
   	        alert("Grtc.Client instance not created"); 
   	    }
   	    else {
   	        if (localID.length === 0) {
   	            alert("Please register first");
   	            return;
   	        }
   	        remoteID = prompt("Indique número de contacto");
   	       
   	        // Else, we would use remoteID, given it's already set from existing call.
   	        if (remoteID.length === 0) {
   	            alert("Número no válido");
   	        } 
   	        else {
   	            // We could create a new MediaSession for every call, or reuse one created earlier.
   	            /* if (grtcSession === null) {
   	                $("#remoteStatus").empty();
   	                remoteStatusMsg = "Call to " + remoteID;
   	                $("#remoteStatus").append(remoteStatusMsg);
   	                grtcSession = new Grtc.MediaSession(grtcClient);
   	                grtcSession.onRemoteStream.add(updateRemoteStatus);
   	                grtcSession.onRemoteStream.add(attachRemoteStream);
   	            }  else */
   	            {
   	                $("#remoteStatus").empty();
   	                remoteStatusMsg = "Call to " + remoteID;
   	                $("#remoteStatus").append(remoteStatusMsg);
   	            }
   	            if (typeof audioConstraints !== "undefined") {
   	                callAudioConstraints = audioConstraints;
   	            }
   	            if (typeof videoConstraints !== "undefined") {
   	                callVideoConstraints = videoConstraints;
   	            }
   	            grtcSession.makeOffer(remoteID, audioConstraints, videoConstraints);
   	        }
   	    }
   	}

   	// Make a call or offer using media constraints based on the app selection.
   	function testSelectAndCall() {
   	    testCall(true, true);
   	}

   	// Hang up the call.  Note, onPeerClosing handler won't be called in this case.
   	function testHangUp() {
   	    if (grtcSession) {
   	        grtcSession.terminateCall();
   	        //grtcSession = null;
   	    }
   	    cleanupAfterCall();
   	}

   	// Update current call - used to mute/unmute the call.
   	function testUpdateCall(audioConstraints, videoConstraints) {
   	   if (grtcSession) {
   	       grtcSession.updateCall(audioConstraints, videoConstraints);
   	   }
   	   else {
   	        alert("Media session or call does not exist");
   	   }
   	}

   	// Put an active call on-hold.
   	function testHoldCall() {
   	    if (!grtcClient) { 
   	        alert("Grtc.Client instance not created"); 
   	    }
   	    else if (!grtcSession || remoteID.length === 0 ) {
   	        alert("Media session or call does not exist");
   	    }
   	    else {
   	        grtcSession.holdCall();
   	        $("#remoteStatus").text(remoteStatusMsg + " - on-hold");
   	    }
   	}

   	// Resume a call that has been put on-hold.
   	function testResumeCall() {
   	    if (!grtcClient) { alert("Grtc.Client instance not created"); }
   	    else if (!grtcSession || remoteID.length === 0 ) {
   	        alert("Media session or call does not exist");
   	    }
   	    else {
   	        grtcSession.resumeCall();
   	    }
   	}

   	// Toggles the RemoteView size by doubling it 3 times, and then back to original size.
   	function toggleRemoteViewSize() {
   	    if (remoteViewFactor === 4) {
   	        remoteViewFactor = 1;
   	    } else {
   	        remoteViewFactor++;
   	    }
   	    remElement = document.getElementById("remoteView");
   	    //remElement.style.height = 240*(remoteViewFactor < 4 ? remoteViewFactor : 3);
   	    remElement.height = 240*remoteViewFactor;
   	    remElement.width  = 320*remoteViewFactor;
   	    if (typeof remElement.mozSrcObject !== 'undefined') {
   	        // Firefox is the browser, which needs this.
   	        remElement.play();
   	    }
   	}

   	//10.14.0.39:8086
   	
   		


	


/************************************************CALLE***************************************************/
	
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