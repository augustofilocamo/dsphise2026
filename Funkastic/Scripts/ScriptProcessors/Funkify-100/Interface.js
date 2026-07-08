Content.makeFrontInterface(1024, 680);

const var mp = Synth.getMidiPlayer("MIDI Player1");
const var TypesComboBox = Content.getComponent("TypesComboBox");
const var TonesComboBox = Content.getComponent("TonesComboBox");
const var ModesComboBox = Content.getComponent("ModesComboBox");
const var DensityComboBox = Content.getComponent("DensityComboBox");
const var GenerateButton = Content.getComponent("Generate");
const var GenerateSameClusterButton = Content.getComponent("GenerateSameCluster");
const var VelocityComboBox = Content.getComponent("VelocityComboBox");
const var QuantizeComboBox = Content.getComponent("QuantizeComboBox");




Console.print("=== USANDO MIDIFILES/ DEL PROYECTO (FACTORY CONTENT) ===");


Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Tuffy-Regular.ttf", "Tuffy");
Engine.setGlobalFont("Tuffy");

// Includes
include("laf.js");
include("pluginVSstandalone.js");
include("menuPanels.js");
include("midiIndex.js");  // Índice de MIDIs embebido
include("Authorisation.js");


// Custom Keyboard Panel
const var KeyboardPanel = Content.getComponent("KeyboardPanel");

// MIDI Viewer Panel
const var MidiViewer = Content.getComponent("MidiViewer");

// Navigation buttons
const var FwdGenerated = Content.getComponent("FwdGenerated");
const var RevGenerated = Content.getComponent("RevGenerated");

// Tempo Label
const var TempoLabel = Content.getComponent("TempoLabel");

// Play Button
const var PlayButton = Content.getComponent("Play");

// Sync Button y BPM Knob
const var SyncButton = Content.getComponent("SyncButton");
const var BpmKnob = Content.getComponent("BpmKnob");

// More Button (link to website)
const var moreButton = Content.getComponent("moreButton");

// Autoplay Button
const var AutoplayButton = Content.getComponent("AutoplayButton");

// Variable para guardar el BPM anterior
var previousBpm = 84;


// Wah rate on init
const var LFOModulator1 = Synth.getModulator("LFO Modulator1");

// Transport Handler para sincronización con DAW
const var TransportHandler = Engine.createTransportHandler();

// Variables para autoplay
var isAutoplayActive = false;
var previousPlaybackPos = 0.0;
var lastGeneratedTone = "E"; // Guardar el tono del MIDI actual
var autoplayDebounce = false; // Evitar múltiples disparos del autogenerate en un loop

// Variable para trackear estado del DAW (actualizada por TransportHandler)
var isDawPlaying = false;

// Helper function para detectar teclas negras
inline function isBlackKey(n)
{
    return [1, 3, 6, 8, 10].indexOf(parseInt(n) % 12) != -1;
}

// Variables del teclado
const var startNote = 60; // C4
const var numKeys = 12; // Una octava
const var whiteKeyWidth = 50;
const var whiteKeyHeight = 130;
const var blackKeyWidth = 35;
const var blackKeyHeight = 80;

// Array para tracking de posiciones de teclas blancas
var whiteKeyPositions = [];

// Variable para trackear tecla seleccionada (toggled)
var selectedKey = 64; // 64 = E4 (nota por defecto)

// Calcular posiciones de teclas blancas
inline function calculateWhiteKeyPositions()
{
    local whiteIndex = 0;
    for (i = 0; i < numKeys; i++)
    {
        if (!isBlackKey(startNote + i))
        {
            whiteKeyPositions.push({
                note: startNote + i,
                x: whiteIndex * whiteKeyWidth
            });
            whiteIndex++;
        }
    }
}
calculateWhiteKeyPositions();

// Init en Bb del teclado y midi
selectedKey = 70;

// Paint routine para el teclado
inline function paintKeyboard(g)
{
    // Dibujar teclas blancas (con margen de 10px)
    for (i = 0; i < whiteKeyPositions.length; i++)
    {
        local x = whiteKeyPositions[i].x + 10;
        local note = whiteKeyPositions[i].note;
        local pitchClass = note % 12;
        

        // Color según si está seleccionada o no
        local keyColor = (note == selectedKey) ? 0xFF00A6C8 : 0xFF343638;
        g.setColour(keyColor);
        
        // E y F (pitch class 4 y 5) con esquinas superiores cuadradas
        if (pitchClass == 4 || pitchClass == 5)
        {
            // JSON object: solo redondear esquinas inferiores
            local corners = {"CornerSize": 3, "Rounded": [false, false, true, true]};
            g.fillRoundedRectangle([x, 10, whiteKeyWidth, whiteKeyHeight], corners);
        }
        else
        {
            // Rectángulo con todas las esquinas redondeadas
            g.fillRoundedRectangle([x, 10, whiteKeyWidth, whiteKeyHeight], 3);
        }
        
        // Borde
        g.setColour(0xFF1C1C1C);
        if (pitchClass == 4 || pitchClass == 5)
        {
            local corners = {"CornerSize": 3, "Rounded": [false, false, true, true]};
            g.drawRoundedRectangle([x, 10, whiteKeyWidth, whiteKeyHeight], corners, 2);
        }
        else
        {
            g.drawRoundedRectangle([x, 10, whiteKeyWidth, whiteKeyHeight], 3, 2);
        }
    }
    
    // Dibujar teclas negras encima (centradas entre teclas blancas, con margen de 10px)
    local blackKeyOffsets = [1.0, 2.0, 4.0, 5.0, 6.0]; // Posiciones relativas de teclas negras
    local blackNotes = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#
    
    for (i = 0; i < blackKeyOffsets.length; i++)
    {
        local x = blackKeyOffsets[i] * whiteKeyWidth - blackKeyWidth / 2 + 10;
        local note = startNote + blackNotes[i];
        
        // Esquinas superiores cuadradas, inferiores redondeadas
        local corners = {"CornerSize": 3, "Rounded": [false, false, true, true]};
        
        // Drop shadow difuminado (hacia abajo, 8px)
        // Simular blur con múltiples capas más sutiles
        g.setColour(0x04000000);
        g.fillRoundedRectangle([x, 18, blackKeyWidth, blackKeyHeight], corners);
        g.setColour(0x08000000);
        g.fillRoundedRectangle([x, 17, blackKeyWidth, blackKeyHeight], corners);
        g.setColour(0x0C000000);
        g.fillRoundedRectangle([x, 16, blackKeyWidth, blackKeyHeight], corners);
        g.setColour(0x10000000);
        g.fillRoundedRectangle([x, 15, blackKeyWidth, blackKeyHeight], corners);
        g.setColour(0x14000000);
        g.fillRoundedRectangle([x, 14, blackKeyWidth, blackKeyHeight], corners);
        g.setColour(0x18000000);
        g.fillRoundedRectangle([x, 13, blackKeyWidth, blackKeyHeight], corners);
        g.setColour(0x1C000000);
        g.fillRoundedRectangle([x, 12, blackKeyWidth, blackKeyHeight], corners);
        g.setColour(0x20000000);
        g.fillRoundedRectangle([x, 11, blackKeyWidth, blackKeyHeight], corners);
        
        // Color según si está seleccionada o no
        local keyColor = (note == selectedKey) ? 0xFF00A6C8 : 0xFF343638;
        g.setColour(keyColor);
        g.fillRoundedRectangle([x, 10, blackKeyWidth, blackKeyHeight], corners);
        
        // Borde
        g.setColour(0xFF1C1C1C);
        g.drawRoundedRectangle([x, 10, blackKeyWidth, blackKeyHeight], corners, 2);
    }
}

