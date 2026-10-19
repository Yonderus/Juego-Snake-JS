/* Javier Gisbert Talboom 2ºDAW */

/* ÍNDICE
1. Referencias al HTML
2. Configuración
3. Estado del juego
4. Tablero
5. Utilidades
6. Comida
7. Snake
8. Teclado
9. Fin y reinicio del juego
10. Inicio del juego

El archivo sigue este orden: primero las constantes y variables (secciones 1 a 3), después todas las funciones
(secciones 4 a 9) y al final las llamadas que ponen el juego en marcha (sección 10). Así, cuando se ejecutan
las llamadas, todas las variables y funciones ya están declaradas. */


/* ==================== 1. REFERENCIAS AL HTML ==================== */

/* Guardamos en constantes los elementos del HTML que vamos a usar desde JS:
- tabla: la <table id="tabla"> vacía del HTML, donde JS creará las filas y celdas del tablero.
- longitud: el <span id="longitudCountSnake"> del marcador, donde escribiremos la longitud del snake.
- mensajeTerminado: el <p id="mensajeTerminado"> donde se muestra "GAME OVER" (o la victoria).
  Empieza oculto con el atributo hidden y terminarJuego lo muestra.
- botonReiniciar: el <button id="reiniciar"> que llama a reiniciarJuego al hacer clic.
Son const porque siempre apuntan al mismo elemento: lo que cambia es su contenido, no la referencia. */

const tabla = document.getElementById("tabla");
const longitud = document.getElementById("longitudCountSnake");
const mensajeTerminado = document.getElementById("mensajeTerminado");
const botonReiniciar = document.getElementById("reiniciar");


/* ==================== 2. CONFIGURACIÓN ==================== */

/* Número de filas y columnas. Van en mayúsculas por convención, para indicar que son valores de configuración
que no cambian durante la partida. Todo el código usa estas constantes en lugar de números escritos a mano,
así que para cambiar el tamaño del tablero basta con modificarlas aquí. Con 11x11 hay una celda central exacta.
VELOCIDAD es cada cuántos milisegundos avanza el snake: cuanto más bajo, más rápido. Se usa al arrancar
el intervalo en reiniciarJuego. */

const FILAS = 11;
const COLUMNAS = 11;
const VELOCIDAD = 200;


/* ==================== 3. ESTADO DEL JUEGO ==================== */

/* MATRIZ DE CELDAS
celdas es un array de arrays (una matriz) que guardará una referencia a cada <td> del tablero:
celdas[fila][columna] → el <td> de esa posición. Primero siempre la fila (y) y después la columna (x).
Como guarda referencias y no copias, modificar celdas[y][x] modifica la celda que se ve en pantalla.
Se declara fuera de las funciones (ámbito global) para que todas las funciones puedan usarla.
Es const porque nunca se reasigna: solo se le añaden elementos con push. */

const celdas = [];

/* SNAKE
snake es un array de objetos {x, y}: cada objeto es un trozo de la serpiente.
snake[0] es siempre la cabeza y el último elemento es la cola.
Empieza vacío: reiniciarJuego le mete el primer trozo en el centro, tanto al cargar la página como al reiniciar.
Es const porque el array nunca se reasigna: se modifica con unshift, pop, push y vaciándolo con length = 0.
Su longitud (snake.length) es también la que se muestra en el marcador, así no hace falta un contador aparte. */

const snake = [];

/* COMIDA
comida es un objeto con la posición de la comida en coordenadas de celda: x (columna) e y (fila).
Empieza en {x: 0, y: 0} solo para que tenga un valor: reiniciarJuego le da su posición real con generarComida.
Es let porque generarComida le asigna un objeto nuevo cada vez que el snake come. */

let comida = {x: 0, y: 0};

