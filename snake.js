/* Javier Gisbert Talboom 2ºDAW */

/* ÍNDICE
1. Referencias al HTML
2. Configuración del tablero
3. Estado del juego
4. Tablero
5. Utilidades
6. Comida
7. Snake
8. Teclado
9. Fin y reinicio del juego (pendiente)
10. Inicio del juego

El archivo sigue este orden: primero las constantes y variables (secciones 1 a 3), después todas las funciones
(secciones 4 a 9) y al final las llamadas que ponen el juego en marcha (sección 10). Así, cuando se ejecutan
las llamadas, todas las variables y funciones ya están declaradas. */


/* ==================== 1. REFERENCIAS AL HTML ==================== */

/* Guardamos en constantes los elementos del HTML que vamos a usar desde JS:
- tabla: la <table id="tabla"> vacía del HTML, donde JS creará las filas y celdas del tablero.
- longitud: el <span id="longitudCountSnake"> del marcador, donde escribiremos la longitud del snake.
Son const porque siempre apuntan al mismo elemento: lo que cambia es su contenido, no la referencia. */

const tabla = document.getElementById("tabla");
const longitud = document.getElementById("longitudCountSnake");


/* ==================== 2. CONFIGURACIÓN DEL TABLERO ==================== */

/* Número de filas y columnas. Van en mayúsculas por convención, para indicar que son valores de configuración
que no cambian durante la partida. Todo el código usa estas constantes en lugar de números escritos a mano,
así que para cambiar el tamaño del tablero basta con modificarlas aquí. Con 11x11 hay una celda central exacta. */

const FILAS = 11;
const COLUMNAS = 11;


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
Empieza con un solo trozo en el centro, calculado a partir de FILAS y COLUMNAS (Math.floor(11 / 2) = 5)
para que siga centrado aunque cambie el tamaño del tablero.
Es const porque el array nunca se reasigna: se modifica con unshift y pop. */

const snake = [{y: Math.floor(FILAS / 2), x: Math.floor(COLUMNAS / 2)}];

/* COMIDA
comida es un objeto con la posición de la comida en coordenadas de celda: x (columna) e y (fila).
Es let porque generarComida le asigna un objeto nuevo cada vez que el snake come.
Nota: esta posición inicial se genera sin comprobar si coincide con el snake. */

let comida = {y: posicionComida(FILAS), x: posicionComida(COLUMNAS)};

/* DIRECCIÓN
direccion indica cuánto se suma a la x y a la y de la cabeza en cada paso:
derecha {x: 1, y: 0}, izquierda {x: -1, y: 0}, abajo {x: 0, y: 1}, arriba {x: 0, y: -1} (la y crece hacia abajo).
Empieza en {x: 0, y: 0}: sumar 0 no mueve la cabeza, así que el snake espera quieto hasta la primera flecha.
Es global para que pulsarTecla la pueda cambiar y moverSnake la pueda leer: las dos funciones
se comunican a través de esta variable, sin llamarse entre ellas. */

let direccion = {x: 0, y: 0};

/* LONGITUD
Contador de la longitud del snake para el marcador. Empieza en 1 porque el snake empieza con un solo trozo.
Es let porque se incrementa cada vez que el snake come. */

let longituds = 1;


/* ==================== 4. TABLERO ==================== */

/* La función tableroJuego crea el tablero con dos bucles anidados:
- El bucle de fuera (fila) se ejecuta FILAS veces: en cada vuelta crea un <tr> y añade a celdas un array vacío para esa fila.
- El bucle de dentro (col) se ejecuta COLUMNAS veces por cada fila: crea un <td>, lo mete en el <tr> y guarda su referencia en celdas[fila].
- Al terminar cada fila, el <tr> completo se mete en la tabla.
createElement crea el elemento en memoria y appendChild lo coloca dentro de su padre. appendChild no copia el elemento, lo mueve,
por eso hay que crear un <tr> nuevo en cada fila y un <td> nuevo en cada columna. */

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

/* La función posicionComida devuelve un número entero aleatorio entre 0 y p - 1.
Math.random() da un decimal entre 0 y 0,999..., al multiplicarlo por p queda entre 0 y casi p, y Math.floor lo redondea hacia abajo.
No se suma 1 porque los índices de la matriz empiezan en 0.
Ej: con p = 11 devuelve un número del 0 al 10. Se usa con COLUMNAS para la x y con FILAS para la y.
Se puede usar en la sección 3, antes de aparecer en el archivo, porque las funciones declaradas con "function"
se elevan al principio del archivo (hoisting). Con las variables const o let no pasa. */

