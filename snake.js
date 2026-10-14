const tabla = document.getElementById("tabla");
const longitud = document.getElementById("longitudCountSnake");

let longituds = 1

const FILAS = 11;
const COLUMNAS = 11;

const celdas = [];

tableroJuego();

function tableroJuego() {

    for (let fila = 0; fila < FILAS; fila++) {
        const tr = document.createElement("tr");
            celdas.push([])
            for (let col = 0; col < COLUMNAS; col++) {
                const td = document.createElement("td");
                tr.appendChild(td)
                celdas[fila].push(td);
            }
        tabla.appendChild(tr)
    }
}

function posicionComida(p) {
    return Math.floor(Math.random()*p)
}

let comida = {y: posicionComida(FILAS), x: posicionComida(COLUMNAS)}

function dibujarComida() {
    const celdaComida = celdas[comida.y][comida.x]
    celdaComida.classList.add("comida")
}

dibujarComida()

function borrarComida() {
    const celdaComida = celdas[comida.y][comida.x]
    celdaComida.classList.remove("comida")
}

function generarComida() {
    let nueva;
    do {
        nueva = {y: posicionComida(FILAS), x: posicionComida(COLUMNAS)}
        comida = nueva
    } while (estaEnSnake(comida));
}

const snake = [{y: Math.floor(FILAS / 2), x: Math.floor(COLUMNAS / 2)}] ;

function dibujarSnake() {
    for (const celda of snake) {
        const celdaSnake = celdas[celda.y][celda.x]
        celdaSnake.classList.add("snake")
    }
}

dibujarSnake()

let direccion = {x: 0, y: 0}

function pulsarTecla(event) {

    switch (event.key) {
        case "ArrowUp":
            direccion = {x: 0, y: -1}
            event.preventDefault()
            break;
        case "ArrowDown":
            direccion = {x: 0, y: 1}
            event.preventDefault()
            break;
        case "ArrowRight":
            direccion = {x: 1, y: 0}
            event.preventDefault()
            break;
        case "ArrowLeft":
            direccion = {x: -1, y: 0}
            event.preventDefault()
            break;
        default:
            break;
    }

    
    console.log(direccion)
}

function borrarSnake() {
    for (const celda of snake) {
        const celdaSnake = celdas[celda.y][celda.x]
        celdaSnake.classList.remove("snake")
    }
    
}

document.addEventListener("keydown", pulsarTecla);

function moverSnake() {
    borrarSnake();

    const cabeza = snake[0];

    const nuevaCabeza = {y: cabeza.y + direccion.y, x: cabeza.x + direccion.x}

    snake.unshift(nuevaCabeza)

    if (nuevaCabeza.x === comida.x && nuevaCabeza.y === comida.y) {
        borrarComida()
        generarComida()
        dibujarComida()
        longituds++
        longitud.textContent = longituds
    } else {
        snake.pop()
    }

    
    dibujarSnake();
}

function estaEnSnake(p) {
    for (const trozo of snake) {
        if (p.x === trozo.x && p.y === trozo.y) {
            return true;
        }
    }
    return false;
}

const intervalo = setInterval(moverSnake, 200)