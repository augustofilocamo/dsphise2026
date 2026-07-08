
const density = 0.7;      // 0.0 a 1.0 → qué tan probable es que haya nota en cada paso
const silenceChance = 0.3; // 0.0 a 1.0 → qué tan probable es que NO toque nada
const intervalQB = 0.5;   // Intervalo entre chequeos (ej: 0.5 quarter beats)

var pitch;
var velocity;

const scheduler = Engine.createTimerObject();

const intervalMs = Engine.getMilliSecondsForQuarterBeats(intervalQB);

inline function playStep()
{
    if (Math.random() < silenceChance)
    {
        Console.print("🤫 Silencio");
        return;
    }

    if (Math.random() < density)
    {
        // Elegir una nota al azar de un set
        pitch = 55 + Math.floor(Math.random() * 10);
        velocity = 80 + Math.randInt(-20, 20);

        Synth.playNoteFromUI(1, pitch, velocity);
        Console.print("🎵 Tocando nota: " + pitch);

        // Duración aleatoria corta
        local durQB = 0.3 + Math.random() * 1.0;
        local durMs = Engine.getMilliSecondsForQuarterBeats(durQB);

        local noteOffTimer = Engine.createTimerObject();
        noteOffTimer.setTimerCallback(function() {
            Synth.noteOffFromUI(1, pitch);
        });
        noteOffTimer.startTimer(durMs);
    }
    else
    {
        Console.print("⏭️ Paso sin nota");
    }
}

inline function onautoplayButton(component, value)
{
    if (value)
    {
        scheduler.setTimerCallback(function() {
            playStep();
        });

        scheduler.startTimer(intervalMs);
    }
    else
    {
        scheduler.stopTimer();
        Engine.allNotesOff();
    }
};

Content.getComponent("autoplayButton").setControlCallback(onautoplayButton);