/* DIRECCIÓN
direccion indica cuánto se suma a la x y a la y de la cabeza en cada paso:
derecha {x: 1, y: 0}, izquierda {x: -1, y: 0}, abajo {x: 0, y: 1}, arriba {x: 0, y: -1} (la y crece hacia abajo).
Vale {x: 0, y: 0} al empezar: sumar 0 no mueve la cabeza, así que el snake espera quieto hasta la primera flecha.
Es global para que pulsarTecla la pueda cambiar y moverSnake la pueda leer: las dos funciones
se comunican a través de esta variable, sin llamarse entre ellas. */

let direccion = {x: 0, y: 0};

/* INTERVALO
Guarda el identificador que devuelve setInterval, para poder pararlo después con clearInterval.
Es let porque cada vez que se reinicia el juego se crea un intervalo nuevo y se guarda aquí. */

let intervalo;

/* JUEGO TERMINADO
Vale true después de perder (o ganar). pulsarTecla lo consulta para ignorar las flechas cuando la partida ha acabado,
y reiniciarJuego lo vuelve a poner a false. */

let juegoTerminado = false;


/* ==================== 4. TABLERO ==================== */

/* La función tableroJuego crea el tablero con dos bucles anidados:
- El bucle de fuera (fila) se ejecuta FILAS veces: en cada vuelta crea un <tr> y añade a celdas un array vacío para esa fila.
- El bucle de dentro (col) se ejecuta COLUMNAS veces por cada fila: crea un <td>, lo mete en el <tr> y guarda su referencia en celdas[fila].
- Al terminar cada fila, el <tr> completo se mete en la tabla.
createElement crea el elemento en memoria y appendChild lo coloca dentro de su padre. appendChild no copia el elemento, lo mueve,
por eso hay que crear un <tr> nuevo en cada fila y un <td> nuevo en cada columna.
Solo se llama una vez al cargar la página: al reiniciar no se vuelve a crear el tablero, solo se limpia. */

function tableroJuego() {
    for (let fila = 0; fila < FILAS; fila++) {
        // Fila nueva del HTML (una por cada vuelta del bucle de filas)
        const tr = document.createElement("tr");
        // Array vacío en la matriz para guardar los <td> de esta fila
        celdas.push([]);

        for (let col = 0; col < COLUMNAS; col++) {
            // Celda nueva (una por cada columna)
            const td = document.createElement("td");
            // La metemos en la fila del HTML
            tr.appendChild(td);
            // Y guardamos su referencia en la matriz: celdas[fila][col]
            celdas[fila].push(td);
        }

        // La fila completa se añade a la tabla
        tabla.appendChild(tr);
    }
}


/* ==================== 5. UTILIDADES ==================== */

/* numeroAleatorio devuelve un número entero aleatorio entre 0 y max - 1.
Math.random() da un decimal entre 0 y 0,999..., al multiplicarlo por max queda entre 0 y casi max,
y Math.floor lo redondea hacia abajo. No se suma 1 porque los índices de la matriz empiezan en 0.
Ej: con max = 11 devuelve un número del 0 al 10. Se usa con COLUMNAS para la x y con FILAS para la y. */

function numeroAleatorio(max) {
    return Math.floor(Math.random() * max);
}

/* estaEnSnake devuelve true si la posición coincide con algún trozo del snake, y false si no.
Recorre todos los trozos comparando x con x e y con y. En cuanto encuentra una coincidencia devuelve true y deja de buscar.
El return false va fuera del bucle porque solo se puede asegurar que no está después de revisar todos los trozos.
Se usa en dos sitios: en generarComida, para no poner la comida encima del snake,
y en moverSnake, para saber si la nueva cabeza choca con el cuerpo. */

function estaEnSnake(posicion) {
    for (const trozo of snake) {
        if (posicion.x === trozo.x && posicion.y === trozo.y) {
            return true;
        }
    }
    return false;
}

/* chocaConPared devuelve true si la posición se sale del tablero, y false si está dentro.
Los índices válidos van de 0 a COLUMNAS - 1 para la x y de 0 a FILAS - 1 para la y,
así que se sale si es menor que 0 o mayor o igual que el número de columnas/filas.
Basta con que se cumpla una de las cuatro condiciones, por eso se unen con ||.
Se puede devolver directamente la condición porque ya es true o false. */

