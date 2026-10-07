# Generate play / stop — nota (histórico)

Leé esto entero. Hablá con palabras de todos los días. **No borres** audio ni el encoder grande.

Producto: **Backgrounds**. Esto **no** es el cambio al player de fábrica ([`STRETCH_CORE.md`](STRETCH_CORE.md)).

## Estado hoy (6 sep 2026)

En el `Interface.js` **vivo**, Generate solo abre/cierra el gate (`setEmotionStretchPlaying` → `ch0_stretch_gate`). **No** hay mute → wait → gain.

Hubo un parche de colas (abajo) para suavizar el corte con el player de fábrica. Se aplicó y después se perdió al reemplazar el script en la saga stock/core. Si hace falta otra vez, reimplementarlo; este archivo es la receta, no el código actual.

La constante `GATE_ATTACK_MS` puede figurar en el script pero **no** mueve nada si nadie la usa.

## Receta (si hay que reaplicar)

Solo script. No toca red ni C++. Compile **script**.

Idea:

- **Parar:** bajar el volumen de las camas ~400 ms y recién después cortar el gate.
- **Play:** abrir el gate con volumen tapado, esperar ~700 ms, después subir el volumen.
- Al arrancar el plugin: camas tapadas para que el primer Play no se filtre.

El gain de cama ya suele suavizar ~400 ms; el timer usa eso.

## Cómo saber que anduvo (si lo reaplicás)

1. Pastilla + Generate on: entra limpio, sin chasquido al principio.
2. Generate off: baja suave; no corta de golpe.
3. Play de nuevo: igual de limpio.
