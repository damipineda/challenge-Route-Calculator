let filas = 25; //Variable filas
let columnas = 25; //Variables columnas
let escenario; //Variable escenario (vacia)
let casillaAbierta = []; //Variable que representa un array vacio, seran la casilla por vicitar.
let casillaCerrada = []; //Casilla cerrada que representa una array o lista vacia, seran las casillas visitadas
let camino = []; // Variable que representa un array o lista vacia
let terminado = false; //Variable booleana que representa el camino terminado, se inicia en false luego pasa a true
let principio; //Variable representa el inicio del camino
let fin; //Variable representa el destino
//Funcion para crear la tabla o matriz del mapa
function creaTabla(filas, columnas) {
    let tabla = []; //Creamos una array o lista vacia para representar la tabla
    for (let cantidadFilas = 0; cantidadFilas < filas; cantidadFilas++) {
        tabla[cantidadFilas] = []; //creamos un array vacio para cada fila
        for (let cantidadColumnas = 0; cantidadColumnas < columnas; cantidadColumnas++) {
            tabla[cantidadFilas][cantidadColumnas] = null; //Se inicia cada cacilla como null o vacia
        }
    }
    return tabla;
}
//Funcion heuristica para calcular la distacia y el costo (Costos = 1)
function heuristicaManhattan(a, b) {
    let x = Math.abs(a.x - b.x); //Se calcula la distancia horizontal (x = horizontal)
    let y = Math.abs(a.y - b.y); //Se calcula la distancia vertical (y = vertical)
    return x + y; //Suma las distancias horizontal y vertical para obtener una estimación de la distancia total entre los puntos.
}

//Funcion que borra las casilla ya exploradas de la listas
function borraDelArray(array, elemento) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] == elemento) {
            array.splice(i, 1);
        }
    }
}

function Casilla(x, y) {
    this.x = x; //Coordenada horizontal (columna) de la casilla.
    this.y = y; //Coordenada vertical (fila) de la casilla
    this.tipo = 0; //Tipo de casilla (0 es un camino libre / 1 es un muro)
    let aleatorio = Math.floor(Math.random() * 5); //Genera un número aleatorio entre 0 y 4 
    if (aleatorio == 1) this.tipo = 1; //Si el número aleatorio es 1, se cambia el tipo de casilla a 1, convirtiéndola en un muro.
    this.f = 0; //costo total estimado de pasar por esta casilla para llegar al destino
    this.g = 0; //costo real de llegar a esta casilla desde el inicio.
    this.h = 0; //costo estimado (heurística) de llegar al destino desde esta casilla
    this.vecinos = []; //array que almacenará las casillas vecinas a esta casilla
    this.padre = null; // referencia a la casilla anterior en el mejor camino encontrado hasta el momento (usado para reconstruir el camino al final).
   //enconcuentra y agrega las casillas vecinas válidas (aquellas que están dentro de los límites del mapa y no son muros) 
    this.addVecinos = function () {
        if (this.x > 0) this.vecinos.push(escenario[this.y][this.x - 1]);
        if (this.x < columnas - 1) this.vecinos.push(escenario[this.y][this.x + 1]);
        if (this.y > 0) this.vecinos.push(escenario[this.y - 1][this.x]);
        if (this.y < filas - 1) this.vecinos.push(escenario[this.y + 1][this.x]);
    }
}
//Funcion para inicializar la tabla 
function inicializa() {
    escenario = creaTabla(filas, columnas); //Se llama a la tabla
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            escenario[i][j] = new Casilla(j, i);
        }
    }
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            escenario[i][j].addVecinos();
        }
    }
    dibujaMapa();
}
//Funcion para dibujar el mapa
function dibujaMapa() {
    let tabla = document.getElementById('mapa');
    tabla.innerHTML = '';
    for (let i = 0; i < filas; i++) {
        let fila = document.createElement('tr');
        for (let j = 0; j < columnas; j++) {
            let celda = document.createElement('td');
            celda.textContent = `${j},${i}`;
            if (escenario[i][j].tipo == 1) celda.className = 'muro';
            if (escenario[i][j] == principio) celda.className = 'inicio';
            if (escenario[i][j] == fin) celda.className = 'fin';
            if (camino.includes(escenario[i][j]) && escenario[i][j] !== principio && escenario[i][j] !== fin) {
                celda.className = 'camino';
            }
            fila.appendChild(celda);
        }
        tabla.appendChild(fila);
    }
}