KeyboardPanel.setPaintRoutine(paintKeyboard);

// Mouse callback para detectar clicks
inline function onKeyboardMouse(event)
{
    if (event.clicked)
    {
        local x = event.x - 10; // Ajustar por margen
        local y = event.y - 10; // Ajustar por margen
        
        // Primero revisar teclas negras (están encima)
        if (y >= 0 && y < blackKeyHeight)
        {
            local blackKeyOffsets = [1.0, 2.0, 4.0, 5.0, 6.0];
            local blackNotes = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#
            
            for (i = 0; i < blackKeyOffsets.length; i++)
            {
                local bx = blackKeyOffsets[i] * whiteKeyWidth - blackKeyWidth / 2;
                if (x >= bx && x < bx + blackKeyWidth)
                {
                    local note = startNote + blackNotes[i];
                    toggleKey(note);
                    return;
                }
            }
        }
        
        // Si no es tecla negra, revisar teclas blancas
        if (y >= 0)
        {
            for (i = 0; i < whiteKeyPositions.length; i++)
            {
                local wx = whiteKeyPositions[i].x;
                if (x >= wx && x < wx + whiteKeyWidth)
                {
                    local note = whiteKeyPositions[i].note;
                    toggleKey(note);
                    return;
                }
            }
        }
    }
}

// Función para seleccionar tecla (sin toggle off)
inline function toggleKey(note)
{
    // Siempre seleccionar la tecla (se mantiene pintada aunque la toques varias veces)
    selectedKey = note;
    selectToneFromNote(note);
    
    // Repintar el panel
    KeyboardPanel.repaint();
}

KeyboardPanel.setMouseCallback(onKeyboardMouse);

// Función para seleccionar tonalidad desde nota
inline function selectToneFromNote(note)
{
    local pitchClass = note % 12;
    local tones = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    local selectedTone = tones[pitchClass];
    
    local tonesList = ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"];
    local toneIndex = tonesList.indexOf(selectedTone) + 1;
    
    if (toneIndex > 0)
    {
        TonesComboBox.setValue(toneIndex);
        TonesComboBox.changed();
        Console.print(">>> Key clicked → Tone: " + selectedTone);
    }
}

// =============================================================================
// MIDI VIEWER
// =============================================================================

// Paint routine para visualizar notas MIDI
inline function paintMidiViewer(g)
{
    g.fillAll(0x00000000); // Fondo transparente
    
    // Tiempo para efecto de latido (respiración)
    local currentTime = Engine.getUptime();
    
    // Margen para que el destello no se corte en los bordes
    local flashMargin = 27; // Tamaño máximo del destello
    
    local panelWidth = MidiViewer.getWidth();
    local panelHeight = MidiViewer.getHeight();
    
    local noteList = mp.getNoteRectangleList([0, 0, panelWidth, panelHeight]);
    
    if (mp.isEmpty() == 0 && noteList.length > 0)
    {
        // Encontrar rango de notas (min/max) para normalizar altura
        local minNote = 127;
        local maxNote = 0;
        
        for (note in noteList)
        {
            local noteNum = note[1];
            minNote = Math.min(minNote, noteNum);
            maxNote = Math.max(maxNote, noteNum);
        }
        
        local noteRange = Math.max(1, maxNote - minNote);
        local bottomMargin = panelHeight * 0.3; // Margen inferior del 30%
        local availableHeight = panelHeight - (flashMargin * 2) - bottomMargin; // Restar márgenes
        
        // Obtener posición de playback ajustada al margen
        local playbackPos = mp.getPlaybackPosition() * (panelWidth - flashMargin * 2) + flashMargin;
        
        // Dibujar cada nota
        for (note in noteList)
        {
            local originalY = note[1];
            local normalizedPos = (originalY - minNote) / noteRange;
            
            // Ajustar posición X para el margen horizontal
            local noteX = (note[0] / panelWidth) * (panelWidth - flashMargin * 2) + flashMargin;
            local noteWidth = (note[2] / panelWidth) * (panelWidth - flashMargin * 2);
            
            // DIÁMETRO = DURACIÓN (noteWidth) con límites
            local baseDiameter = Math.max(8, Math.min(60, noteWidth)); // Entre 8px y 60px
            
            // Notas graves (normalizedPos alto = abajo) son 50% del tamaño
            // normalizedPos: 0 = nota aguda (arriba), 1 = nota grave (abajo)
            local sizeScale = 1.0 - (normalizedPos * 0.5); // De 1.0 (agudas) a 0.5 (graves)
            local diameter = baseDiameter * sizeScale;
            local radius = diameter / 2;
            
            // Centro del círculo
            local centerX = noteX + radius; // Centro en el inicio + radio
            local centerY = normalizedPos * availableHeight + flashMargin + radius;
            
            // Color celeste para todas las notas
            local noteColor = 0xFF00ADF4; // Celeste #00adf4
            
            // Determinar si la nota está antes o después del playback
            local noteStart = noteX;
            local isPassed = noteStart < playbackPos;
            
            // Calcular destello: si la nota acaba de pasar, tiene un brillo extra
            // que se desvanece gradualmente (duración del destello: ~250px)
            local flashDistance = playbackPos - noteStart;
            local flashIntensity = 0.0;
            local flashRange = 250.0; // Distancia en píxeles para el destello (más tiempo)
            local bounceScale = 1.0; // Escala de rebote
            
            if (isPassed && flashDistance < flashRange)
            {
                // Destello se desvanece con curva exponencial más suave
                local normalized = flashDistance / flashRange;
                flashIntensity = Math.pow(1.0 - normalized, 2.5);
                
                // Efecto de rebote (bounce) exagerado como goma al dejar de sonar
                // Exactamente 2 rebotes completos
                local bounceFreq = 4.0; // Frecuencia del rebote (2 ciclos completos)
                local bounceAmount = 0.7; // Amplitud del rebote (70% del tamaño - muy exagerado)
                local bounceDecay = Math.pow(1.0 - normalized, 1.2); // Decay más lento
                bounceScale = 1.0 + Math.sin(normalized * bounceFreq * Math.PI) * bounceAmount * bounceDecay;
            }
            
            // Efecto de latido lento y flotación para notas que no están rebotando
            local breatheScale = 1.0;
            local floatOffsetX = 0.0;
            local floatOffsetY = 0.0;
            
            if (flashIntensity < 0.05) // Solo si no está en rebote
            {
                // Latido muy sutil y lento (2 segundos por ciclo)
                local breatheFreq = Math.PI; // Frecuencia baja
                local breatheAmount = 0.05; // 5% de variación (muy sutil)
                breatheScale = 1.0 + Math.sin(currentTime * breatheFreq) * breatheAmount;
                
                // Flotación mínima en X e Y (movimiento orgánico)
                // Usar diferentes frecuencias para X e Y para movimiento más natural
                local floatAmount = 2.0; // 2 píxeles de desplazamiento máximo
                floatOffsetX = Math.sin(currentTime * 0.7) * floatAmount; // Frecuencia diferente
                floatOffsetY = Math.cos(currentTime * 0.5) * floatAmount; // Aún más lenta
            }
            
            // Aplicar bounce scale (o breathe scale si no hay bounce) al radio
            local finalScale = bounceScale * breatheScale;
            local bouncedRadius = radius * finalScale;
            
            // HALO/AURA: Dibujar círculos concéntricos con alpha decreciente
            if (flashIntensity > 0.05)
            {
                // 8 capas de halo para un degradado más suave
                for (i = 8; i >= 1; i--)
                {
                    local expansion = (i / 8.0) * 27.0 * flashIntensity; // Crece hasta 27px
                    
                    // Degradado exponencial invertido: exterior casi invisible, interior brillante
                    // Las capas exteriores tienen alpha muy bajo, crece exponencialmente hacia el centro
                    local normalizedLayer = i / 8.0; // 1.0 en exterior, 0.125 en interior
                    local distanceFromCenter = 1.0 - normalizedLayer; // 0.0 en exterior, 0.875 en interior
                    
                    // Crecimiento exponencial del alpha (más sutil, exponente mayor)
                    local expFactor = Math.pow(distanceFromCenter, 2.2);
                    local haloAlpha = parseInt(flashIntensity * 0x60 * expFactor);
                    
                    local haloRadius = bouncedRadius + expansion;
                    local haloRect = [
                        centerX - haloRadius + floatOffsetX,
                        centerY - haloRadius + floatOffsetY,
                        haloRadius * 2,
                        haloRadius * 2
                    ];
                    
                    // Color del halo (usando el color de la nota)
                    local haloColor = (haloAlpha << 24) | (noteColor & 0x00FFFFFF);
                    g.setColour(haloColor);
                    g.fillEllipse(haloRect);
                }
            }
            
            // Círculo principal con color de la nota
            // Alpha depende de si autoplay está activo y si la nota ya fue tocada
            local alpha;
            if (isAutoplayActive) {
                // Con autoplay: notas invisibles hasta ser tocadas
                if (isPassed) {
                    alpha = 0xFF; // 100% opaco después de ser tocada
                } else {
                    alpha = 0x00; // Completamente invisible antes de ser tocada
                }
            } else {
                // Sin autoplay: siempre 100% opaco
                alpha = 0xFF;
            }
            local baseColor = (alpha << 24) | (noteColor & 0x00FFFFFF);
            
            // Durante el destello, mezclar con blanco de forma más sutil pero mantener el alpha constante
            if (flashIntensity > 0)
            {
                // Extraer componentes RGB del color de la nota
                local r = (noteColor >> 16) & 0xFF;
                local g_val = (noteColor >> 8) & 0xFF;
                local b = noteColor & 0xFF;
                
                // Mezclar con blanco según intensidad (factor 0.6 para más sutileza)
                r = r + parseInt((0xFF - r) * flashIntensity * 0.6);
                g_val = g_val + parseInt((0xFF - g_val) * flashIntensity * 0.6);
                b = b + parseInt((0xFF - b) * flashIntensity * 0.6);
                
                // Mantener el alpha constante (100%) incluso durante el flash
                baseColor = (alpha << 24) | (r << 16) | (g_val << 8) | b;
            }
            
            // Dibujar círculo principal con bounce/breathe y flotación
            local bouncedDiameter = diameter * finalScale;
            local bouncedRadiusForCenter = bouncedDiameter / 2;
            local noteCircle = [
                centerX - bouncedRadiusForCenter + floatOffsetX,
                centerY - bouncedRadiusForCenter + floatOffsetY,
                bouncedDiameter,
                bouncedDiameter
            ];
            
            g.setColour(baseColor);
            g.fillEllipse(noteCircle); // Círculo sólido
        }
    }
}