function chocaConPared(posicion) {
    return posicion.x < 0 || posicion.x >= COLUMNAS || posicion.y < 0 || posicion.y >= FILAS;
}


/* ==================== 6. COMIDA ==================== */

/* dibujarComida pinta la comida: busca su celda en la matriz (celdas[y][x]) y le añade la clase "comida",
que en el CSS le da el color. Solo lee el estado (comida), no decide nada: los datos van separados del dibujo. */

function dibujarComida() {
    const celdaComida = celdas[comida.y][comida.x];
    celdaComida.classList.add("comida");
}

/* borrarComida hace lo contrario que dibujarComida: quita la clase "comida" de la celda donde está ahora.
Hay que llamarla ANTES de cambiar la posición de la comida, porque después ya no sabríamos qué celda limpiar. */

function borrarComida() {
    const celdaComida = celdas[comida.y][comida.x];
    celdaComida.classList.remove("comida");
}

/* generarComida busca una posición libre para la comida nueva. Usamos un do...while porque hay que generar
al menos una posición antes de poder comprobarla:
1. Genera una posición aleatoria en nueva.
2. Si estaEnSnake dice que esa posición está ocupada por el snake, vuelve a generar otra.
3. Cuando sale una posición libre, el bucle termina y se guarda en comida.
nueva se declara fuera del do porque el while (que está fuera de las llaves) también la necesita.
Importante: si el snake ocupara todo el tablero no habría ninguna posición libre y el bucle no terminaría nunca.
Por eso moverSnake comprueba la victoria ANTES de llamar a generarComida. */

function generarComida() {
    let nueva;
    do {
        nueva = {x: numeroAleatorio(COLUMNAS), y: numeroAleatorio(FILAS)};
    } while (estaEnSnake(nueva));

    comida = nueva;
}


/* ==================== 7. SNAKE ==================== */

/* dibujarSnake recorre todos los trozos del snake con for...of y, para cada uno, busca su celda en la matriz
y le añade la clase "snake". En cada vuelta, la variable trozo es un objeto {x, y}; el <td> es celdaSnake. */

function dibujarSnake() {
    for (const trozo of snake) {
        const celdaSnake = celdas[trozo.y][trozo.x];
        celdaSnake.classList.add("snake");
    }
}

/* borrarSnake hace lo contrario que dibujarSnake: quita la clase "snake" de las celdas de todos los trozos.
Hay que llamarla mientras el array todavía tiene las posiciones antiguas, para borrar el dibujo viejo. */

function borrarSnake() {
    for (const trozo of snake) {
        const celdaSnake = celdas[trozo.y][trozo.x];
        celdaSnake.classList.remove("snake");
    }
}

/* moverSnake hace avanzar el snake una celda. La llama el setInterval cada VELOCIDAD milisegundos.
0. Si la dirección es {x: 0, y: 0} el snake está quieto (todavía no se ha pulsado ninguna flecha) y no hace nada.
   Sin esto, la nueva cabeza coincidiría con la cabeza actual y se detectaría como un choque.
1. Calcula la nueva cabeza sumando la dirección a la cabeza actual (snake[0]). Es un objeto nuevo.
2. Comprueba los choques ANTES de mover nada, para que al perder el snake siga dibujado tal como estaba:
   - con una pared (chocaConPared),
   - con su propio cuerpo (estaEnSnake). Se comprueba antes del unshift: si la nueva cabeza ya estuviera
     en el array, estaEnSnake siempre la encontraría.
   Si choca, termina el juego y sale con return.
3. Borra el dibujo del snake (con las posiciones antiguas).
4. Añade la nueva cabeza al principio del array con unshift.
5. Si la nueva cabeza pisa la comida (se compara x con x e y con y, porque dos objetos distintos nunca son iguales con ===):
   - borra la comida y actualiza el marcador con la nueva longitud,
   - si el snake ya ocupa todo el tablero, ha ganado: lo dibuja, termina el juego y sale,
   - si no, genera comida nueva en una celda libre y la dibuja,
   - y NO quita la cola: así el snake crece un trozo.
   Si no ha comido, quita la cola con pop y el snake avanza manteniendo su longitud.
6. Dibuja el snake con las posiciones nuevas.
Con unshift + pop se mueve todo el snake sin mover cada trozo: aparece uno delante y desaparece uno detrás. */

