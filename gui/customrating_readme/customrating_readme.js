function init()
{
    Engine.GetGUIObjectByName("buttonWebpage").caption = Engine.Translate("Mod webpage")
    Engine.GetGUIObjectByName("buttonClose").caption = Engine.Translate("Close")
    Engine.GetGUIObjectByName("title").caption = Engine.Translate("Customrating readme")

    const webpageURL = "https://github.com/Kampot-0ad/customrating"
    Engine.GetGUIObjectByName("buttonWebpage").onPress = () => Engine.OpenURL(webpageURL)

    const markdown = Engine.ReadFile("customrating_data/README.md")
    Engine.GetGUIObjectByName("text").caption = autociv_SimpleMarkup(markdown)
}
