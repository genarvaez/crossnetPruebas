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
		})
	})

	videoLLamadaButton.click(function(){
		$(".video-call-section").toggle("fast", function(){
			
		})
	})
})