function moverSnake() {
    // 0. Si está quieto, no hay nada que mover
    if (direccion.x === 0 && direccion.y === 0) {
        return;
    }

    // 1. Nueva posición de la cabeza = cabeza actual + dirección
    const cabeza = snake[0];
    const nuevaCabeza = {x: cabeza.x + direccion.x, y: cabeza.y + direccion.y};

    // 2. ¿Choca con una pared o con su cuerpo? Fin de la partida
    if (chocaConPared(nuevaCabeza) || estaEnSnake(nuevaCabeza)) {
        terminarJuego("GAME\nOVER");
        return;
    }

    // 3. Borrar el dibujo con las posiciones antiguas
    borrarSnake();

    // 4. La nueva cabeza pasa a ser el primer trozo
    snake.unshift(nuevaCabeza);

    // 5. ¿La nueva cabeza pisa la comida?
    if (nuevaCabeza.x === comida.x && nuevaCabeza.y === comida.y) {
        borrarComida();
        longitud.textContent = snake.length;

        // Si ya no queda ninguna celda libre, ha ganado
        if (snake.length === FILAS * COLUMNAS) {
            dibujarSnake();
            terminarJuego("¡HAS\nGANADO!");
            return;
        }

        generarComida();
        dibujarComida();
    } else {
        //    No ha comido: quitamos la cola para mantener la longitud
        snake.pop();
    }

    // 6. Dibujar con las posiciones nuevas
    dibujarSnake();
}


/* ==================== 8. TECLADO ==================== */

/* pulsarTecla se ejecuta cada vez que se pulsa una tecla (la engancha el addEventListener de la sección 10).
El navegador le pasa el objeto event, y en event.key viene el nombre de la tecla pulsada.
1. El switch solo traduce la flecha pulsada a una dirección y la guarda en nueva (todavía no la aplica).
   Si la tecla no es una flecha, el default sale de la función sin hacer nada, así no se bloquean teclas como F5.
2. event.preventDefault() cancela la acción por defecto de las flechas (hacer scroll en la página).
3. Si la partida ha terminado, las flechas no hacen nada hasta que se reinicie.
4. Calcula a qué celda iría la cabeza con la nueva dirección. Si esa celda es el cuello (snake[1]),
   sería un giro de 180° y la cabeza chocaría consigo misma, así que se ignora la tecla.
   Se compara con la posición real del cuello y no con la última tecla pulsada: así tampoco se cuela
   el giro si se pulsan dos flechas muy rápido antes de que el snake se mueva.
   snake.length > 1 va primero: si el snake mide 1, snake[1] no existe, y como esa parte ya da false,
   JavaScript no llega a evaluar el resto de la condición (evaluación en cortocircuito).
5. Si la dirección es válida, se aplica. */

function pulsarTecla(event) {
    // 1. Averiguamos qué dirección se ha pulsado (todavía no la aplicamos)
    let nueva;

    switch (event.key) {
        case "ArrowUp":
            nueva = {x: 0, y: -1};
            break;
        case "ArrowDown":
            nueva = {x: 0, y: 1};
            break;
        case "ArrowRight":
            nueva = {x: 1, y: 0};
            break;
        case "ArrowLeft":
            nueva = {x: -1, y: 0};
            break;
        default:
            return;     // No es una flecha: salimos sin hacer nada
    }

    // 2. Es una flecha: evitamos que la página haga scroll
    event.preventDefault();

    // 3. Si la partida ha terminado, ignoramos las flechas
    if (juegoTerminado) {
        return;
    }

    // 4. Calculamos a qué celda iría la cabeza y comprobamos que no sea el cuello
    const cabeza = snake[0];
    const destino = {x: cabeza.x + nueva.x, y: cabeza.y + nueva.y};

    if (snake.length > 1 && destino.x === snake[1].x && destino.y === snake[1].y) {
        return;
    }

    // 5. La dirección es válida: la aplicamos
    direccion = nueva;
}