MidiViewer.setPaintRoutine(paintMidiViewer);

// Conectar MIDI Player al viewer
mp.connectToPanel(MidiViewer);
mp.setRepaintOnPositionChange(true);

// =============================================================================
// PANEL DE FONDO ANIMADO (Bolas celestes con OpenGL)
// =============================================================================

// =============================================================================
// BACKGROUND ANIMATED GRADIENT
// =============================================================================

const var backAniPanel = Content.getComponent("backAniPanel");

// Variable para animación del degradado
var gradientTime = 0.0;

// Paint routine para degradado animado celeste -> magenta
inline function paintBackgroundGradient(g)
{
    local panelWidth = backAniPanel.getWidth();
    local panelHeight = backAniPanel.getHeight();
    
    // Colores: Celeste #007AAB y Magenta #8600A3
    local celesteR = 0;
    local celesteG = 122;
    local celesteB = 171;
    
    local magentaR = 134;
    local magentaG = 0;
    local magentaB = 163;
    
    // Animación: oscila entre 0 y 1 para intercambiar los colores
    local breathe = (Math.sin(gradientTime * 1.5) + 1.0) * 0.5; // 0..1, respiración suave
    
    // Dibujar degradado HORIZONTAL que "respira" intercambiando celeste <-> magenta
    local steps = 100;
    for (i = 0; i < steps; i++)
    {
        local t = i / steps;
        
        // Efecto "vivo": los extremos intercambian colores
        // Cuando breathe=0: izquierda es celeste, derecha es magenta
        // Cuando breathe=1: izquierda es magenta, derecha es celeste
        local colorMix = t * (1.0 - breathe * 2.0) + breathe; // Fórmula mágica para intercambio
        colorMix = Math.min(1.0, Math.max(0.0, colorMix)); // Clamp 0..1
        
        // Efecto solarizado: más luminosidad en los bordes
        // Distancia al centro (0 en los bordes, 1 en el centro)
        local distanceToCenter = 1.0 - Math.abs(t * 2.0 - 1.0); // 0 en bordes, 1 en centro
        local edgeBrightness = 1.0 + (1.0 - distanceToCenter) * 0.6; // Más brillo en bordes
        
        // Interpolación de colores con luminosidad
        local red = (celesteR + (magentaR - celesteR) * colorMix) * edgeBrightness;
        local green = (celesteG + (magentaG - celesteG) * colorMix) * edgeBrightness;
        local blue = (celesteB + (magentaB - celesteB) * colorMix) * edgeBrightness;
        
        // Clamp valores RGB a 0-255 y convertir a entero
        red = parseInt(Math.min(255, Math.max(0, red)));
        green = parseInt(Math.min(255, Math.max(0, green)));
        blue = parseInt(Math.min(255, Math.max(0, blue)));
        
        // Convertir a color hex
        local color = 0xFF000000 | (red << 16) | (green << 8) | blue;
        
        g.setColour(color);
        
        // Dibujar franja VERTICAL (para gradiente horizontal)
        local x = parseInt(t * panelWidth);
        local width = Math.max(1, parseInt(panelWidth / steps) + 2);
        g.fillRect([x, 0, width, panelHeight]);
    }
}

backAniPanel.setPaintRoutine(paintBackgroundGradient);

// Timer para animar el degradado
const var gradientTimer = Engine.createTimerObject();
gradientTimer.setTimerCallback(function()
{
    gradientTime += 0.033; // Incrementar tiempo
    backAniPanel.repaint();
});
gradientTimer.startTimer(33); // ~30 FPS

// =============================================================================

// Variable para guardar el category actual 
var currentCategory = -1;

