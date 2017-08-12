$(document).ready(function(){	
	if($.browser.msie == true && $.browser.version < 7){
		alert("익스플로어6 이하 버전에선 최적화 되어있지 않습니다.\n\n버전을 업그레이드 하시거나 다른브라우저를 이용하시기 바랍니다.");		
	}	
	
	$('#session11_info').hide();			
	$('#handongho_info').hide();	
	$('#Armijn_info').hide();	
	$('#kimsungmin_info').hide();			
	$('#jeonikbeom_info').hide();	
	$('#jangkiyeong_info').hide();	
	$('#jungjoowon_info').hide();		
	$('#leehyungchae_info').hide();	
	$('#parkhyunchun_info').hide();
	$('#leejoonbeom_info').hide();
	$('#yangsooyeol_info').hide();
	$('#jangtaehee_info').hide();
	$('#whanghakbeom_info').hide();
	$('#leejongeun_info').hide();
	$('#sonjihoon_info').hide();
	$('#leecheolnam_info').hide();
	$('#yoonjongsoo_info').hide();
		
});

//이희승	
$("#session11")
	.mouseover(function() {
		var p =	$("#session11").position();
		$("#session11_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});	
		$('#session11_info').show();
	})
	.mouseout(function() {
   		 $('#session11_info').hide();
 	});

//한동호	
$("#handongho")
	.mouseover(function() {
		var p =	$("#handongho").position();
		$("#handongho_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});	
		$('#handongho_info').show();
	})
	.mouseout(function() {
   		 $('#handongho_info').hide();
 	});
	
//Armijn Hemel	
$("#Armijn")
	.mouseover(function() {		
		var p =	$("#Armijn").position();
		$("#Armijn_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});		
		$('#Armijn_info').show();
	})
	.mouseout(function() {
   		 $('#Armijn_info').hide();
 	});

//김성민		
$("#kimsungmin")
	.mouseover(function() {
		var p =	$("#kimsungmin").position();
		$("#kimsungmin_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});		
		$('#kimsungmin_info').show();
	})
	.mouseout(function() {
   		 $('#kimsungmin_info').hide();
 	});

//전익범		
$("#jeonikbeom")
	.mouseover(function() {
		var p =	$("#jeonikbeom").position();
		$("#jeonikbeom_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});
		$('#jeonikbeom_info').show();
	})
	.mouseout(function() {
   		 $('#jeonikbeom_info').hide();
 	});

//장기영		
$("#jangkiyeong")
	.mouseover(function() {
		var p =	$("#jangkiyeong").position();
		$("#jangkiyeong_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});		
		$('#jangkiyeong_info').show();
	})
	.mouseout(function() {
   		 $('#jangkiyeong_info').hide();
 	});

//정주원	
$("#jungjoowon")
	.mouseover(function() {		
		var p =	$("#jungjoowon").position();
		$("#jungjoowon_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});		
		$('#jungjoowon_info').show();
	})
	.mouseout(function() {
   		 $('#jungjoowon_info').hide();
 	});

//이형채	
$("#leehyungchae")
	.mouseover(function() {
		var p =	$("#leehyungchae").position();
		$("#leehyungchae_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});	
		$('#leehyungchae_info').show();
	})
	.mouseout(function() {
   		 $('#leehyungchae_info').hide();
 	});

//박현천	
$("#parkhyunchun")
	.mouseover(function() {
		var p =	$("#parkhyunchun").position();
		$("#parkhyunchun_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});		
		$('#parkhyunchun_info').show();
	})
	.mouseout(function() {
   		 $('#parkhyunchun_info').hide();
 	});
	
//이준범	
$("#leejoonbeom")
	.mouseover(function() {
		var p =	$("#leejoonbeom").position();
		$("#leejoonbeom_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});		
		$('#leejoonbeom_info').show();
	})
	.mouseout(function() {
   		 $('#leejoonbeom_info').hide();
 	});
	
//양수열	
$("#yangsooyeol")
	.mouseover(function() {
		var p =	$("#yangsooyeol").position();
		$("#yangsooyeol_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});		
		$('#yangsooyeol_info').show();
	})
	.mouseout(function() {
   		 $('#yangsooyeol_info').hide();
 	});
	
//장태희	
$("#jangtaehee")
	.mouseover(function() {
		var p =	$("#jangtaehee").position();
		$("#jangtaehee_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});		
		$('#jangtaehee_info').show();
	})
	.mouseout(function() {
   		 $('#jangtaehee_info').hide();
 	});
	
//황학범	
$("#whanghakbeom")
	.mouseover(function() {
		var p =	$("#whanghakbeom").position();
		$("#whanghakbeom_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});		
		$('#whanghakbeom_info').show();
	})
	.mouseout(function() {
   		 $('#whanghakbeom_info').hide();
 	});
	
//이종은	
$("#leejongeun")
	.mouseover(function() {
		var p =	$("#leejongeun").position();
		$("#leejongeun_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});		
		$('#leejongeun_info').show();
	})
	.mouseout(function() {
   		 $('#leejongeun_info').hide();
 	});
	
//손지훈	
$("#sonjihoon")
	.mouseover(function() {
		var p =	$("#sonjihoon").position();
		$("#sonjihoon_info").css({
			"position" : "absolute",
			"top" : p.top + 0,
			"left" : p.left + 110
		});		
		$('#sonjihoon_info').show();
	})
	.mouseout(function() {
   		 $('#sonjihoon_info').hide();
 	});
	
//이철남	
$("#leecheolnam")
	.mouseover(function() {
		var p =	$("#leecheolnam").position();
		$("#leecheolnam_info").css({
			"position" : "absolute",
			"top" : p.top - 310,
			"left" : p.left + 110
		});		
		$('#leecheolnam_info').show();
	})
	.mouseout(function() {
   		 $('#leecheolnam_info').hide();
 	});
	
//윤종수	
$("#yoonjongsoo")
	.mouseover(function() {
		var p =	$("#yoonjongsoo").position();
		$("#yoonjongsoo_info").css({
			"position" : "absolute",
			"top" : p.top - 490,
			"left" : p.left + 110
		});		
		$('#yoonjongsoo_info').show();
	})
	.mouseout(function() {
   		 $('#yoonjongsoo_info').hide();
 	});
