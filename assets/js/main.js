$( document ).ready(function(){
	var buttonsubMenu = $(".sub-menu-button");
	var subMenuOption = $(".sub-menu-option");
	buttonsubMenu.click(function(){
		
		$(".sub-menu-option").toggle("fast", function(){
			$(this).addClass("bounceIn")
		})
	})

	/*buttonsubMenu.mouseleave(function(){
		$(".sub-menu-contact").addClass("hide");
		$(".sub-menu-option").removeClass("bounceIn")
	})*/


})