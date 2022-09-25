

function customrating(attribs)
{
	var customrating_debug = false;

	g_UserRating = attribs.rating;

	var g_PlayerName = attribs.name;
	var randomRating;


	customrating_debug === true ? warn(uneval("customrating current rating:"+attribs.rating)) : false;
	customrating_debug === true ? warn(uneval("customrating Player:"+attribs.name)): false;
	
	g_UserRating = attribs.rating;
	
	var customrating_value = Engine.ConfigDB_GetValue("user","customrating.value");
	var customrating_random = Engine.ConfigDB_GetValue("user","customrating.random");
	var customrating_enabled = Engine.ConfigDB_GetValue("user","customrating");

	customrating_debug === true ? warn(uneval("customrating to be:"+customrating_value)) : false;
	if(customrating_enabled == "true" ) {
		if (customrating_random == "true" ) {
			//This is EXPERIMENTAL - will make trouble if rejoining game
			// It means additional code to handle detection of "rejoining" existing game to 
			// set original value back - currently no idea how to handle it - most likely store to user.cfg as 
			// key like customrating.saved="1234;game_started_time;host_name"						

			// (max - min) + min - return random number between min(inclusive) and max (exclusive)
			randomRating = (Math.floor(Math.random() * (1900 - 1200) + 1200));
			randomRating = randomRating + "";		

			g_UserRating = randomRating.substring(0,26);	
			//warn(uneval("customrating_random: "+g_UserRating));		
		} else {
			if(customrating_value == "false") {
				// Get only username without brackets			
				//warn(uneval("customrating_value - false - no rating"));
				g_UserRating = false;
			} else {
					//warn(uneval("customrating_value - text"));	 
					//replace extra chars (have to do this coz options save buttonwill save them in wrong charset)
					customrating_value = customrating_value.replace(/\^1/g,"∞");
					customrating_value = customrating_value.replace(/\^2/g,"♡");
					customrating_value = customrating_value.replace(/\^3/g,"™");
					customrating_value = customrating_value.replace(/\^4/g,"★");
					customrating_value = customrating_value.replace(/\^5/g,"↑");
					g_UserRating = customrating_value.substring(0,26);
			}					
		}
	} //customrating_enabled		
	g_PlayerName = !!attribs.name ? attribs.name + (g_UserRating ? " (" + g_UserRating + ")" : "") : "";		
} //customrating