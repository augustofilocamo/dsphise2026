Content.makeFrontInterface(600, 600);

// =============================================================================
// COMPONENT REFERENCES & VARIABLES
// =============================================================================
const var MIDIPlayers = [
    Synth.getMidiPlayer("MIDI Player1"),
    Synth.getMidiPlayer("MIDI Player2")
];



const var pnl_MidiPatternGrid = Content.getComponent("pnl_MidiPatternGrid");
const var lbl_MidiFileName1 = Content.getComponent("lbl_MidiFileName1");
const var pnl_MidiViewer1 = Content.getComponent("pnl_MidiViewer1");
const var btn_GridPrev = Content.getComponent("btn_GridPrev");
const var btn_GridNext = Content.getComponent("btn_GridNext");
const var lbl_PageInfo = Content.getComponent("lbl_PageInfo");
const var btn_Player1 = Content.getComponent("btn_Player1");
const var btn_Player2 = Content.getComponent("btn_Player2");

namespace MidiBrowser
{
	reg activeMidiPlayerIndex = 0;
	reg currentMidiPlayer = MIDIPlayers[activeMidiPlayerIndex];
	reg gridRows = 4;
	reg gridCols = 3;
	reg totalSlots = gridRows * gridCols;
	reg currentPage = 0;
	reg selectedPatternIndex = -1;
	reg hoveredPatternIndex = -1;
	reg currentMidiIndex = -1;
	reg midiPreviewCache = {};
	
	var AAplayerFilePaths = currentMidiPlayer.getMidiFileList();
	
	// =============================================================================
	// MULTI-PLAYER SYSTEM
	// =============================================================================
	inline function switchToMidiPlayer(playerIndex)
	{
	    if (playerIndex >= 0 && playerIndex < MIDIPlayers.length)
	    {
	        activeMidiPlayerIndex = playerIndex;
	        currentMidiPlayer = MIDIPlayers[activeMidiPlayerIndex];
	        
	        midiPreviewCache = {};
	        
	        selectedPatternIndex = -1;
	        currentMidiIndex = -1;
	        currentPage = 0;
	        
	        pnl_MidiPatternGrid.repaint();
	        updatePageInfo();
	        lbl_MidiFileName1.set("text", "No Pattern Selected");
	        
	        currentMidiPlayer.connectToPanel(pnl_MidiViewer1);
	        currentMidiPlayer.setRepaintOnPositionChange(true);
	    }
	}
	
	// =============================================================================
	// GRID FUNCTIONS
	// =============================================================================
	inline function getGridCellBounds(index)
	{
	    local col = index % gridCols;
	    local row = Math.floor(index / gridCols);
	    local cellWidth = pnl_MidiPatternGrid.getWidth() / gridCols;
	    local cellHeight = pnl_MidiPatternGrid.getHeight() / gridRows;
	    local padding = 4;
	    
	    return [
	        col * cellWidth + padding,
	        row * cellHeight + padding,
	        cellWidth - padding * 2,
	        cellHeight - padding * 2
	    ];
	}
	
	inline function getCurrentPagePatterns()
	{
	    local startIndex = currentPage * totalSlots;
	    local patterns = [];
	    local playerFilePaths = currentMidiPlayer.getMidiFileList();
	    
	    for (i = 0; i < totalSlots; i++)
	    {
	        local midiIndex = startIndex + i;
	        if (midiIndex < playerFilePaths.length)
	        {
	            patterns.push({
	                "filePath": playerFilePaths[midiIndex],
	                "name": playerFilePaths[midiIndex].substring(
	                    playerFilePaths[midiIndex].indexOf("}")+1, 
	                    playerFilePaths[midiIndex].indexOf(".mid")
	                ),
	                "globalIndex": midiIndex
	            });
	        }
	        else
	        {
	            patterns.push(null);
	        }
	    }
	    
	    return patterns;
	}
	