// =============================================================================
// HISTORIAL DE GENERACIONES
// =============================================================================

var midiHistory = []; // Array para almacenar hasta 10 generaciones
var historyIndex = -1; // Índice actual en el historial (-1 = no hay historial)
const var MAX_HISTORY = 10;

// Función para actualizar estado de botones de navegación
inline function updateNavigationButtons()
{
    // RevGenerated se activa si hay elementos anteriores
    Content.setPropertiesFromJSON("RevGenerated", {"enabled": historyIndex > 0});
    
    // FwdGenerated se activa si hay elementos siguientes
    Content.setPropertiesFromJSON("FwdGenerated", {"enabled": historyIndex < midiHistory.length - 1});
}

// Función para agregar una generación al historial
inline function addToHistory(midiData)
{
    // Si estamos en medio del historial (no al final), eliminar todo lo que está adelante
    if (historyIndex < midiHistory.length - 1)
    {
        local newHistory = [];
        local i;
        for (i = 0; i <= historyIndex; i++)
        {
            newHistory.push(midiHistory[i]);
        }
        midiHistory = newHistory;
    }
    
    // Agregar nueva generación
    midiHistory.push(midiData);
    
    // Si hay al menos 2 generaciones, hacer visibles los botones (para navegar)
    if (midiHistory.length >= 3)
    {
        RevGenerated.showControl(true);
        FwdGenerated.showControl(true);
    }
    
    // Si excede el máximo, eliminar la más antigua
    if (midiHistory.length > MAX_HISTORY)
    {
        midiHistory.remove(0);
    }
    
    // Posicionarse al final del historial
    historyIndex = midiHistory.length - 1;
    
    // Actualizar estado de botones
    updateNavigationButtons();
    
    Console.print(">>> History: " + (historyIndex + 1) + "/" + midiHistory.length);
}

// Función para cargar un MIDI del historial
inline function loadFromHistory(index)
{
    if (index < 0 || index >= midiHistory.length)
        return;
    
    local midiData = midiHistory[index];
    
    // Cargar MIDI
    mp.setFile(midiData.filePath, true, true);
    
    // Limpiar MIDI original guardado (para DoubleLengthButton)
    originalMidiEvents = [];
    
    // Aplicar todas las transformaciones guardadas
    applyTransposition(midiData.semitones);
    applyQuantization(midiData.quantizeValue, midiData.swing);
    
    if (midiData.velocityMultiplier != 1.0)
    {
        applyVelocityModification(midiData.velocityMultiplier);
    }
    
    // Si DoubleLengthButton está activado, estirar el MIDI recién cargado
    if (DoubleLengthButton.getValue() == 1)
    {
        doubleBarLength();
    }
    
    // Actualizar visualizador
    MidiViewer.repaint();
    
    // Log
    Console.print(">>> Loaded from history [" + (index + 1) + "/" + midiHistory.length + "]: " + midiData.name);
}

// Callback para botón Rev (retroceder)
inline function onRevGeneratedControl(component, value)
{
    // Solo funciona si hay historial disponible
    if (midiHistory.length == 0 || historyIndex <= 0)
        return;
    
    historyIndex--;
    loadFromHistory(historyIndex);
    updateNavigationButtons();
}

// Callback para botón Fwd (avanzar)
inline function onFwdGeneratedControl(component, value)
{
    // Solo funciona si hay historial disponible
    if (midiHistory.length == 0 || historyIndex >= midiHistory.length - 1)
        return;
    
    historyIndex++;
    loadFromHistory(historyIndex);
    updateNavigationButtons();
}

RevGenerated.setControlCallback(onRevGeneratedControl);
FwdGenerated.setControlCallback(onFwdGeneratedControl);

// =============================================================================
// DUPLICAR LONGITUD DEL COMPÁS (TIME STRETCH 2X)
// =============================================================================

const var DoubleLengthButton = Content.getComponent("DoubleLengthButton");
const var AlternateBarButton = Content.getComponent("AlternateBarButton");

// Variable para guardar el MIDI original
var originalMidiEvents = [];

// Variable para trackear si el próximo compás debe tener notas (para alternado)
var nextBarHasNotes = true;

// Duplica el largo del compás (time stretch 2x)
inline function doubleBarLength()
{
    // Extraer eventos de la secuencia 1 (one-based)
    local midiEvents = mp.getEventListFromSequence(1);
    
    if (typeof midiEvents == "undefined" || midiEvents.length == 0)
    {
        Console.print(">>> No hay eventos MIDI para procesar");
        return false;
    }
    
    // Guardar copia del MIDI original antes de modificar
    originalMidiEvents = [];
    local i;
    for (i = 0; i < midiEvents.length; i++)
    {
        originalMidiEvents.push(midiEvents[i].clone());
    }
    
    Console.print(">>> Eventos antes de duplicar: " + midiEvents.length);
    
    // Multiplicar el timestamp de todos los eventos por 2
    for (i = 0; i < midiEvents.length; i++)
    {
        local currentTimestamp = midiEvents[i].getTimestamp();
        midiEvents[i].setTimestamp(currentTimestamp * 2.0);
    }
    
    // Limpiar secuencias existentes y crear una nueva de 2 compases (4/4)
    mp.clearAllSequences();
    mp.create(4, 4, 2);
    
    // Escribir eventos estirados en la nueva secuencia
    mp.flushMessageListToSequence(midiEvents, 1);
    
    Console.print(">>> MIDI estirado 2x (2 compases de 4/4)");
    MidiViewer.repaint();
    
    return true;
}

// Crea patrón alternado: 1 compás con notas, 1 compás vacío
inline function createAlternateBarPattern()
{
    // Extraer eventos de la secuencia actual (1 compás)
    local midiEvents = mp.getEventListFromSequence(1);
    
    if (typeof midiEvents == "undefined" || midiEvents.length == 0)
    {
        Console.print(">>> No hay eventos MIDI para crear patrón alternado");
        return false;
    }
    
    // Guardar copia del MIDI original
    originalMidiEvents = [];
    local i;
    for (i = 0; i < midiEvents.length; i++)
    {
        originalMidiEvents.push(midiEvents[i].clone());
    }
    
    Console.print(">>> Creando patrón alternado (bar ON / bar OFF)");
    
    // Decidir si este ciclo tiene notas o está vacío
    if (nextBarHasNotes)
    {
        // Compás CON notas: crear 1 compás con las notas
        mp.clearAllSequences();
        mp.create(4, 4, 1);
        
        // Escribir eventos (timestamps ya están correctos para 1 compás)
        mp.flushMessageListToSequence(midiEvents, 1);
        Console.print(">>> Compás CON NOTAS (alternado)");
    }
    else
    {
        // Compás VACÍO: crear 1 compás sin notas
        mp.clearAllSequences();
        mp.create(4, 4, 1);
        // No escribimos eventos, queda vacío
        Console.print(">>> Compás VACÍO - SILENCIO (alternado)");
    }
    
    // Alternar para el próximo generate
    nextBarHasNotes = !nextBarHasNotes;
    
    MidiViewer.repaint();
    return true;
}

// Restaura el MIDI original
inline function restoreOriginalMidi()
{
    if (originalMidiEvents.length == 0)
    {
        Console.print(">>> No hay MIDI original guardado");
        return false;
    }
    
    // Limpiar secuencias y crear una de 1 compás (4/4)
    mp.clearAllSequences();
    mp.create(4, 4, 1);
    
    // Escribir eventos originales
    mp.flushMessageListToSequence(originalMidiEvents, 1);
    
    Console.print(">>> MIDI original restaurado (1 compás)");
    MidiViewer.repaint();
    
    return true;
}

