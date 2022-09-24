var config = {
    needsToSave: false,
    needsToReloadHotkeys: false,
    set: function (key, value)
    {
        Engine.ConfigDB_CreateValue("user", key, value);
        this.needsToSave = true
        this.needsToReloadHotkeys = this.needsToReloadHotkeys || key.startsWith("hotkey.")
    },
    get: function (key) { return Engine.ConfigDB_GetValue("user", key) },
    save: function ()
    {
        if (this.needsToSave) Engine.ConfigDB_WriteFile("user", "config/user.cfg")
        if (this.needsToReloadHotkeys) Engine.ReloadHotkeys()
    }
}


function customrating_initCheck()
{
    let state = {
        "reasons": new Set(),
        "showReadme": false,
        "showSuggestDefaultChanges": false
    };

    // Check settings
    {
        let settings = Engine.ReadJSONFile("customrating_data/default_config.json");

        const allHotkeys = new Set(Object.keys(Engine.GetHotkeyMap()))
        // Normal check. Check for entries missing
        for (let key in settings)
        {
            if (key.startsWith("hotkey."))
            {
                if (!allHotkeys.has(key.substring("hotkey.".length)))
                {
                    config.set(key, settings[key]);
                    state.reasons.add("New customrating hotkey(s) added.");                    
                }
            }
            else if (config.get(key) == "")
            {
                config.set(key, settings[key]);
                state.reasons.add("New customrating settings added.");                
            }
        }
    }

    // Check if show readme (first time user case)
    {
        const key = "customrating.readme_seen2"
        if (config.get(key) == "false")
        {
            state.showReadme = true
            config.set(key, "true")
        }
    }
    config.save()
    return state;
};


autociv_patchApplyN("init", function (target, that, args)
{
    let state =  customrating_initCheck();
    if (state.reasons.size != 0)
    {
        let message = ["Custom Rating mod made some changes.\n Go to Settings/Options and Custom Rating tab for initial setup"].

            concat(Array.from(state.reasons).map(v => ` · ${v}`)).
            join("\n");

        messageBox(500, 300, message,
            "Customrating mod notice",
            ["Ok"],
            [() => { }, () => { }]
        );
    }


    if (state.showReadme)
        Engine.PushGuiPage("page_customrating_readme.xml");        

    return target.apply(that, args);
})