	inline function getCachedMidiPreview(pattern)
	{
	    local cacheKey = activeMidiPlayerIndex + "_" + pattern.globalIndex;
	    
	    if (!isDefined(midiPreviewCache[cacheKey]))
	    {
	        currentMidiPlayer.setFile(pattern.filePath, true, false);
	        local eventList = currentMidiPlayer.getEventList();
	        
	        if (eventList.length > 0)
	        {
	            midiPreviewCache[cacheKey] = {
	                "events": eventList,
	                "cached": true
	            };
	        }
	        else
	        {
	            midiPreviewCache[cacheKey] = {
	                "events": [],
	                "cached": true
	            };
	        }
	    }
	    
	    return midiPreviewCache[cacheKey];
	}
	
	inline function drawMidiPreviewInCell(graphics, pattern, cellBounds)
	{
	    local vizBounds = [
	        cellBounds[0] + 2,
	        cellBounds[1] + 2,
	        cellBounds[2] - 4,
	        cellBounds[3] - 22
	    ];
	    
	    local cachedData = getCachedMidiPreview(pattern);
	    
	    if (cachedData.events.length == 0)
	        return;
	    
	    local noteRects = currentMidiPlayer.convertEventListToNoteRectangles(cachedData.events, vizBounds);
	    
	    for (i = 0; i < noteRects.length; i++)
	    {
	        noteRects[i][0] += vizBounds[0];
	    }
	    
	    if (noteRects.length > 0)
	    {
	        local minNote = 127;
	        local maxNote = 0;
	        for (note in noteRects)
	        {
	            local noteNum = note[1];
	            minNote = Math.min(minNote, noteNum);
	            maxNote = Math.max(maxNote, noteNum);
	        }
	        
	        local noteRange = Math.max(1, maxNote - minNote);
	        
	        for (note in noteRects)
	        {
	            local originalY = note[1];
	            local normalizedPos = (originalY - minNote) / noteRange;
	            local remappedY = vizBounds[1] + normalizedPos * (vizBounds[3] - 4);
	            local noteHeight = Math.max(2, vizBounds[3] / (noteRange + 1) * 0.6);
	            
	            graphics.setColour(0x88FFFFFF);
	            graphics.fillRoundedRectangle([note[0], remappedY, note[2], noteHeight], 1);
	        }
	    }
	}
	
	inline function updatePageInfo()
	{
	    local playerFilePaths = currentMidiPlayer.getMidiFileList();
	    local maxPages = Math.ceil(playerFilePaths.length / totalSlots);
	    local pageText = "Page " + (currentPage + 1) + " of " + maxPages;
	    lbl_PageInfo.set("text", pageText);
	}
	
	// =============================================================================
	// PAINT ROUTINES
	// =============================================================================
	pnl_MidiPatternGrid.setPaintRoutine(function(g)
	{
	    g.fillAll(0x22000000);
	    
	    var patterns = getCurrentPagePatterns();
	    
	    for (i = 0; i < totalSlots; i++)
	    {
	        var cellBounds = getGridCellBounds(i);
	        var pattern = patterns[i];
	        
	        if (pattern != null)
	        {
	            var isSelected = pattern.globalIndex == selectedPatternIndex;
	            var isHovered = i == hoveredPatternIndex;
	            
	            if (isSelected)
	                g.setColour(0x66FF6B35);
	            else if (isHovered)
	                g.setColour(0x44FFFFFF);
	            else
	                g.setColour(0x33000000);
	            
	            g.fillRoundedRectangle(cellBounds, 3);
	            
	            drawMidiPreviewInCell(g, pattern, cellBounds);
	            
	            g.setColour(0xFFFFFFFF);
	            g.setFont("default", 10);
	            var textBounds = [cellBounds[0], cellBounds[1] + cellBounds[3] - 20, cellBounds[2], 20];
	            g.drawAlignedText(pattern.name, textBounds, "centred");
	            
	            g.setColour(isSelected ? 0xFFFF6B35 : 0x66FFFFFF);
	            g.drawRoundedRectangle(cellBounds, 3, 1);
	        }
	        else
	        {
	            g.setColour(0x11FFFFFF);
	            g.drawRoundedRectangle(cellBounds, 3, 1);
	        }
	    }
	});
	
