if (!global.g_autociv_optionsFiles)
	var g_autociv_optionsFiles = ["gui/options/options.json"]
g_autociv_optionsFiles.push("customrating_data/options.json")

init = function (data, hotloadData)
{
	g_ChangedKeys = hotloadData ? hotloadData.changedKeys : new Set();
	g_TabCategorySelected = hotloadData ? hotloadData.tabCategorySelected : 0;

	// CHANGES START /////////////////////////
	g_Options = []
	for (let options of g_autociv_optionsFiles)
		Array.prototype.push.apply(g_Options, Engine.ReadJSONFile(options))
	// CHANGES END /////////////////////////

	translateObjectKeys(g_Options, ["label", "tooltip"]);

	// DISABLE IF DATA IS LOADED DYNAMICALLY
	// deepfreeze(g_Options);

	placeTabButtons(
		g_Options,
		false,
		g_TabButtonHeight,
		g_TabButtonDist,
		selectPanel,
		displayOptions);
}

/**
 * Sets up labels and controls of all options of the currently selected category.
 */
displayOptions = function ()
{
	// Hide all controls
	for (let body of Engine.GetGUIObjectByName("option_controls").children)
	{
		body.hidden = true;
		for (let control of body.children)
			control.hidden = true;
	}

	// Initialize label and control of each option for this category
	for (let i = 0; i < g_Options[g_TabCategorySelected].options.length; ++i)
	{
		// Position vertically
		let body = Engine.GetGUIObjectByName("option_control[" + i + "]");
		let bodySize = body.size;
		bodySize.top = g_OptionControlOffset + i * (g_OptionControlHeight + g_OptionControlDist);
		bodySize.bottom = bodySize.top + g_OptionControlHeight;
		body.size = bodySize;
		body.hidden = false;

		// Load option data
		let option = g_Options[g_TabCategorySelected].options[i];
		let optionType = g_OptionType[option.type];
		let value = optionType.configToValue(Engine.ConfigDB_GetValue("user", option.config));

		// Setup control
		let control = Engine.GetGUIObjectByName("option_control_" + (g_OptionType[option.type].objectType ?? option.type) + "[" + i + "]");
		control.tooltip = option.tooltip + (optionType.tooltip ? "\n" + optionType.tooltip(value, option) : "");
		control.hidden = false;

		if (optionType.initGUI)
			optionType.initGUI(option, control);

		control[optionType.guiSetter] = function () { };
		optionType.valueToGui(value, control);
		if (optionType.sanitizeValue)
			optionType.sanitizeValue(value, control, option);

		control[optionType.guiSetter] = function ()
		{

			let value = optionType.guiToValue(control);

			if (optionType.sanitizeValue)
				optionType.sanitizeValue(value, control, option);

			control.tooltip = option.tooltip + (optionType.tooltip ? "\n" + optionType.tooltip(value, option) : "");

			Engine.ConfigDB_CreateValue("user", option.config, String(value));
			Engine.ConfigDB_SetChanges("user", true);

			g_ChangedKeys.add(option.config);
			fireConfigChangeHandlers(new Set([option.config]));

			if (option.function)
				Engine[option.function](value);

			enableButtons();
		};

		// Setup label
		let label = Engine.GetGUIObjectByName("option_label[" + i + "]");
		label.caption = option.label;
		label.tooltip = option.tooltip;
		label.hidden = false;

		let labelSize = label.size;
		labelSize.left = option.dependencies ? g_DependentLabelIndentation : 0;
		labelSize.rright = control.size.rleft;
		label.size = labelSize;
	}

	enableButtons();
}


enableButtons = function ()
{
	g_Options[g_TabCategorySelected].options.forEach((option, i) =>
	{

		let enabled =
			!option.dependencies ||
			option.dependencies.every(config => Engine.ConfigDB_GetValue("user", config) == "true");

		const objectType = g_OptionType[option.type].objectType ?? option.type
		Engine.GetGUIObjectByName("option_label[" + i + "]").enabled = enabled;
		const control = Engine.GetGUIObjectByName("option_control_" + objectType + "[" + i + "]")
		control.enabled = enabled;
		if (objectType == "string")
		{
			control.textcolor = enabled ? "255 255 255" : "130 130 130"
			control.ghost = !enabled
		}
	});

	let hasChanges = Engine.ConfigDB_HasChanges("user");
	Engine.GetGUIObjectByName("revertChanges").enabled = hasChanges;
	Engine.GetGUIObjectByName("saveChanges").enabled = hasChanges;
}
