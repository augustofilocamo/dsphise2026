/** CableBox Component
*	by Christoph Hart
*
*	A component with source & destination connections and the ability to create cables
*	by dragging.
*
*	Usage:
*
*		const var cb = CableBox.create("cb", 0, 0); // x, y
*		CableBox.setNumBoxes(cb, 5, CableBox.INPUT); // Set number of inputs to 5
*		CableBox.setNumBoxes(cb, 5, CableBox.OUTPUT); // Set number of inputs to 5
*
*	Whenever you add / remove a connection, it gives you the full array with all connections in the 
*	form [[0, 1], [1, 0], [1, 2], ...] so you can do what ever you want. */

namespace CableBox // Todo esto no se toca
{
    /** Adds a new CableBox. */
    inline function create(name, x, y)
    {
        // Create a new panel (widget) at the specified coordinates (x, y) with the given name.
        local widget = Content.addPanel(name, x, y);

        // Set properties of the panel, including size and callback types.
        Content.setPropertiesFromJSON(name, {
            "width": 180,
            "height": 180,
            "allowCallbacks": "Clicks, Hover & Dragging",
            "saveInPreset": true
        });

        // Initialize widget data fields for managing connections, fade out effects, etc.
        widget.data.connections = [];
        widget.data.fadeOutAlpha = 1.0;
        widget.data.fadeOutCable = undefined;

        // Define the panel's paint routine (drawing logic).
        widget.setPaintRoutine(function(g)
        {
            // Fill the panel background with black color.
            g.fillAll(Colours.black);

            // Draw input boxes (with hover and drag effect).
            for(inputBox in this.data.inputBoxes)
            {
                g.setColour(inputBox == this.data.currentDragBox ? 0x44FFFFFF : 0x22FFFFFF); // Hover effect.
                g.fillRoundedRectangle(inputBox, 6.0);
                g.setColour(inputBox == this.data.currentDragBox ? 0xFFFFFFFF : 0x88FFFFFF); // Outline effect.
                g.drawRoundedRectangle(inputBox, 6.0, 1);
            }

            // Draw output boxes.
            for(outputBox in this.data.outputBoxes)
            {
                g.setColour(0x22FFFFFF);
                g.fillRoundedRectangle(outputBox, 6.0);
                g.setColour(0x88FFFFFF);
                g.drawRoundedRectangle(outputBox, 6.0, 1);
            }

            // If a cable is being dragged, draw it between the current drag box and the cursor.
            if(this.data.currentDragPosition.length)
            {
                g.setColour(Colours.white);
                var start = getCenter(this.data.currentDragBox); // Start position of the drag.
                var end = this.data.currentDragPosition;         // End position (mouse cursor).
                drawCable(g, start, end);                        // Draw the cable.
            }

            // Draw existing connections between input and output boxes.
            for(connection in this.data.connections)
            {
                g.setColour(0x88FFFFFF);
                drawCable(g, getCenter(this.data.inputBoxes[connection[0]]), 
                          getCenter(this.data.outputBoxes[connection[1]]) );
            }

            // Handle fading out of cables when the drag ends.
            if(this.data.fadeOutCable)
            {
                g.setColour(Colours.withAlpha(Colours.white, this.data.fadeOutAlpha));
                g.drawPath(this.data.fadeOutCable, -1, 2.0);
            }
        });

        // Handle mouse interactions for dragging, clicking, and dropping cables.
        widget.setMouseCallback(function(event)
        {
            if(event.clicked)
            {
                // Detect click on input boxes to start dragging a cable.
                for(inputBox in this.data.inputBoxes)
                {
                    if(contains([event.x, event.y], inputBox))
                    {
                        this.data.currentDragBox = inputBox; // Set the current drag box.
                        this.repaint();
                        return;
                    }
                }

                // Detect click on output boxes to potentially remove an existing connection.
                for(outputBox in this.data.outputBoxes)
                {
                    if(contains([event.x, event.y], outputBox))
                    {
                        var index = this.data.outputBoxes.indexOf(outputBox);
                        // Remove the connection if found.
                        for(connection in this.data.connections)
                        {
                            if(connection[1] == index)
                            {
                                this.data.currentDragBox = this.data.inputBoxes[connection[0]];
                                this.data.connections.remove(connection);
                                this.repaint();
                                this.setValue(this.data.connections);
                                this.changed();
                                return;
                            }
                        }
                    }
                }
                return;
            }

            if(event.mouseUp)
            {
                // Detect where the cable drag ends (on an output box).
                for(outputBox in this.data.outputBoxes)
                {
                    if(contains([event.x, event.y], outputBox))
                    {
                        this.data.currentDragTarget = outputBox;
                        var start = this.data.inputBoxes.indexOf(this.data.currentDragBox);
                        var end = this.data.outputBoxes.indexOf(outputBox);
                        var connection = [start, end];
                        // Add the connection between input and output.
                        this.data.connections.insert(-1, connection);
                        this.setValue(this.data.connections);
                        this.changed();
                    }
                }

                // Handle cable fade out when drag ends.
                if(this.data.currentDragBox)
                {
                    this.data.fadeOutCable = CableBox.createCable(CableBox.getCenter(this.data.currentDragBox), [event.x, event.y]);
                    this.data.currentDragBox = undefined;
                    this.data.currentDragPosition = -1;
                    this.data.fadeOutAlpha = 1.0;
                    this.startTimer(30); // Start timer for cable fade out.
                }
                this.repaint();
                return;
            }

            // Update cable position as it's being dragged.
            if(event.drag)
            {
                if(this.data.currentDragBox)
                {
                    this.data.currentDragPosition = [event.x, event.y];
                    this.repaint();    
                }
            }
        });

        // Timer to gradually fade out the cable after drag.
        widget.setTimerCallback(function()
        {
            this.data.fadeOutAlpha -= 0.2;
            if(this.data.fadeOutAlpha <= 0.0)
            {
                this.data.fadeOutCable = undefined;
                this.stopTimer();
            }
            this.repaint();
        });

        return widget;
};

