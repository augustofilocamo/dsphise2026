//! Websites
const var websitePanel = Content.getComponent("websitePanel");

websitePanel.setMouseCallback(function(event)
{
    if (event.clicked) Engine.openWebsite("https://sampleson.com/");
});
