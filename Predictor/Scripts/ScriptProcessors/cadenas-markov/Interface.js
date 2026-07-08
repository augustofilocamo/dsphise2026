Content.makeFrontInterface(600, 600);

// Variables globales para el tiempo y la nota actual
const var Timer = Engine.createTimerObject();
const var envelope = Synth.getModulator("AHDSR Envelope1")
//const var synth = Synth.getChildSynth("Sine Wave Generator1");

//envelope.setAttribute(7, 1500); // Release
//envelope.setAttribute(3, 0);	// Attack Level

// Estados y probabilidades para las notas
const var melodyStates = [60, 62, 64, 67, 69]; // Notas posibles
const var melodyProbabilities = [
    [0.1, 0.4, 0.2, 0.2, 0.1], // Desde 60
    [0.2, 0.1, 0.4, 0.2, 0.1], // Desde 62
    [0.3, 0.3, 0.1, 0.2, 0.1], // Desde 64
    [0.2, 0.3, 0.3, 0.1, 0.1], // Desde 67
    [0.1, 0.2, 0.3, 0.3, 0.1]  // Desde 69
];

// Estados y probabilidades para las velocidades
const var velocityStates = [30, 60, 100, 127]; // Velocidades posibles
const var velocityProbabilities = [
    [0.3, 0.3, 0.3, 0.1], // Desde 30
    [0.2, 0.4, 0.3, 0.1], // Desde 60
    [0.1, 0.3, 0.4, 0.2], // Desde 100
    [0.1, 0.2, 0.3, 0.4]  // Desde 127
];

// Estados y probabilidades para las duraciones
const var durationStates = [500, 1000, 2500, 5000]; // Duraciones posibles

const var durationProbabilities = [
    [0.4, 0.3, 0.2, 0.1], // Desde 500
    [0.3, 0.4, 0.2, 0.1], // Desde 1000
    [0.2, 0.3, 0.4, 0.1], // Desde 2000
    [0.1, 0.2, 0.3, 0.4]  // Desde 5000
];

// Estado actual
const var currentMelodyState = 0; // Índice en melodyStates
const var currentVelocityState = 0; // Índice en velocityStates
const var currentDurationState = 0; // Índice en durationStates

const var channel = 1; // Canal MIDI

/* Selección de próximo estado usando probabilidad acumulativa */
inline function selectNextState(currentState, probabilities)
{
    local randValue = Math.random();	// Valor random
    local cumulative = 0;				// Acumulación de porcentajes
		
	// Debug    
    Console.print ("Random: " + randValue);
    Console.print ("Posibilities: " + probabilities[currentState].join(", "));
	
	/* Selección de la próxima función */
	// Cuenta por la cantidad de elementos
    local probLenght = probabilities[currentState].length;
    for (i = 0; i < probLenght; i++)
    {	
    	// Suma los valores de cada elemento
        cumulative += probabilities[currentState][i];
        
        //Console.print ("Cumulative: " + cumulative);
        
        // Si valor random es menor o igual al acumulado
        if (randValue <= cumulative)
        {	
        	//Console.print ("estado seleccionado[i]: " + i);
            return i;	// Devuelve el número del item y termina el "for"
        }
        //Console.print ("estado seleccionado[CurrentState]: " + currentState);
    }
	// Console.print ("estado seleccionado: " + currentState);
    return currentState;  // Debug: Si no se encuentra, permanece en el estado actual
}

// Función para reproducir una nota basada en la cadena de Markov
inline function playMarkovNote()
{
    // Seleccionar el siguiente estado para cada propiedad
    currentMelodyState = selectNextState(currentMelodyState, melodyProbabilities);
    Console.print ("Seleced array item: " + currentMelodyState);
    
    //currentVelocityState = selectNextState(currentVelocityState, velocityProbabilities);
    //currentDurationState = selectNextState(currentDurationState, durationProbabilities);

    // Generar valores para nota, velocidad y duración
    local note = melodyStates[currentMelodyState];
    local velocity = velocityStates[currentVelocityState];
    local duration = durationStates[currentDurationState];

    // Reproducir la nota
    Synth.addNoteOn(channel, note, velocity, 0); 
	envelope.setAttribute(3, Engine.getDecibelsForGainFactor(velocity / 127.));	// Velocity a gain
	
    // Detener la nota después de la duración
    Synth.addNoteOff(channel, note, duration);
    envelope.setAttribute(7, duration); // Envelope Release

    // Configurar el temporizador para la siguiente nota
    Timer.startTimer(duration); //Console.print("Duration: " + duration);
}

// Configurar el temporizador para llamar a playMarkovNote
Timer.setTimerCallback( function() {playMarkovNote(); } );

// Función para iniciar la cadena de Markov
inline function startMarkovMelody(){
    currentMelodyState = 0;
    currentVelocityState = 0;
    currentDurationState = 0;
    Timer.startTimer(400); // Iniciar con una duración base
}

inline function stopMarkovMelody() { Timer.stopTimer(); } // Stop the timer

// Botón para iniciar
inline function onStartButtonControl(component, value)
{
    if (!value){stopMarkovMelody(); Console.print("Apagar");}
    else {startMarkovMelody(); Console.print("Prender");}	
};

Content.getComponent("StartButton").setControlCallback(onStartButtonControl);
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
 