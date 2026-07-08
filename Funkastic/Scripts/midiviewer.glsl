/*
    MIDI Viewer Shader - Gradiente animado continuo
    FunkyBot / Rhythm Agent
*/

uniform float time;
uniform float colorShift;
uniform float currentNote; // Número de nota MIDI actual (0-127)
uniform float hasActiveNote; // 1.0 si hay nota activa, 0.0 si no
uniform float noteCount; // Número de notas MIDI
uniform vec4 noteData[64]; // x, y, radius, flashIntensity por cada nota
uniform float notePassed[64]; // 1.0 si pasó, 0.0 si no

void main()
{
    // Coordenadas normalizadas 0..1 (HISE usa fragCoord e iResolution)
    vec2 uv = fragCoord / iResolution.xy;
    
    // Constante PI
    const float PI = 3.14159265359;
    
    // Fondo negro
    vec3 col = vec3(0.0, 0.0, 0.0);
    
    // Círculo de 30x30 píxeles que se mueve con la nota
    // Calcular en píxeles para que sea perfectamente redondo
    vec2 centerPx = vec2(iResolution.x * 0.5 * (currentNote / 127.0), iResolution.y * 0.5);
    float radiusPx = 15.0; // 15px de radio = 30px de diámetro
    
    // Color del círculo (blanco)
    vec3 circleColor = vec3(1.0, 1.0, 1.0);
    
    // Dibujar estela (3 círculos atrás con fade)
    for (int i = 1; i <= 3; i++) {
        float trailOffset = float(i) * 10.0; // Separación de la estela
        vec2 trailCenter = centerPx - vec2(trailOffset, 0.0);
        float trailDist = distance(fragCoord, trailCenter);
        
        // Anti-aliasing con smoothstep (bordes suaves)
        float trailAlpha = smoothstep(radiusPx + 2.0, radiusPx - 1.0, trailDist);
        trailAlpha *= (1.0 - float(i) * 0.9); // Fade out gradual
        
        col = mix(col, circleColor, trailAlpha);
    }
    
    // Círculo principal con anti-aliasing
    float distToCenter = distance(fragCoord, centerPx);
    float inside = smoothstep(radiusPx + 2.0, radiusPx - 1.0, distToCenter);
    
    // Mezclar fondo (gradiente) y círculo
    col = mix(col, circleColor, inside);
    
    // Siempre multiplicar por pixelAlpha (regla de HISE)
    fragColor = pixelAlpha * vec4(col, 1.0);
}