	pnl_MidiViewer1.setPaintRoutine(function(a)
	{
	    a.fillAll(0x00000000);
	
	    reg mlist = currentMidiPlayer.getNoteRectangleList([0, 0, this.getWidth(), this.getHeight()]);
	    
	    if (currentMidiPlayer.isEmpty() == 0 && mlist.length > 0)
	    {
	        var minNote = 127, maxNote = 0;
	        for (note in mlist)
	        {
	            var noteNum = note[1];
	            minNote = Math.min(minNote, noteNum);
	            maxNote = Math.max(maxNote, noteNum);
	        }
	        
	        var noteRange = Math.max(1, maxNote - minNote);
	        var panelHeight = this.getHeight();
	        var availableSpace = panelHeight / (noteRange + 1);
	        var noteHeight = Math.max(8, availableSpace * 0.7);
	        
	        for (note in mlist)
	        {
	            var originalY = note[1];
	            var normalizedPos = (originalY - minNote) / noteRange;
	            var remappedY = normalizedPos * (panelHeight - noteHeight);
	            
	            var noteRect = [note[0], remappedY, note[2], noteHeight];
	            var shadowRect = [note[0] + 1, remappedY + 1, note[2], noteHeight];
	            
	            a.setColour(0x40000000);
	            a.fillRoundedRectangle(shadowRect, 2.0);
	            
	            a.setColour(0xFFE8E8E8);
	            a.fillRoundedRectangle(noteRect, 2.0);
	            
	            var highlightRect = [note[0] + 1, remappedY + 1, note[2] - 2, Math.max(1, noteHeight / 3)];
	            a.setColour(0x30FFFFFF);
	            a.fillRoundedRectangle(highlightRect, 1.0);
	            
	            a.setColour(0xFF999999);
	            a.drawRoundedRectangle(noteRect, 2.0, 1.0);
	        }
	    }
	    
	    var pos = currentMidiPlayer.getPlaybackPosition() * this.getWidth();
	    a.setColour(0xFFFF6B35);
	    a.drawLine(pos, pos, 0.0, this.getHeight(), 2.0);
	});
	
	// =============================================================================
	// EVENT HANDLERS
	// =============================================================================
	
	// Mouse Events
	pnl_MidiPatternGrid.setMouseCallback(function(event)
	{
	    var patterns = getCurrentPagePatterns();
	    
	    if (event.hover || event.exit)
	    {
	        hoveredPatternIndex = -1;
	        
	        if (event.hover)
	        {
	            for (i = 0; i < totalSlots; i++)
	            {
	                var cellBounds = getGridCellBounds(i);
	                if (event.x >= cellBounds[0] && event.x <= cellBounds[0] + cellBounds[2] &&
	                    event.y >= cellBounds[1] && event.y <= cellBounds[1] + cellBounds[3])
	                {
	                    if (patterns[i] != null)
	                        hoveredPatternIndex = i;
	                    break;
	                }
	            }
	        }
	        
	        this.repaint();
	    }
	    
	    if (event.clicked)
	    {
	        for (i = 0; i < totalSlots; i++)
	        {
	            var cellBounds = getGridCellBounds(i);
	            if (event.x >= cellBounds[0] && event.x <= cellBounds[0] + cellBounds[2] &&
	                event.y >= cellBounds[1] && event.y <= cellBounds[1] + cellBounds[3])
	            {
	                var pattern = patterns[i];
	                if (pattern != null)
	                {
	                    selectedPatternIndex = pattern.globalIndex;
	                    currentMidiIndex = pattern.globalIndex;
	                    
	                    currentMidiPlayer.setFile(pattern.filePath, true, true);
	                    lbl_MidiFileName1.set("text", pattern.name);
	                    
	                    pnl_MidiViewer1.repaint();
	                    this.repaint();
	                }
	                break;
	            }
	        }
	    }
	});
	