function posicionComida(p) {
    return Math.floor(Math.random() * p);
}

/* estaEnSnake devuelve true si la posición p coincide con algún trozo del snake, y false si no.
Recorre todos los trozos comparando x con x e y con y. En cuanto encuentra una coincidencia devuelve true y deja de buscar.
El return false va fuera del bucle porque solo se puede asegurar que no está después de revisar todos los trozos.
Se usa en generarComida para no poner la comida encima del snake. */

function estaEnSnake(p) {
    for (const trozo of snake) {
        if (p.x === trozo.x && p.y === trozo.y) {
            return true;
        }
    }
    return false;
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
1. Genera una posición aleatoria y la asigna a comida.
2. Si estaEnSnake dice que esa posición está ocupada por el snake, vuelve a empezar.
El bucle termina en cuanto sale una posición libre, así que comida acaba siempre en una celda vacía.
(La variable nueva es intermedia: se podría generar directamente en comida.)
Si algún día el snake ocupara todo el tablero, nunca saldría una posición libre y el bucle no terminaría. */

function generarComida() {
    let nueva;
    do {
        nueva = {y: posicionComida(FILAS), x: posicionComida(COLUMNAS)};
        comida = nueva;
    } while (estaEnSnake(comida));
}


/* ==================== 7. SNAKE ==================== */

/* dibujarSnake recorre todos los trozos del snake con for...of y, para cada uno, busca su celda en la matriz
y le añade la clase "snake". En cada vuelta, la variable celda contiene un trozo (un objeto {x, y}), no un <td>:
el <td> es celdaSnake. */

function dibujarSnake() {
    for (const celda of snake) {
        const celdaSnake = celdas[celda.y][celda.x];
        celdaSnake.classList.add("snake");
    }
}

/* borrarSnake hace lo contrario que dibujarSnake: quita la clase "snake" de las celdas de todos los trozos.
Se llama al principio de moverSnake, cuando el array todavía tiene las posiciones antiguas, para no dejar rastro. */

function borrarSnake() {
    for (const celda of snake) {
        const celdaSnake = celdas[celda.y][celda.x];
        celdaSnake.classList.remove("snake");
    }
}

/* moverSnake hace avanzar el snake una celda. La llama el setInterval cada 200 ms.
1. Borra el dibujo actual del snake (con las posiciones antiguas).
2. Coge la cabeza actual (snake[0]) y calcula la nueva cabeza sumándole la dirección.
   Es un objeto nuevo: la cabeza antigua no se modifica.
3. Añade la nueva cabeza al principio del array con unshift. Se hace antes de comprobar la comida para que,
   si hay que generar comida nueva, estaEnSnake ya tenga en cuenta la cabeza nueva.
4. Si la nueva cabeza está en la misma posición que la comida (se compara x con x e y con y,
   porque dos objetos distintos nunca son iguales con ===):
   - borra la comida antigua, genera una posición nueva libre y la dibuja,
   - suma 1 a la longitud y actualiza el marcador,
   - y NO quita la cola: así el snake crece un trozo.
   Si no ha comido, quita la cola con pop y el snake avanza manteniendo su longitud.
5. Dibuja el snake con las posiciones nuevas.
Con unshift + pop se mueve todo el snake sin mover cada trozo: aparece uno delante y desaparece uno detrás. */

    function moverSnake() {
    
        if (direccion.x === 0 && direccion.y === 0) {
          return  
        }

        // 2. Cabeza actual
        const cabeza = snake[0];
        //    Nueva posición de la cabeza = cabeza actual + dirección
        const nuevaCabeza = {y: cabeza.y + direccion.y, x: cabeza.x + direccion.x};

        for (const trozo of snake) {
            if (trozo.x === nuevaCabeza.x && trozo.y === nuevaCabeza.y) {
                //intervalo = clearInterval(moverSnake, 0);
                terminarJuego();
                return true;       
            }
        }

        // 1. Borrar el dibujo con las posiciones antiguas
        borrarSnake();
    
        // 3. La nueva cabeza pasa a ser el primer trozo
        snake.unshift(nuevaCabeza);

        // 4. ¿La nueva cabeza pisa la comida?
        if (nuevaCabeza.x === comida.x && nuevaCabeza.y === comida.y) {
            borrarComida();
            generarComida();
            dibujarComida();

            longituds++;
            longitud.textContent = longituds;
        } else {
            //    No ha comido: quitamos la cola para mantener la longitud
            snake.pop();
        }

        

        // 5. Dibujar con las posiciones nuevas
        dibujarSnake();
    }


/* ==================== 8. TECLADO ==================== */

/* pulsarTecla se ejecuta cada vez que se pulsa una tecla (la engancha el addEventListener de la sección 10).
El navegador le pasa el objeto event, y en event.key viene el nombre de la tecla pulsada.
El switch compara event.key con las cuatro flechas. En cada caso:
1. Si la flecha es la dirección contraria a la actual, sale de la función con return y no cambia nada.
   Así se evita el giro de 180°, que haría que la cabeza chocara con su propio cuello.
   Ej: si va a la derecha (x === 1) y se pulsa la izquierda, se ignora.
2. Si no, asigna la nueva dirección.
3. event.preventDefault() cancela la acción por defecto de las flechas (hacer scroll en la página).
   Solo se llama en las flechas para no bloquear otras teclas como F5.
   Nota: cuando se sale con return en el paso 1, no se llega a ejecutar el preventDefault.
Cada case termina con break para que no se ejecuten también los case siguientes.
Si la tecla no es una flecha, no coincide ningún case y direccion no cambia. */

function pulsarTecla(event) {
    switch (event.key) {
        case "ArrowUp":
            if (direccion.y === 1) {
                return;
            }
            direccion = {x: 0, y: -1};
            event.preventDefault();
            break;
        case "ArrowDown":
            if (direccion.y === -1) {
                return;
            }
            direccion = {x: 0, y: 1};
            event.preventDefault();
            break;
        case "ArrowRight":
            if (direccion.x === -1) {
                return;
            }
            direccion = {x: 1, y: 0};
            event.preventDefault();
            break;
        case "ArrowLeft":
            if (direccion.x === 1) {
                return;
            }
            direccion = {x: -1, y: 0};
            event.preventDefault();
            break;
    }

    // Muestra la dirección en la consola (para depurar, se puede quitar)
    console.log(direccion);
}


/* ==================== 9. FIN Y REINICIO DEL JUEGO (PENDIENTE) ==================== */

/* PENDIENTE: terminarJuego deberá parar el intervalo, mostrar un mensaje de fin de partida
e impedir que las flechas sigan cambiando la dirección. */

function terminarJuego() {
    clearInterval(intervalo);
}

/* PENDIENTE: restartJuego deberá devolver el juego al estado inicial: snake en el centro, dirección quieta,
comida nueva, marcador a 1, tablero limpio y un único intervalo nuevo. */

function restartJuego() {
    snake = [{y: Math.floor(FILAS / 2), x: Math.floor(COLUMNAS / 2)}];
    direccion = {x: 0, y: 0}
    longituds = 1
    
}

/* PENDIENTE: chocarPared deberá comprobar si una posición se sale del tablero. */

function chocarPared() {

}

/* PENDIENTE: chocarSnake deberá comprobar si la nueva cabeza choca con el cuerpo del snake. */

function chocarSnake() {

}


/* ==================== 10. INICIO DEL JUEGO ==================== */

/* Ponemos el juego en marcha, en este orden:
1. Construimos el tablero (antes de dibujar nada, porque dibujar necesita que celdas tenga los <td>).
2. Dibujamos la comida y el snake en su posición inicial.
3. Enganchamos pulsarTecla al evento "keydown" de toda la página. "keydown" es un nombre fijo del navegador.
   La función va sin paréntesis: no la llamamos nosotros, se la pasamos al navegador para que la llame él
   cada vez que se pulse una tecla.
4. Arrancamos el bucle del juego: setInterval llama a moverSnake cada 200 ms. Entre una llamada y otra
   el navegador repinta la pantalla y atiende el teclado (por eso no se puede usar un while para esto).
   Guardamos el identificador en intervalo para poder pararlo con clearInterval(intervalo) al terminar el juego. */

tableroJuego();
dibujarComida();
dibujarSnake();

document.addEventListener("keydown", pulsarTecla);

const intervalo = setInterval(moverSnake, 200);