// Callback para el botón de duplicar duración
inline function onDoubleLengthControl(component, value)
{
    if (value == 1)
    {
        doubleBarLength();
    }
    else
    {
        restoreOriginalMidi();
    }
}

DoubleLengthButton.setControlCallback(onDoubleLengthControl);

// Callback para el botón de patrón alternado (bar on/off)
inline function onAlternateBarControl(component, value)
{
    if (value == 1)
    {
        Console.print(">>> Modo ALTERNADO activado (bar on/off)");
        nextBarHasNotes = true; // Resetear: próximo generate tendrá notas
    }
    else
    {
        Console.print(">>> Modo ALTERNADO desactivado");
        nextBarHasNotes = true; // Resetear
    }
}

AlternateBarButton.setControlCallback(onAlternateBarControl);

// More Button callback - abre sampleson.com
inline function onMoreButtonControl(component, value)
{
    if (value == 1)
    {
        Engine.openWebsite("https://sampleson.com");
        moreButton.setValue(0);
        moreButton.changed();
    }
}

moreButton.setControlCallback(onMoreButtonControl);

// Autoplay Button callback
inline function onAutoplayButtonControl(component, value)
{
    isAutoplayActive = value == 1;
    
    if (isAutoplayActive)
    {
        Console.print(">>> Autoplay ACTIVADO - Generará en cada loop del MidiPlayer");
        previousPlaybackPos = 0.0; // Reset para detectar primer loop
        autoplayDebounce = false; // Reset debounce
    }
    else
    {
        Console.print(">>> Autoplay DESACTIVADO");
        autoplayDebounce = false; // Reset debounce
    }
}

AutoplayButton.setControlCallback(onAutoplayButtonControl);

// Inicializar botones como desactivados (no hay historial al inicio)
updateNavigationButtons();


// Índice de MIDIs ya cargado desde midiIndex.js (include arriba)
Console.print("=== ÍNDICE DE MIDIS CARGADO ===");
Console.print("Archivos MIDI en índice: " + midiIndex.length);

// BPM callback movido más abajo (unificado con updateTempoLabel)


// Parseo desde índice (ya viene parseado)
inline function parseMidiFromIndex(indexEntry)
{
    return {
        type: indexEntry.type,
        id: parseInt(indexEntry.midi_id),
        category: parseInt(indexEntry.category),
        tone: indexEntry.tone,
        mode: indexEntry.mode,
        density: indexEntry.density,
        file: indexEntry.file  // Nombre del archivo .dat (legacy)
    };
}

// Construir nombre de archivo MIDI original desde metadata
inline function buildMidiFileName(midiData)
{
    return midiData.type + "_" + midiData.id + "_" + midiData.category + "_" + midiData.tone + "_" + midiData.mode + "_" + midiData.density + "_full.mid";
}

// Construir path usando wildcard de HISE (funciona en desarrollo y compilado)
inline function getMidiFilePath(midiData)
{
    local fileName = buildMidiFileName(midiData);
    // Usar el mismo formato que getMidiFileList() devuelve
    return "{PROJECT_FOLDER}" + fileName;
}

// NO parseamos todo al inicio - se hace lazy cuando se necesita



// Mapear nombres de display a valores internos
inline function mapTypeToInternal(displayName)
{
    if (displayName == "Creative") return "base";
    if (displayName == "Flat 5th") return "b5";
    if (displayName == "Major 7") return "M7";
    if (displayName == "Pentatonic") return "penta";
    return displayName; // Por si acaso
}

inline function mapModeToInternal(displayName)
{
    if (displayName == "Major") return "ionian";
    if (displayName == "Minor") return "dorian";
    if (displayName == "Dominant") return "mixololydian"; // Typo en los datos: mixololydian
    return displayName; // Por si acaso
}

inline function mapDensityToInternal(displayName)
{
    if (displayName == "Sparse") return "low";
    if (displayName == "Medium") return "medium";
    if (displayName == "Dense") return "high";
    return displayName; // Por si acaso
}

inline function mapVelocityToValue(displayName)
{
    if (displayName == "Subtle Velocity") return 0.8;
    if (displayName == "Mid Velocity") return 1.4;
    if (displayName == "Hard Velocity") return 1.8;
    return 1.0; // Default
}

// Poblar ComboBoxes con valores hardcodeados
inline function initComboBoxes()
{
    // Types hardcodeados con nombres más descriptivos
    TypesComboBox.set("items", "Creative\nFlat 5th\nMajor 7\nPentatonic");
    
    // Modes hardcodeados con nombres más descriptivos
    ModesComboBox.set("items", "Major\nMinor\nDominant");
    
    // Densities hardcodeados con nombres más descriptivos
    DensityComboBox.set("items", "Sparse\nMedium\nDense");
    
    // Todas las tonalidades (originales en E)
    TonesComboBox.set("items", "E\nF\nF#\nG\nG#\nA\nA#\nB\nC\nC#\nD\nD#");
    
    // Opciones de cuantización
    QuantizeComboBox.set("items", "Straight\nSwing");
    
    // Opciones de velocity
    VelocityComboBox.set("items", "Subtle Velocity\nMid Velocity\nHard Velocity");
    
    Console.print("=== COMBOBOXES INICIALIZADOS ===");
    Console.print("Total MIDIs disponibles: " + midiIndex.length);
}
initComboBoxes();




// Filtra archivos MIDI por tags específicos (LAZY - parsea on-demand)
inline function filterMidiFiles(type, category, tone, mode, density)
{
    local filtered = [];
    
    for (i = 0; i < midiIndex.length; i++)
    {
        local indexEntry = midiIndex[i];
        local match = true;
        
        // Si se especifica type, debe coincidir
        if (type != "" && indexEntry.type != type)
            match = false;
            
        // Si se especifica category, debe coincidir
        if (category >= 0 && parseInt(indexEntry.category) != category)
            match = false;
            
        // Si se especifica tone, debe coincidir
        if (tone != "" && indexEntry.tone != tone)
            match = false;
            
        // Si se especifica mode, debe coincidir
        if (mode != "" && indexEntry.mode != mode)
            match = false;
            
        // Si se especifica density, debe coincidir
        if (density != "" && indexEntry.density != density)
            match = false;
            
        if (match)
            filtered.push(parseMidiFromIndex(indexEntry)); // Parsea solo si coincide
    }
    
    return filtered;
}


// Modifica velocities del MIDI Player
inline function applyVelocityModification(velocityMultiplier)
{
    // Extraer eventos de la secuencia 1 (one-based)
    local midiEvents = mp.getEventListFromSequence(1);
    
    if (typeof midiEvents == "undefined" || midiEvents.length == 0)
        return false;
    
    // Modificar velocities
    for (i = 0; i < midiEvents.length; i++)
    {
        if (midiEvents[i].isNoteOn())
        {
            local newVel = Math.min(127, Math.round(midiEvents[i].getVelocity() * velocityMultiplier));
            midiEvents[i].setVelocity(newVel);
        }
    }
    
    // Escribir eventos modificados de vuelta
    mp.flushMessageListToSequence(midiEvents, 1);
    
    return true;
}