	// Key Events
	pnl_MidiPatternGrid.setConsumedKeyPresses([
	    {"keyCode": 63234}, // Arrow Left
	    {"keyCode": 63232}, // Arrow Up  
	    {"keyCode": 63235}, // Arrow Right
	    {"keyCode": 63233}, // Arrow Down
	    {"keyCode": 13}     // Enter
	]);
	
	pnl_MidiPatternGrid.setKeyPressCallback(function(obj) 
	{
	    if(obj.isFocusChange)
	        return;
	    
	    var patterns = getCurrentPagePatterns();
	    var currentHoveredCellIndex = hoveredPatternIndex;
	    
	    // If nothing hovered yet, start at 0
	    if (currentHoveredCellIndex == -1)
	        currentHoveredCellIndex = 0;
	    
	    var newIndex = currentHoveredCellIndex;
	    
	    // Arrow keys: just move the hover indicator (grey box)
	    if (obj.keyCode == 63234 && currentHoveredCellIndex > 0) // Left
	        newIndex = currentHoveredCellIndex - 1;
	    else if (obj.keyCode == 63235 && currentHoveredCellIndex < totalSlots - 1) // Right
	        newIndex = currentHoveredCellIndex + 1;
	    else if (obj.keyCode == 63232 && currentHoveredCellIndex >= gridCols) // Up
	        newIndex = currentHoveredCellIndex - gridCols;
	    else if (obj.keyCode == 63233 && currentHoveredCellIndex < totalSlots - gridCols) // Down
	        newIndex = currentHoveredCellIndex + gridCols;
	    
	    // Arrow key movement: just update hover, don't load MIDI
	    if (newIndex != currentHoveredCellIndex && patterns[newIndex] != null)
	    {
	        hoveredPatternIndex = newIndex; // Update hover index, not selection
	        this.repaint();
	    }
	    
	    // Enter key: actually load the currently hovered pattern
	    else if (obj.keyCode == 13 && hoveredPatternIndex != -1 && patterns[hoveredPatternIndex] != null)
	    {
	        var pattern = patterns[hoveredPatternIndex];
	        
	        // Now update the selection (orange box) and load MIDI
	        selectedPatternIndex = pattern.globalIndex;
	        currentMidiIndex = pattern.globalIndex;
	        
	        currentMidiPlayer.setFile(pattern.filePath, true, true);
	        lbl_MidiFileName1.set("text", pattern.name);
	        
	        pnl_MidiViewer1.repaint();
	        this.repaint();
	    }
	});
	
	inline function onbtn_GridPrevControl(component, value)
	{
	    if (value == 1 && currentPage > 0)
	    {
	        currentPage--;
	        pnl_MidiPatternGrid.repaint();
	        updatePageInfo();
	    }
	}
	
	inline function onbtn_GridNextControl(component, value)
	{
	    if (value == 1)
	    {
	        local playerFilePaths = currentMidiPlayer.getMidiFileList();
	        local maxPages = Math.ceil(playerFilePaths.length / totalSlots);
	        if (currentPage < maxPages - 1)
	        {
	            currentPage++;
	            pnl_MidiPatternGrid.repaint();
	            updatePageInfo();
	        }
	    }
	}
	
	// CORRECT CODE
	inline function onBtn_Player1Control(component, value)
	{
	    if (value == 1)
	        switchToMidiPlayer(0);
	}
	
	inline function onBtn_Player2Control(component, value)
	{
	    if (value == 1)
	        switchToMidiPlayer(1);
	}
	
	Content.getComponent("btn_GridPrev").setControlCallback(onbtn_GridPrevControl);
	Content.getComponent("btn_GridNext").setControlCallback(onbtn_GridNextControl);
	Content.getComponent("btn_Player1").setControlCallback(onBtn_Player1Control);
	Content.getComponent("btn_Player2").setControlCallback(onBtn_Player2Control);
	
	// =============================================================================
	// INITIALIZATION
	// =============================================================================
	currentMidiPlayer.connectToPanel(pnl_MidiViewer1);
	currentMidiPlayer.setRepaintOnPositionChange(true);
	updatePageInfo();
}

function onNoteOn()
{
	
}
 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 