// =============================================================
//  Demo runtime
//
//  Replaces Authorisation.js for the Aeronaut Demo build.
//
//   - Plugin starts unmuted (GlobalMute / Leveler1 / Leveler2 bypassed).
//   - A 1 Hz timer counts session time. After DEMO_TOTAL_MS the three
//     mute effects are enabled (each at Gain = -100 dB) and the existing
//     authorisation dialog is repurposed as a "Demo Expired / Buy Now"
//     overlay with a celeste "Buy it now" button.
//   - Per-session (reloading the plugin resets the counter). No file
//     persistence here on purpose: simpler, and aligned with how the
//     rest of the industry ships freebies.
//   - The "Buy it now" button is a ScriptPanel painted in script so we
//     can give it a flat celeste look without filmstrip images.
// =============================================================

namespace Demo
{
    const var DEMO_TOTAL_MS = 8 * 60 * 1000;   // 3 minutes
    const var TICK_MS       = 1000;            // 1 s resolution is plenty
    const var BUY_URL       = "https://sampleson.com/aeronaut.html?utm_source=demo";

    const var GlobalMute = Synth.getEffect("GlobalMute");
    const var Leveler1   = Synth.getEffect("Leveler1");
    const var Leveler2   = Synth.getEffect("Leveler2");

    const var crystalPanel = Content.getComponent("cristalPanel");
    const var Dialog       = Content.getComponent("AuthorisationDialogue");
    const var SerialInput  = Content.getComponent("SerialInput");
    const var SubmitButton = Content.getComponent("SubmitButton");
    const var BuyButton    = Content.getComponent("buyButton");

    // Celeste button palette. ARGB hex literals (HISE accepts them
    // directly anywhere a colour int is expected).
    const var BTN_COL_BASE  = 0xFF4FB5F0;
    const var BTN_COL_HOVER = 0xFF7CCBFA;
    const var BTN_COL_DOWN  = 0xFF2E91C9;
    const var BTN_TEXT_COL  = 0xFFFFFFFF;

    reg elapsedMs     = 0;
    reg expired       = false;
    reg buyBtnHover   = false;
    reg buyBtnPressed = false;

    if (BuyButton)
    {
        BuyButton.setPaintRoutine(function(g)
        {
            var area = this.getLocalBounds(0);
            var w    = area[2];
            var h    = area[3];

            var col = BTN_COL_BASE;
            if (buyBtnPressed) col = BTN_COL_DOWN;
            else if (buyBtnHover) col = BTN_COL_HOVER;

            g.setColour(col);
            g.fillRoundedRectangle([0, 0, w, h], 4.0);

            g.setColour(BTN_TEXT_COL);
            g.setFont("Abel", 26.0);
            g.drawAlignedText("Gert Aeronaut Now!", [0, 0, w, h], "centred");
        });

        BuyButton.setMouseCallback(function(event)
        {
            var dirty = false;

            if (event.hover != buyBtnHover)
            {
                buyBtnHover = event.hover;
                dirty = true;
            }

            if (event.mouseDownX != undefined && !event.mouseUp && event.hover)
            {
                if (!buyBtnPressed)
                {
                    buyBtnPressed = true;
                    dirty = true;
                }
            }
            else if (buyBtnPressed)
            {
                buyBtnPressed = false;
                dirty = true;
            }

            if (dirty)
                BuyButton.repaint();

            if (event.clicked)
                Engine.openWebsite(BUY_URL);
        });
    }

    inline function setMuted(isMuted)
    {
        if (GlobalMute) GlobalMute.setBypassed(!isMuted);
        if (Leveler1)   Leveler1.setBypassed(!isMuted);
        if (Leveler2)   Leveler2.setBypassed(!isMuted);
    }

    inline function showExpiredOverlay()
    {
        if (crystalPanel) crystalPanel.set("visible", true);
        if (Dialog)       Dialog.set("visible", true);

        // Make sure the licensing leftovers are out of the way.
        if (SerialInput)  SerialInput.set("visible", false);
        if (SubmitButton) SubmitButton.set("visible", false);
    }

    inline function hideExpiredOverlay()
    {
        if (crystalPanel) crystalPanel.set("visible", false);
        if (Dialog)       Dialog.set("visible", false);
    }

    setMuted(false);
    hideExpiredOverlay();

    const var demoTimer = Engine.createTimerObject();
    demoTimer.setTimerCallback(function()
    {
        elapsedMs = elapsedMs + TICK_MS;
        if (!expired && elapsedMs >= DEMO_TOTAL_MS)
        {
            expired = true;
            setMuted(true);
            showExpiredOverlay();
            demoTimer.stopTimer();
        }
    });
    demoTimer.startTimer(TICK_MS);
}