// Calcula semitonos de transposición desde E (E es el centro)
inline function getTranspositionFromE(targetTone)
{
    local toneMap = {
        "E": 0,
        "F": 1,
        "F#": 2,
        "Gb": 2,
        "G": 3,
        "G#": 4,
        "Ab": 4,
        "A": 5,
        "A#": 6,
        "Bb": 6,
        "B": 7,
        "C": -4,
        "C#": -3,
        "Db": -3,
        "D": -2,
        "D#": -1,
        "Eb": -1
    };
    
    if (typeof toneMap[targetTone] != "undefined")
        return toneMap[targetTone];
    
    return 0;
}


// Transpone notas del MIDI Player
inline function applyTransposition(semitones)
{
    if (semitones == 0)
        return true;
    
    // Extraer eventos de la secuencia 1 (one-based)
    local midiEvents = mp.getEventListFromSequence(1);
    
    if (typeof midiEvents == "undefined" || midiEvents.length == 0)
        return false;
    
    // Transponer notas
    for (i = 0; i < midiEvents.length; i++)
    {
        if (midiEvents[i].isNoteOn() || midiEvents[i].isNoteOff())
        {
            local originalNote = midiEvents[i].getNoteNumber();
            local transposedNote = Math.max(0, Math.min(127, originalNote + semitones));
            midiEvents[i].setNoteNumber(transposedNote);
        }
    }
    
    // Escribir eventos modificados de vuelta
    mp.flushMessageListToSequence(midiEvents, 1);
    
    return true;
}


// Parsea la cuantización y retorna [gridSize, swingAmount]
inline function parseQuantization(quantizeText)
{
    if (quantizeText == "Straight") return [0.25, 0];      // 1/16
    if (quantizeText == "Swing") return [0.25, 0.66];      // 1/16 Swing 66%
    return [0.25, 0]; // Default: Straight
}


// Cuantiza eventos con swing y humanización, preservando duraciones mínimas
inline function applyQuantization(gridSize, swingAmount)
{
    // gridSize: tamaño del grid en quarter beats, 0 = Off
    // swingAmount: 0.5 = straight, 0.66 = tresillo, etc.
    
    if (gridSize == 0)
        return true; // Sin cuantización
    
    local midiEvents = mp.getEventListFromSequence(1);
    
    if (typeof midiEvents == "undefined" || midiEvents.length == 0)
        return false;
    
    // Duración mínima para ghost notes (20ms)
    local minDuration = Engine.getSamplesForMilliSeconds(50);
    
    // Humanización: ±5ms
    local humanizationMs = 10;
    
    // Guardar Note On cuantizados por nota
    local noteOnTimestamps = [];
    for (i = 0; i < 128; i++)
        noteOnTimestamps[i] = -1;
    
    for (i = 0; i < midiEvents.length; i++)
    {
        local note = midiEvents[i].getNoteNumber();
        local timestamp = midiEvents[i].getTimestamp();
        
        // Convertir a quarter beats
        local quarterBeats = Engine.getQuarterBeatsForSamples(timestamp);
        
        // Cuantizar
        local gridIndex = Math.round(quarterBeats / gridSize);
        local quantizedBeats = gridIndex * gridSize;
        
        // Aplicar swing SOLO a Note On en off-beats (índices impares)
        if (midiEvents[i].isNoteOn() && swingAmount > 0 && gridIndex % 2 == 1)
        {
            local swingOffset = (swingAmount - 0.5) * gridSize;
            quantizedBeats += swingOffset;
        }
        
        // Convertir de vuelta a samples
        local quantizedTimestamp = Engine.getSamplesForQuarterBeats(quantizedBeats);
        
        // Guardar Note On o ajustar Note Off
        if (midiEvents[i].isNoteOn())
        {
            // Humanización: agregar offset aleatorio ±5ms
            local humanOffset = (Math.random() * 2 - 1) * humanizationMs; // rango [-5, 5] ms
            local humanOffsetSamples = Engine.getSamplesForMilliSeconds(humanOffset);
            local humanizedTimestamp = Math.max(0, quantizedTimestamp + humanOffsetSamples);
            
            noteOnTimestamps[note] = humanizedTimestamp;
            midiEvents[i].setTimestamp(humanizedTimestamp);
        }
        else if (midiEvents[i].isNoteOff())
        {
            // Si hay Note On previo, forzar duración mínima
            if (noteOnTimestamps[note] >= 0)
            {
                local offTimestamp = quantizedTimestamp;
                
                // Si Note Off cae antes o muy cerca del Note On, moverlo adelante
                if (offTimestamp <= noteOnTimestamps[note] + minDuration)
                {
                    offTimestamp = noteOnTimestamps[note] + minDuration;
                }
                
                midiEvents[i].setTimestamp(offTimestamp);
                noteOnTimestamps[note] = -1; // Reset
            }
            else
            {
                midiEvents[i].setTimestamp(quantizedTimestamp);
            }
        }
        else
        {
            midiEvents[i].setTimestamp(quantizedTimestamp);
        }
    }
    
    mp.flushMessageListToSequence(midiEvents, 1);
    
    return true;
}




inline function onGenerateControl(component, value)
{
    // Obtiene los valores seleccionados de cada ComboBox
    local selectedType = TypesComboBox.getItemText();
    local selectedTone = TonesComboBox.getItemText();
    local selectedMode = ModesComboBox.getItemText();
    local selectedDensity = DensityComboBox.getItemText();
    
    // Mapear los valores de display a valores internos
    local internalType = mapTypeToInternal(selectedType);
    local internalMode = mapModeToInternal(selectedMode);
    local internalDensity = mapDensityToInternal(selectedDensity);
    
    Console.print("=== FILTRO ===");
    Console.print("Type: " + selectedType + " -> " + internalType);
    Console.print("Tone: " + selectedTone);
    Console.print("Mode: " + selectedMode + " -> " + internalMode);
    Console.print("Density: " + selectedDensity + " -> " + internalDensity);
    
    // Filtra con los valores seleccionados (siempre busca en E, el tone original)
    local filtered = filterMidiFiles(internalType, -1, "E", internalMode, internalDensity);
    
    Console.print("Filtrados: " + filtered.length + " archivos");
    
    // Si hay archivos, carga uno random
    if (filtered.length > 0)
    {
        local randomFile = filtered[Math.randInt(0, filtered.length)];
        
        // Guardar el category actual
        currentCategory = randomFile.category;
        
        // Construir path usando MidiFiles/
        local midiPath = getMidiFilePath(randomFile);
        
        // Cargar MIDI desde pool
        mp.setFile(midiPath, true, true);
        
        // Limpiar MIDI original guardado (para DoubleLengthButton)
        originalMidiEvents = [];
        
        // Aplicar transposición según tone seleccionado
        local semitones = getTranspositionFromE(selectedTone);
        applyTransposition(semitones);
        
        // Aplicar cuantización con swing si está seleccionada
        local quantizeText = QuantizeComboBox.getItemText();
        local quantizeParams = parseQuantization(quantizeText);
        applyQuantization(quantizeParams[0], quantizeParams[1]);
        
        // Obtener valor de velocity del combo
        local velocityText = VelocityComboBox.getItemText();
        local velocityMultiplier = mapVelocityToValue(velocityText);
        
        // Si el multiplier no es 1.0, modificar velocities
        if (velocityMultiplier != 1.0)
        {
            applyVelocityModification(velocityMultiplier);
        }
        
        // Si DoubleLengthButton está activado, estirar el MIDI recién cargado
        if (DoubleLengthButton.getValue() == 1 && AlternateBarButton.getValue() == 0)
        {
            // Solo double length si NO está alternado
            doubleBarLength();
        }
        
        // Si AlternateBarButton está activado, crear patrón alternado (bar on/off)
        if (AlternateBarButton.getValue() == 1)
        {
            createAlternateBarPattern();
        }
        
        
        // Log
        local fileName = buildMidiFileName(randomFile);
        local logMsg = ">>> Loaded: " + fileName;
        if (semitones != 0)
            logMsg += " | Transpose: " + semitones + " (" + selectedTone + ")";
        if (quantizeParams[0] != 0)
            logMsg += " | Quantize: " + quantizeText;
        if (velocityMultiplier != 1.0)
            logMsg += " | Vel: " + velocityMultiplier;
        Console.print(logMsg);
        
        // Agregar al historial
        addToHistory({
            "filePath": midiPath,
            "name": randomFile.type + "_" + randomFile.id,
            "semitones": semitones,
            "quantizeValue": quantizeParams[0],
            "swing": quantizeParams[1],
            "velocityMultiplier": velocityMultiplier
        });
        
        // Actualizar visualizador MIDI
        MidiViewer.repaint();
        
        // Guardar tono generado para autoplay
        lastGeneratedTone = selectedTone;
    }
}