    // Constants for identifying input and output.
    const var INPUT = 1;
    const var OUTPUT = 0;

    /** Sets the amount of input/output boxes for the given CableBox. */
    inline function setNumBoxes(box, boxAmount, isInput)
    {
        local boxes = [];
        if(isInput)
        {
            box.data.numInputs = boxAmount;
            box.data.inputBoxes = boxes;    
        }
        else
        {
            box.data.numOutputs = boxAmount;
            box.data.outputBoxes = boxes;    
        }

        // Calculate the height for each box based on the total box amount.
        local heightPerBox = (box.getHeight()-20) / boxAmount;

        // Set up box positions and dimensions.
       	for(i = 0; i < boxAmount; i++)
        {
            local y = i * heightPerBox;
            boxes[i] = [(isInput ? 10 : box.getWidth() - 40), 10 + y, 15, 15];
        }    
    };

    /** Updates the CableBox with new connections. */
    inline function updateCableBox(box)
    {
        box.data.connections = value;
        box.repaint();
    }

    /** Helper function to check if a point (x, y) is inside a given rectangle (area). */
    inline function contains(point, area)
    {
        return point[0] > area[0] && point[0] < area[0] + area[2] &&
               point[1] > area[1] && point[1] < area[1] + area[3];
    }

    /** Returns the center point of a rectangle (area). */
    inline function getCenter(area)
    {
        return [area[0] + 0.5*area[2], area[1] + 0.5*area[3]];
    }

    /** Creates a cable between two points (start, end) using a quadratic curve. */
    inline function createCable(start, end)
    {
        local midY = Math.max(start[1], end[1]) + 30 + 150.0/(end[0]-start[0]);
        local midX = start[0] + (end[0] - start[0])/2;
        local p = Content.createPath();
        p.startNewSubPath(start[0], start[1]);
        p.quadraticTo(midX, midY, end[0], end[1]);
        return p;
    }

    /** Draws a cable between two points (start, end). */
    inline function drawCable(g, start, end)
    {
        local p = createCable(start, end);
        g.drawPath(p, -1, 2.0); // Draw the cable path.
        g.setColour(0x88FFFFFF);
        g.fillEllipse([start[0]-2, start[1]-2, 4, 4]); // Draw ellipse at the start point.
        g.fillEllipse([end[0]-2, end[1]-2, 4, 4]);     // Draw ellipse at the end point.
    }
};

// Creating and configuring CableBox UI
Content.makeFrontInterface(600, 300);

// ACA SE AGREGA LA LISTA DE ENTRADAS Y SALIDAS
namespace MatrixInputs // Elementos que envían
{
    const var LFO = 0;		// Pitch
    const var ENVELOPE = 1;	// Velocity
   // const var MODWHEEL = 2;
}

namespace MatrixOutputs // Elementos que reciben 
{	// AGREGAR PARAMETROS VCO, VCF, VCA
    const var GAIN = 0;
    const var PITCH = 1;
    const var FILTER = 2;
}

