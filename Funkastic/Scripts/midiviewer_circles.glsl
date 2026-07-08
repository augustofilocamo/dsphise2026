/*
    MIDI Circles Shader - Grid sincronizado con notas MIDI
    Convertido de ShaderToy a HISE
*/

uniform float time;
uniform float activeNotes[64]; // 8x8 grid, 1.0 si hay nota activa en ese tile

// Constantes del shader original
const float TIMESCALE = 0.25;
const float TILES = 8.0;
const vec3 COLOR = vec3(0.7, 1.6, 2.8);
const vec3 ACTIVE_COLOR = vec3(2.0, 2.5, 3.5); // Color más brillante para notas activas

// Función de ruido pseudo-random (reemplaza iChannel0)
float hash(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// Generar 3 valores de ruido (simula texture RGB)
vec3 noise3(vec2 p)
{
    return vec3(
        hash(p),
        hash(p + vec2(1.7, 4.2)),
        hash(p + vec2(8.3, 2.1))
    );
}

void main()
{
    // Coordenadas normalizadas SIN aspect ratio (para que coincida con el grid 8x8)
    vec2 uv = fragCoord / iResolution.xy;
    
    // Obtener índice del tile (x: 0-7, y: 0-7)
    vec2 tileIndex = floor(uv * TILES);
    int tileIdx = int(tileIndex.y * TILES + tileIndex.x);
    
    // Verificar si hay nota activa en este tile
    float isActive = 0.0;
    if (tileIdx >= 0 && tileIdx < 64) {
        isActive = activeNotes[tileIdx];
    }
    
    // Posición dentro del tile (0 a 1)
    vec2 r = mod(uv * TILES, 1.0);
    r = vec2(pow(r.x - 0.5, 2.0), pow(r.y - 0.5, 2.0));
    
    // Crear círculo con fade desde el centro
    float circleMask = 1.0 - pow(min(1.0, 12.0 * dot(r, r)), 2.0);
    
    float p;
    vec3 col;
    
    // Si hay nota activa: círculo brillante pulsante
    if (isActive > 0.5) {
        // Pulsación rápida y visible
        p = 1.5 + sin(time * 15.0) * 0.8;
        col = ACTIVE_COLOR * p * circleMask;
    }
    else {
        // Sin nota: círculo apagado o con animación muy sutil
        vec2 tileCoord = tileIndex / TILES;
        vec3 noise = noise3(tileCoord);
        
        // Animación lenta y sutil
        p = 1.0 - mod(noise.r + noise.g + noise.b + time * TIMESCALE, 1.0);
        p = min(max(p * 3.0 - 1.8, 0.1), 2.0);
        p *= 0.3; // Reducir intensidad de círculos inactivos
        
        col = COLOR * p * circleMask;
    }
    
    // Output con pixelAlpha de HISE
    fragColor = pixelAlpha * vec4(col, 1.0);
}

