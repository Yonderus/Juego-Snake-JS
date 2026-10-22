# Snake V1 — Programación estructurada

**Autor:** Javier Gisbert Talboom · 2º DAW · Desenvolupament Web en Client

El clásico juego de la serpiente hecho con HTML, CSS y JavaScript, sin librerías. El tablero es una `<table>` de 11 × 11 creada desde JS, y el aspecto imita una Game Boy.

Esta primera versión está hecha con **funciones y variables globales**. La [V2](../Snake_V2) es el mismo juego reorganizado con programación orientada a objetos.

## Cómo jugarlo

Abre `tablero_juego.html` en el navegador. Funciona con doble clic, no hace falta servidor.

- **Flechas:** mueven la serpiente. Empieza quieta hasta que pulsas la primera.
- **Comer:** la serpiente crece un trozo y sube el marcador de longitud.
- **Perder:** chocar con una pared o con tu propio cuerpo.
- **Ganar:** ocupar todo el tablero.
- **Reiniciar:** el botón empieza una partida nueva en cualquier momento.

## Archivos

| Archivo | Contenido |
|---|---|
| `tablero_juego.html` | Estructura de la consola: pantalla, marcador, mensaje de fin y botón de reiniciar |
| `snake.css` | Estilo Game Boy: colores de pantalla LCD, fuente pixelada y carcasa |
| `snake.js` | Toda la lógica del juego |

## Cómo está organizado `snake.js`

El archivo está dividido en 10 secciones numeradas:

1. **Referencias al HTML:** la tabla, el marcador, el mensaje y el botón.
2. **Configuración:** `FILAS`, `COLUMNAS` y `VELOCIDAD`.
3. **Estado del juego:** las variables globales `celdas`, `snake`, `comida`, `direccion`, `intervalo` y `juegoTerminado`.
4. **Tablero:** `tableroJuego()` crea los `<tr>` y `<td>` y guarda cada celda en la matriz `celdas[y][x]`.
5. **Utilidades:** `numeroAleatorio`, `estaEnSnake` y `chocaConPared`.
6. **Comida:** dibujar, borrar y generar en una casilla libre.
7. **Snake:** dibujar, borrar y `moverSnake()`.
8. **Teclado:** `pulsarTecla()`.
9. **Fin y reinicio:** `terminarJuego()` y `reiniciarJuego()`.
10. **Inicio:** se crea el tablero, se enganchan los eventos y empieza la primera partida.

## Decisiones técnicas

- **Datos separados del dibujo.** La serpiente es un array de posiciones `{x, y}` (`snake[0]` es la cabeza). Para pintar solo se añade o quita la clase CSS `snake` o `comida` de cada `<td>`.
- **Movimiento con `unshift` + `pop`.** Se añade la nueva cabeza delante y se quita la cola. Si come, no se quita la cola, y así crece.
- **Bucle con `setInterval`, no con `while`.** El navegador tiene un solo hilo: un `while` bloquearía la página. Con el intervalo, entre paso y paso el navegador repinta y atiende al teclado.
- **Las posiciones se comparan campo a campo.** Dos objetos distintos nunca son iguales con `===`, aunque tengan los mismos valores.
- **Giro de 180° bloqueado.** Se ignora la flecha si la cabeza iría a la casilla del cuello (`snake[1]`). Así también se evita el fallo de pulsar dos flechas muy rápido.
- **La victoria se comprueba antes de generar comida.** Con el tablero lleno, el `do...while` de `generarComida` no encontraría ninguna casilla libre y se quedaría colgado.
