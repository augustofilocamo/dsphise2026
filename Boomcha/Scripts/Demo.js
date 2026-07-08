// =============================================================
//  Demo runtime — Boomcha
//
//  Replaces Authorisation.js for the Boomcha Demo build.
//  Marcador: boomchaDemoExpiredFile (Interface.js, misma raíz que boomcha_find_request.json)
// =============================================================

namespace Demo
{
    const var DEMO_TOTAL_MS = 8 * 60 * 1000;
    const var TICK_MS       = 1000;
    const var BUY_URL       = "https://sampleson.com/boomcha.html?utm_source=boomcha_demo";

    const var GlobalMute = Synth.getEffect("GlobalMute");
    const var Leveler1   = Synth.getEffect("Leveler1");
    const var Leveler2   = Synth.getEffect("Leveler2");

    const var crystalPanel = Content.getComponent("cristalPanel");
    const var Dialog       = Content.getComponent("AuthorisationDialogue");
    const var SerialInput  = Content.getComponent("SerialInput");
    const var SubmitButton = Content.getComponent("SubmitButton");
    const var BuyButton    = Content.getComponent("buyButton");

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
            g.setFont("Tuffy", 26.0);
            g.drawAlignedText("Get Boomcha Now!", [0, 0, w, h], "centred");
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
        if (SerialInput)  SerialInput.set("visible", false);
        if (SubmitButton) SubmitButton.set("visible", false);
        if (BuyButton)    BuyButton.set("visible", true);
    }

    inline function hideExpiredOverlay()
    {
        if (crystalPanel) crystalPanel.set("visible", false);
        if (Dialog)       Dialog.set("visible", false);
        if (BuyButton)    BuyButton.set("visible", false);
    }

    inline function applyDemoExpiredState()
    {
        expired = true;
        writeBoomchaDemoExpiredMarker();
        setMuted(true);
        showExpiredOverlay();
    }

    const var demoTimer = Engine.createTimerObject();
    demoTimer.setTimerCallback(function()
    {
        elapsedMs = elapsedMs + TICK_MS;
        if (!expired && elapsedMs >= DEMO_TOTAL_MS)
        {
            applyDemoExpiredState();
            demoTimer.stopTimer();
        }
    });

    if (boomchaDemoTrialIsExpired)
    {
        expired = true;
        setMuted(true);
        showExpiredOverlay();
        Console.print("[Demo] trial already expired (marker on disk)");
    }
    else
    {
        setMuted(false);
        hideExpiredOverlay();
        demoTimer.startTimer(TICK_MS);
    }
}