// Create a CableBox and set the number of input/output boxes
const var x = CableBox.create("x", 200, 50); // Elemento X a crear

// ELEMENTOS QUE EMITEN LA CONEXION (PITCH Y VELOCITY)
CableBox.setNumBoxes(	x,					// Elemento UI a crear
						2,					// Cantidad de salidas
						CableBox.INPUT);	// Tipo de cablebox


// ELEMENTOS QUE RECIBEN LA CONEXION (VCO, VCF, VCA)
CableBox.setNumBoxes(	x, 					// Elemento UI a crear
/*CAMBIAR NUMERO*/		3, 					// Cantidad de entradas. CAMBIAR ESTE VALOR
						CableBox.OUTPUT);	// Tipo de cablebox

// Add labels for different modulation sources and targets (LFO, Velocity, Modwheel, Gain, Pitch, Filter).

// *** ACA SE AGREGA LOS NOMBRES DE UI ***
const var lfoLabel = Content.addLabel("lfoLabel", 93, 55); // Cambiar acá posición del conector
Content.setPropertiesFromJSON("lfoLabel", {
    "text": "LFO",
    "width": 104,
    "height": 25,
    "fontName": "Oxygen",
    "fontSize": 16,
    "fontStyle": "Bold",
    "alignment": "right",
    "multiline": 0
});

const var envelopeLabel = Content.addLabel("envelopeLabel", 93, 108); // Separación vertical de 53 en eje Y
Content.setPropertiesFromJSON("envelopeLabel", {
    "text": "Velocity",
    "width": 104,
    "height": 25,
    "fontName": "Oxygen",
    "fontSize": 16,
    "fontStyle": "Bold",
    "alignment": "right",
    "multiline": 0
});

const var Gain = Content.addLabel("Gain", 381, 56);
Content.setPropertiesFromJSON("Gain", {
    "width": 104,
    "height": 25,
    "fontName": "Oxygen",
    "fontSize": 16,
    "fontStyle": "Bold",
    "alignment": "left",
    "multiline": 0
});

const var Pitch = Content.addLabel("Pitch", 379, 109);
Content.setPropertiesFromJSON("Pitch", {
    "width": 104,
    "height": 25,
    "fontName": "Oxygen",
    "fontSize": 16,
    "fontStyle": "Bold",
    "alignment": "left",
    "multiline": 0
});

const var Filter = Content.addLabel("Filter", 379, 161);
Content.setPropertiesFromJSON("Filter", {
    "width": 104,
    "height": 25,
    "fontName": "Oxygen",
    "fontSize": 16,
    "fontStyle": "Bold",
    "alignment": "left",
    "multiline": 0
});

// Tomar valores de Faust
const var attributes = [];
const var faust = Synth.getEffect("Faust");


// Salva los valores de los sliders en array attributeValue[]
inline function saveValues() {
	
	// Obtiene el número total de atributos
	local numAttributess = faust.getNumAttributes();
	
	
	// Itera sobre el número de atributos y guarda sus valores en el array
	local i = 0;
	
	for (i = 0; i < numAttributess; i++)
	{

		// Obtiene el valor de cada atributo
		local attributeValue = faust.getAttribute(i);
		
		// Añade el valor al array
		attributes.push(attributeValue);
	}
	
	Console.print("values saved");
}


// Setup modulation targets: how each modulation source (LFO, Velocity, Modwheel) connects to Gain, Pitch, and Filter.
// *** ACÁ HAY QUE SETEAR Y CONECTAR LOS PARÁMETROS DE FAUST ***
/*
const var modulationTargets = [[Synth.getModulator("Gain LFO"), Synth.getModulator("Gain Velocity")],
                               [Synth.getModulator("Pitch LFO"), Synth.getModulator("Pitch Velocity")],
                               [Synth.getModulator("Filter LFO"), Synth.getModulator("Filter Velocity")]];

*/  
const var modulationTargets = [[Synth.getModulator("Gain LFO"), Synth.getModulator("Gain Velocity")],
                               [Synth.getModulator("Pitch LFO"), Synth.getModulator("Pitch Velocity")],
                               [Synth.getModulator("Filter LFO"), Synth.getModulator("Filter Velocity")]];
                           
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
	if(number == x)
	{
		for(targets in modulationTargets)
		{
			for(mod in targets)
			{
				mod.setBypassed(true);
			}
		}
		
		for(connection in value)
		{
			local m = modulationTargets[connection[1]][connection[0]];
			
			Console.print(m);
			
			m.setBypassed(false);
			
		}
	}
}