GenerateButton.setControlCallback(onGenerateControl);


inline function onGenerateSameClusterControl(component, value)
{
    // Verificar que hay un category válido
    if (currentCategory < 0)
    {
        Console.print(">>> Error: No hay cluster activo. Genera primero un MIDI.");
        return;
    }
    
    // Obtener los valores seleccionados de cada ComboBox (igual que Generate)
    local selectedType = TypesComboBox.getItemText();
    local selectedTone = TonesComboBox.getItemText();
    local selectedMode = ModesComboBox.getItemText();
    local selectedDensity = DensityComboBox.getItemText();
    
    // Mapear los valores de display a valores internos
    local internalType = mapTypeToInternal(selectedType);
    local internalMode = mapModeToInternal(selectedMode);
    local internalDensity = mapDensityToInternal(selectedDensity);
    
    Console.print("=== GENERAR DESDE MISMO CLUSTER ===");
    Console.print("Cluster: " + currentCategory);
    Console.print("Type: " + selectedType + " -> " + internalType);
    Console.print("Tone: " + selectedTone);
    Console.print("Mode: " + selectedMode + " -> " + internalMode);
    Console.print("Density: " + selectedDensity + " -> " + internalDensity);
    
    // Filtrar por category Y por type, mode, density (como Generate)
    local filtered = filterMidiFiles(internalType, currentCategory, "E", internalMode, internalDensity);
    
    Console.print("Filtrados en cluster: " + filtered.length + " archivos");
    
    // Si hay archivos, carga uno random
    if (filtered.length > 0)
    {
        local randomFile = filtered[Math.randInt(0, filtered.length)];
        
        // Actualizar el category (debería ser el mismo)
        currentCategory = randomFile.category;
        
        // Construir path usando MidiFiles/
        local midiPath = getMidiFilePath(randomFile);
        
        // Cargar MIDI desde pool
        mp.setFile(midiPath, true, true);
        
        // Limpiar MIDI original guardado (para DoubleLengthButton)
        originalMidiEvents = [];
        
        // Aplicar transposición según tone seleccionado
        local semitones = getTranspositionFromE(selectedTone);
        applyTransposition(semitones);
        
        // Aplicar cuantización con swing si está seleccionada
        local quantizeText = QuantizeComboBox.getItemText();
        local quantizeParams = parseQuantization(quantizeText);
        applyQuantization(quantizeParams[0], quantizeParams[1]);
        
        // Obtener valor de velocity del combo
        local velocityText = VelocityComboBox.getItemText();
        local velocityMultiplier = mapVelocityToValue(velocityText);
        
        // Si el multiplier no es 1.0, modificar velocities
        if (velocityMultiplier != 1.0)
        {
            applyVelocityModification(velocityMultiplier);
        }
        
        // Si DoubleLengthButton está activado, estirar el MIDI recién cargado
        if (DoubleLengthButton.getValue() == 1 && AlternateBarButton.getValue() == 0)
        {
            // Solo double length si NO está alternado
            doubleBarLength();
        }
        
        // Si AlternateBarButton está activado, crear patrón alternado (bar on/off)
        if (AlternateBarButton.getValue() == 1)
        {
            createAlternateBarPattern();
        }
        
        
        // Log
        local fileName = buildMidiFileName(randomFile);
        local logMsg = ">>> Loaded (Same Cluster): " + fileName;
        if (semitones != 0)
            logMsg += " | Transpose: " + semitones + " (" + selectedTone + ")";
        if (quantizeParams[0] != 0)
            logMsg += " | Quantize: " + quantizeText;
        if (velocityMultiplier != 1.0)
            logMsg += " | Vel: " + velocityMultiplier;
        Console.print(logMsg);
        
        // Agregar al historial
        addToHistory({
            "filePath": midiPath,
            "name": randomFile.type + "_" + randomFile.id,
            "semitones": semitones,
            "quantizeValue": quantizeParams[0],
            "swing": quantizeParams[1],
            "velocityMultiplier": velocityMultiplier
        });
        
        // Actualizar visualizador MIDI
        MidiViewer.repaint();
        
        // Guardar tono generado para autoplay
        lastGeneratedTone = selectedTone;
    }
}

GenerateSameClusterButton.setControlCallback(onGenerateSameClusterControl);


inline function onPlayControl(component, value)
{
	// Si Sync está activado, el DAW controla el playback
	// Solo permitir control manual si Sync está OFF
	if (SyncButton.getValue() == 0)
	{
		if (value){
			mp.play(0);
			autoplayDebounce = false; // Reset debounce al iniciar playback
		} else {
			mp.stop(0);
			autoplayDebounce = false; // Reset debounce al detener playback
		}
	}
	else
	{
		// Si Sync está ON, restaurar el estado actual del DAW
		// (esto evita que el usuario desincronice manualmente)
		component.setValue(mp.getPlayState() > 0 ? 1 : 0);
	}
};

PlayButton.setControlCallback(onPlayControl);

// Función para actualizar el TempoLabel
inline function updateTempoLabel()
{
	local bpmValue = BpmKnob.getValue();
	
	if (bpmValue == -1)
	{
		TempoLabel.set("text", "Synced");
	}
	else
	{
		TempoLabel.set("text", Math.round(bpmValue) + " BPM");
	}
}