/* ==================== 9. FIN Y REINICIO DEL JUEGO ==================== */

/* terminarJuego se llama cuando el snake choca (con su cuerpo o con una pared) o cuando gana:
1. Para el intervalo con clearInterval, así moverSnake deja de ejecutarse y el snake se queda quieto.
2. Marca juegoTerminado como true para que pulsarTecla ignore las flechas.
3. Escribe el texto recibido en el mensaje y lo muestra quitándole el atributo hidden.
   El \n del texto es un salto de línea: el CSS del mensaje tiene white-space: pre-line para que se respete. */

function terminarJuego(texto) {
    clearInterval(intervalo);
    juegoTerminado = true;
    mensajeTerminado.textContent = texto;
    mensajeTerminado.hidden = false;
}

/* reiniciarJuego deja todo como al empezar una partida. Se usa al cargar la página y al pulsar el botón,
así el código de "empezar partida" está en un solo sitio. El orden importa:
1. Para el intervalo actual (por si se reinicia a mitad de partida y no acabar con dos intervalos a la vez).
   Al cargar la página intervalo todavía no tiene valor, y clearInterval(undefined) simplemente no hace nada.
2. Borra el dibujo del snake y de la comida MIENTRAS los datos todavía tienen las posiciones viejas.
3. Vacía el array snake (length = 0) y le mete un trozo en el centro. No se reasigna porque es const.
4. Deja la dirección quieta y quita la marca de juego terminado.
5. Genera la comida DESPUÉS de resetear el snake, para que evite el snake nuevo y no el viejo.
6. Pone el marcador con la longitud actual (1), oculta el mensaje y dibuja el snake y la comida.
7. Quita el foco del botón: si no, después de hacer clic, pulsar espacio o Enter volvería a reiniciar.
8. Arranca un intervalo nuevo y guarda su identificador en intervalo. */

function reiniciarJuego() {
    // 1. Parar el intervalo actual
    clearInterval(intervalo);

    // 2. Borrar el dibujo de la partida anterior
    borrarSnake();
    borrarComida();

    // 3. Snake de un solo trozo en el centro
    snake.length = 0;
    snake.push({x: Math.floor(COLUMNAS / 2), y: Math.floor(FILAS / 2)});

    // 4. Dirección quieta y partida en marcha
    direccion = {x: 0, y: 0};
    juegoTerminado = false;

    // 5. Comida nueva en una celda libre
    generarComida();

    // 6. Marcador, mensaje y dibujo
    longitud.textContent = snake.length;
    mensajeTerminado.hidden = true;
    dibujarSnake();
    dibujarComida();

    // 7. Quitar el foco del botón
    botonReiniciar.blur();

    // 8. Arrancar el bucle del juego
    intervalo = setInterval(moverSnake, VELOCIDAD);
}


/* ==================== 10. INICIO DEL JUEGO ==================== */

/* Ponemos el juego en marcha, en este orden:
1. Construimos el tablero (antes de dibujar nada, porque dibujar necesita que celdas tenga los <td>).
2. Enganchamos pulsarTecla al evento "keydown" de toda la página y reiniciarJuego al clic del botón.
   "keydown" y "click" son nombres fijos del navegador. Las funciones van sin paréntesis: no las llamamos
   nosotros, se las pasamos al navegador para que las llame él cuando ocurra el evento.
3. Llamamos a reiniciarJuego para preparar la primera partida: coloca el snake y la comida y arranca
   el setInterval. Entre una llamada a moverSnake y otra, el navegador repinta la pantalla y atiende el teclado
   (por eso no se puede usar un while para esto). */

tableroJuego();

document.addEventListener("keydown", pulsarTecla);
botonReiniciar.addEventListener("click", reiniciarJuego);

reiniciarJuego();
