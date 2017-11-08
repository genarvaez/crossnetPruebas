$( document ).ready(function(){
	$('.carousel.carousel-slider').carousel({fullWidth: true});
	setInterval(function(){
		$('.carousel').carousel('next');
	}, 6000);
	var buttonsubMenu = $(".sub-menu-button");
	buttonsubMenu.click(function(){
		$(".sub-menu-option").toggle("fast", function(){
			$(this).addClass("bounceIn");
		})
	})
})