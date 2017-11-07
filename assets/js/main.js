$( document ).ready(function(){
	var buttonsubMenu = $(".sub-menu-button");
	var subMenuOption = $(".sub-menu-option");
	buttonsubMenu.mouseover(function(){
		$(".sub-menu-contact").removeClass("hide");
		$(".sub-menu-option").addClass("bounceIn")
	})

	buttonsubMenu.mouseleave(function(){
		$(".sub-menu-contact").addClass("hide");
		$(".sub-menu-option").removeClass("bounceIn")
	})


})