//Funcion que actualiza el inicio y el fin del camino
function actualizaInicioFin() {
    let inicioCoords = document.getElementById('inicio').value.split(',');
    let finCoords = document.getElementById('fin').value.split(',');

    if (inicioCoords.length === 2 && finCoords.length === 2) {
        let inicioX = parseInt(inicioCoords[0]);
        let inicioY = parseInt(inicioCoords[1]);
        let finX = parseInt(finCoords[0]);
        let finY = parseInt(finCoords[1]);

        if (isValidCoord(inicioX, inicioY) && isValidCoord(finX, finY)) {
            principio = escenario[inicioY][inicioX];
            fin = escenario[finY][finX];
            reiniciaAlgoritmo();
            principal();  // Ejecutar el algoritmo
        } else {
            alert('Coordenadas inválidas. Deben estar dentro del rango 0-24.');
        }
    } else {
        alert('Formato de coordenadas incorrecto. Use el formato x,y.');
    }
}
//Evento para utilizar la tecla enter en los inpus de inicio y final
document.getElementById('inicio').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('acturalizar').click();
    }
  });
document.getElementById('fin').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('acturalizar').click();
    }
  });

  //Agrega el evento al cursor para egregar muros junto al boton agregar muros
  document.getElementById("agregarMuroButton").addEventListener("click", function() {
    // Cambia el estilo del cursor a "crosshair" para indicar que se puede agregar un muro
    document.body.style.cursor = "crosshair";
  
    // Agrega un event listener al documento para escuchar los clics del mouse
    document.addEventListener("click", function(event) {
      // Verifica si el clic fue en una celda de la tabla
      if (event.target.tagName === "TD") {
        // Obtiene las coordenadas de la celda
        let x = parseInt(event.target.textContent.split(",")[0]);
        let y = parseInt(event.target.textContent.split(",")[1]);
  
        // Agrega el muro en las coordenadas seleccionadas
        escenario[y][x].tipo = 1;
        dibujaMapa();
      }
    });
  });
  

//Validacion de coordenada
function isValidCoord(x, y) {
    return x >= 0 && x < columnas && y >= 0 && y < filas;
}
//Funcion para reinicial el algoritmo
function reiniciaAlgoritmo() {
    casillaAbierta = [principio];
    casillaCerrada = [];
    camino = [];
    terminado = false;
    dibujaMapa();
}
//Funcion del algoritmo A*
function algoritmo() {
    if (!terminado) { //verifica si el algoritmo ya ha terminado
        if (casillaAbierta.length > 0) { //comprueba si hay casillas que aún no han sido exploradas pero que son candidatas a formar parte del camino. 
            let ganador = 0; //representa la casilla ganadora y que sera sumada al costo real (Se elige el que tiene menor valor)
            for (let i = 0; i < casillaAbierta.length; i++) { //opsenSet son la casillas libres
                if (casillaAbierta[i].f < casillaAbierta[ganador].f) {
                    ganador = i;
                }
            }
            let actual = casillaAbierta[ganador];
            if (actual === fin) {
                let temporal = actual;
                camino.push(temporal);
                while (temporal.padre != null) {
                    temporal = temporal.padre;
                    camino.push(temporal);
                }
                terminado = true;
                console.log('camino encontrado');
                alert('camino encontrado');
            } else {
                borraDelArray(casillaAbierta, actual);
                casillaCerrada.push(actual);
                let vecinos = actual.vecinos;
                for (let i = 0; i < vecinos.length; i++) {
                    let vecino = vecinos[i];
                    if (!casillaCerrada.includes(vecino) && vecino.tipo != 1) {
                        let tempG = actual.g + 1;
                        if (casillaAbierta.includes(vecino)) {
                            if (tempG < vecino.g) {
                                vecino.g = tempG;
                            }
                        } else {
                            vecino.g = tempG;
                            casillaAbierta.push(vecino);
                        }
                        vecino.h = heuristicaManhattan(vecino, fin); //Llamamos a la funcion heuristicaManhattan
                        vecino.f = vecino.g + vecino.h;
                        vecino.padre = actual;
                    }
                }
            }
        } else {
            console.log('No hay un camino posible');
            alert('No hay un camino posible');
            terminado = true;
        }
    }
}
//Funcion principal para determinar el camino encontrado
function principal() {
    while (!terminado) {
        algoritmo();
    }
    dibujaMapa();
    imprimeResultado();
}
//Funcion para imprimir el resultado
function imprimeResultado() {
    let resultado = document.getElementById('resultado');
    resultado.innerHTML = 'Casilla visitadas:<br>';
    for (let i = camino.length - 1; i >= 0; i--) {
        resultado.innerHTML += `(${camino[i].x},${camino[i].y}) `;
    }
    resultado.innerHTML += '<br>Total de casilla visitadas: ' + camino.length;
}