// Callback para SyncButton
inline function onSyncButtonControl(component, value)
{
	if (value == 1)
	{
		// Guardar el valor actual antes de sincronizar
		previousBpm = BpmKnob.getValue();
		
		// PRIMERO: Setear Engine BPM a -1 para seguir automáticamente al host
		Engine.setHostBpm(-1);
		
		// SEGUNDO: Habilitar sincronización con master clock de HISE
		TransportHandler.setEnableGrid(true, 4); // Grid de 1/16 (4 = cuarto de beat)
		TransportHandler.setSyncMode(1); // Modo 1 = Prefer External (permite callbacks)
		
		// TERCERO: Cambiar BpmKnob a modo Sync (-1)
		BpmKnob.setValue(-1);
		BpmKnob.changed();
		
		// CUARTO: Sincronizar MIDI Player con master clock
		mp.setSyncToMasterClock(true);
		
		// QUINTO: Actualizar label
		updateTempoLabel();
		
		Console.print(">>> Sync activado - siguiendo DAW automáticamente");
	}
	else
	{
		// Detener playback antes de desincronizar
		mp.stop(0);
		
		// Desactivar sincronización con master clock
		mp.setSyncToMasterClock(false);
		TransportHandler.setSyncMode(0); // Modo 0 = Prefer Internal
		TransportHandler.setEnableGrid(false, 4);
		
		// Restaurar el valor anterior
		BpmKnob.setValue(previousBpm);
		BpmKnob.changed();
		Engine.setHostBpm(previousBpm);
		
		updateTempoLabel();
		
		Console.print(">>> Sync desactivado - modo manual");
	}
}

SyncButton.setControlCallback(onSyncButtonControl);

// Callback para BpmKnob
inline function onBpmKnobControl(component, value)
{
	Engine.setHostBpm(value);
	updateTempoLabel();
}

BpmKnob.setControlCallback(onBpmKnobControl);

// Callback para sincronización con DAW (Transport Handler)
// MODO ASÍNCRONO (false) - no requiere inline function
TransportHandler.setOnTransportChange(false, function(isPlaying)
{
	// Actualizar variable global de estado del DAW
	isDawPlaying = isPlaying;
	
	Console.print(">>> [setOnTransportChange] DAW " + (isPlaying ? "PLAY" : "STOP") + " - Sync=" + SyncButton.getValue());
	
	// Reset debounce al cambiar estado de playback
	autoplayDebounce = false;
	
	// Solo actualizar UI si el botón Sync está activado
	if (SyncButton.getValue() == 1)
	{
		// Actualizar el estado del botón Play en la UI
		PlayButton.setValue(isPlaying ? 1 : 0);
		
		if (isPlaying)
		{
			// Cuando el DAW hace PLAY, reiniciar MidiPlayer desde el inicio
			mp.stop(0);
			mp.play(0);
			Console.print(">>> MidiPlayer reiniciado desde compás 1");
		}
		else
		{
			// Cuando el DAW hace STOP
			mp.stop(0);
		}
	}
});

// Callback para sincronización de tempo/BPM con DAW
// Con Engine.setHostBpm(-1), HISE sigue automáticamente el tempo del host
TransportHandler.setOnTempoChange(false, function(newTempo)
{
	// Log para debug
	Console.print(">>> Tempo del DAW: " + Math.round(newTempo) + " BPM");
});

// Callback para detectar cambios de posición (beat/bar) y reconfirmar sincronización
// Se ejecuta en cada beat cuando el DAW está en play
TransportHandler.setOnGridChange(false, function(gridIndex)
{
	// Solo reconfirmar si Sync está activado
	if (SyncButton.getValue() == 1)
	{
		// Reconfirmar sincronización en cada compás (cada 4 beats)
		// gridIndex % 4 == 0 significa inicio de compás
		if (gridIndex % 4 == 0)
		{
			// Si el DAW está en play pero el MidiPlayer no, reiniciarlo
			if (isDawPlaying && mp.getPlayState() <= 0)
			{
				mp.play(0);
				Console.print(">>> Sync reconfirmado en compás " + (gridIndex / 4));
			}
		}
	}
});

// Inicializar botones de navegación como ocultos (hasta la primera generación)
// Se hace al final para asegurar que el UI esté completamente inicializado
RevGenerated.showControl(false);
FwdGenerated.showControl(false);

// Inicializar BPM en 84 - usar timer para evitar bloqueo en onInit
BpmKnob.setValue(84);

// Timer de una sola ejecución para setear BPM después de la inicialización
const var bpmInitTimer = Engine.createTimerObject();
bpmInitTimer.setTimerCallback(function()
{
    Engine.setHostBpm(84);
    Console.print("BPM seteado a: " + Engine.getHostBpm());
    this.stopTimer();
});
bpmInitTimer.startTimer(50); // 50ms después de inicializar

// Timer para detectar cambios de tono durante playback y autoplay
const var autoplayTimer = Engine.createTimerObject();
autoplayTimer.setTimerCallback(function()
{
    // Usar posición del MidiPlayer (0.0 a 1.0)
    var playbackPos = mp.getPlaybackPosition();
    
    // Resetear debounce cuando pasamos la mitad del compás (permite próximo disparo)
    if (playbackPos > 0.5)
    {
        autoplayDebounce = false;
    }
    
    // Detectar loop restart SOLO al inicio del compás (< 5% del compás)
    // Y solo si no se ha disparado ya en este loop (debounce)
    if (playbackPos < 0.05 && !autoplayDebounce)
    {
        var currentTone = TonesComboBox.getItemText();
        
        if (isAutoplayActive)
        {
            // Autoplay activo: SIEMPRE generar nuevo MIDI (respetando el tono actual)
            Console.print(">>> Autoplay: Loop restart - Generando nuevo MIDI en " + currentTone);
            onGenerateControl(GenerateButton, 1);
            lastGeneratedTone = currentTone;
            autoplayDebounce = true; // Evitar múltiples disparos
        }
        else if (currentTone != lastGeneratedTone)
        {
            // Sin autoplay pero cambió el tono: solo transponer MIDI actual
            Console.print(">>> Tono cambió de " + lastGeneratedTone + " a " + currentTone + " - Transponiendo");
            
            // Calcular diferencia de semitonos entre tonos
            var semitonesFrom = getTranspositionFromE(lastGeneratedTone);
            var semitonesTo = getTranspositionFromE(currentTone);
            var semitonesDiff = semitonesTo - semitonesFrom;
            
            // Aplicar transposición relativa
            applyTransposition(semitonesDiff);
            
            // Actualizar tono guardado
            lastGeneratedTone = currentTone;
            autoplayDebounce = true; // Evitar múltiples disparos
        }
    }
    
    // Guardar posición para próxima iteración
    previousPlaybackPos = playbackPos;
});

autoplayTimer.startTimer(50); // Chequea cada 50ms para mayor precisión


function onNoteOn()
{
	// Solo procesar notas MIDI reales (no las generadas por MidiPlayer)
	if (Message.isArtificial())
		return;
	
	//Message.setChannel(2);
	
	// Capturar nota MIDI entrante para root note SOLO si está en octava C2-B2 (36-47)
	local incomingNote = Message.getNoteNumber();
	
	// Filtrar por rango C2 (36) a B2 (47)
	if (incomingNote >= 36 && incomingNote <= 47)
	{
		// Convertir a pitch class (0-11, independiente de octava) y mapear al teclado virtual (60-71)
		selectedKey = 60 + (incomingNote % 12);
		
		// Actualizar tonalidad en el combo
		selectToneFromNote(selectedKey);
		
		// Repintar el teclado virtual
		KeyboardPanel.repaint();
		
		Console.print(">>> Root Note capturado: " + incomingNote + " (Octava C2-B2)");
	}
	
	Message.sendToMidiOut();
}
 function onNoteOff()
{
	//Message.setChannel(2);
	Message.sendToMidiOut();
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
 