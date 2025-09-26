
//Obtengo al id juego
//Defino ctx con canvas dibujo y obtengo el contexto 2d 
const canvas = document.getElementById('juego');
const ctx = canvas.getContext('2d');


let puntaje = 0;
//inserto la imagen de fondo
const fondo = new Image();
fondo.src = 'img/fondo.png';

//inserto el avatar
const Imgjugador = new Image();
Imgjugador.src = 'img/avatar.png'

//inserto la imagen del jugador muerto cuando muere
const imgjugadormuerto = new Image();
imgjugadormuerto.src = 'img/avatarmuerto.png'

const btnPausa = document.getElementById("btnPausa");
const btnPlay = document.getElementById("btnPlay");
const btnReiniciar = document.getElementById("btnReiniciar");
const pantallaInicio = document.getElementById("pantallaInicio");
const pantallaReinicio = document.getElementById("pantallaReinicio");


//creo la posicion X desde 0 
let fondoX = 0;

//le digo que sea en velocidad 6
let velocidad = 6;

//defino las posiciones del jugador, le doy el tamaño, inserto  una booleana como bandera,
//le digo que la velocidadY comenzara desde 0, le doy una gravedad de 0.8 para la caida
//del salto,  y un alpha para la opacidad cuando el jugador colisiona(estrella). 
let jugador = {
    x: 50,
    y: 490,
    ancho: 50,
    alto: 50,
    salto: false,
    velY: 0,
    gravedad: 0.8,
    alpha: 1
};

//defino un array de imagenes y convierto los strings osea las rutas
//en imagenes con el metodo map dentro de ahi asigno el array de imagenes que tengo en src a img 
//y devuelvo el objeto con return
let image = ['img/monstruo 2.gif', 'img/monstruo 2.png', 'img/monstruo 3.png', 'img/monstruo 4.png', 'img/monstruo 5.png', 'img/monstruo 6.png', 'img/monstruo 7.png'].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});
//inserto el enemigo y le doy las dimensiones
let enemigoU = { x: canvas.width, y: 450, ancho: 100, alto: 100, velX: 12, img: image[Math.floor(Math.random() * image.length)] };
//inserto la cara de broma que saldra si el jugador colisiona
const caragay = new Image();
caragay.src = 'carag.jpg';
let cara = { x: 500, y: 100, ancho: 400, alto: 300 };
//pongo la musica que saldra junto ala cara G
let gay = new Audio('gay.mp3');
//texto que aparece cuando el jugador colisiona
let textoAlpha = 0;
//booleana que servira como bandera para mostrar el textoalpha
let mostrarTexto = false;
//llamo al dom y le digo que cuando presione la tecla de arriba
//y no esta saltando entonces,jugador.salto es verdadero se activa la bandera
//y el jugador se impulza hacia arriba en la posicionY menos 15 pixeles es decir
//!jugador salto es verdadero solo si jugador.salto es falso asi evita que salte mientras ya esta
//en el aire 
document.addEventListener("keydown", (e) => {
    if (e.key == 'ArrowUp' && !jugador.salto) {
        jugador.velY = -15; // impulso inicial hacia arriba
        jugador.salto = true;
    }

});
// Para dispositivos móviles: saltar al tocar la pantalla
canvas.addEventListener("touchstart", () => {
    if (!jugador.salto && !pausado && !juegoTerminado) {
        jugador.velY = -15; // mismo impulso que con la tecla
        jugador.salto = true;
    }
});

//definimos las colisiones el jugador
function colisiona(a, b) {
    return (
        a.x < b.x + b.ancho &&
        a.x + a.ancho > b.x &&
        a.y < b.y + b.alto &&
        a.y + a.alto > b.y
    );
}
let pausado = false;



let juegoTerminado = false;

let jugadorAlpha = 1; // Transparencia inicial (1 = visible)
let iniciado = false;

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(fondo, fondoX, 0, canvas.width, canvas.height);
    ctx.drawImage(fondo, fondoX + canvas.width, 0, canvas.width, canvas.height);

    if (pausado) {
        if (!musica.paused) musica.pause(); // pausa solo si está sonando
        requestAnimationFrame(loop);
        return;
    } else {
        if (musica.paused && iniciado && !juegoTerminado) {
            musica.play(); // reanuda solo si debe sonar
        }
    }

    if (!iniciado) {
        requestAnimationFrame(loop);
        return;
    }

    if (!juegoTerminado) {
        // Dibujar jugador solo si es visible
        ctx.save();
        ctx.globalAlpha = jugadorAlpha;
        ctx.drawImage(Imgjugador, jugador.x, jugador.y, jugador.ancho, jugador.alto);
        ctx.restore();

        fondoX -= velocidad;
        if (fondoX <= -canvas.width) {
            fondoX = 0;
            velocidad++;
        }

        jugador.velY += jugador.gravedad;
        jugador.y += jugador.velY;
        if (jugador.y >= 490) {
            jugador.y = 490;
            jugador.velY = 0;
            jugador.salto = false;
        }

        enemigoU.x -= enemigoU.velX;
        if (enemigoU.x + enemigoU.ancho < 0) {
            enemigoU.x = canvas.width + Math.random() * 200;
            enemigoU.img = image[Math.floor(Math.random() * image.length)];
            enemigoU.velX++;
            aumentarVelocidadMusica();

            // sumar puntos
            puntaje++;
            document.getElementById("marcador").textContent = "Puntos: " + puntaje;
        }
        ctx.drawImage(enemigoU.img, enemigoU.x, enemigoU.y, enemigoU.ancho, enemigoU.alto);

        if (colisiona(jugador, enemigoU)) {
            canvas.classList.add('colision');
            juegoTerminado = true;
            musica.pause();
            gay.currentTime = 0;
            gay.play();

            mostrarCaraConTransicion();
            mostrarTextoPocoAPoco();
            // Mostrar reinicio después de 5 segundos
            setTimeout(() => {
                pantallaReinicio.classList.remove("oculto");
            }, 1000); // 10000 ms = 5s
            console.log('mucho gay si pierde')
        }
    } else {
        // Reducir transparencia gradualmente
        if (jugadorAlpha > 0) {
            jugadorAlpha -= 0.02; // Velocidad del fade out
            if (jugadorAlpha < 0) jugadorAlpha = 0;
        }

        // Dibujar jugador muerto con transparencia
        ctx.save();
        ctx.globalAlpha = jugadorAlpha;
        ctx.drawImage(imgjugadormuerto, jugador.x, jugador.y, jugador.ancho, jugador.alto);
        ctx.restore();

        ctx.drawImage(enemigoU.img, enemigoU.x, enemigoU.y, enemigoU.ancho, enemigoU.alto);
        // Imagen caragay
        ctx.drawImage(caragay, cara.x, cara.y, cara.ancho, cara.alto);
    }

    // Texto encima de caragay
    if (mostrarTexto) {
        ctx.save();
        ctx.globalAlpha = textoAlpha;
        ctx.font = "bold 48px Impact";
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.textAlign = "center";
        ctx.fillText("!!!Ayyyy Muyyy Gayyyyyy!!!", cara.x + cara.ancho / 2, cara.y - 20);
        ctx.strokeText("!!!Ayyyy Muyyy Gayyyyyy!!!", cara.x + cara.ancho / 2, cara.y - 20);
        ctx.restore();
    }

    // Dibujar firma en la esquina inferior izquierda
    ctx.font = "20px Cursive"; // Puedes cambiar la fuente
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "left";  // Alineado a la izquierda
    ctx.fillText("Johan yt", 10, canvas.height - 10); // 10px desde el borde


    requestAnimationFrame(loop);
}


let musica = new Audio('musica.mp3');
musica.loop = true; // Para que siga sonando
musica.playbackRate = 1; // Velocidad normal



function mostrarCaraConTransicion() {
    let alpha = 0; // Empieza invisible
    let intervalo = setInterval(() => {
        ctx.clearRect(cara.x, cara.y, cara.ancho, cara.alto); // Limpia área
        ctx.globalAlpha = alpha; // Ajusta transparencia
        ctx.drawImage(caragay, cara.x, cara.y, cara.ancho, cara.alto);
        ctx.globalAlpha = 1; // Restaura opacidad para otros elementos
        alpha += 0.05; // Aumenta opacidad

        if (alpha >= 1) {
            clearInterval(intervalo); // Detiene cuando es totalmente visible
        }
    }, 1000); // Cada 30 ms (0.03s)
}



function mostrarTextoPocoAPoco() {
    textoAlpha = 0;
    mostrarTexto = true;

    let animacionTexto = setInterval(() => {
        textoAlpha += 0.05;
        if (textoAlpha >= 1) {
            textoAlpha = 1;
            clearInterval(animacionTexto);
        }
    }, 300);
}


// Función para aumentar velocidad
function aumentarVelocidadMusica() {
    // Aumenta de a 0.05 hasta un límite de 2x
    if (musica.playbackRate < 2) {
        musica.playbackRate += 0.05;
    }
}

//cargo el fondo y le asigno el bucle
fondo.onload = loop;

// --- BOTONES ---
btnPlay.addEventListener("click", () => {
    iniciado = true;
    musica.currentTime = 0;
    musica.play();
    pantallaInicio.classList.add("oculto");
    btnPausa.classList.remove("oculto");
});

btnPausa.addEventListener("click", () => {
    if (juegoTerminado) return; //  no hace nada si ya perdió

    pausado = !pausado;
    btnPausa.textContent = pausado ? "Reanudar" : "Pausar";


});

btnReiniciar.addEventListener("click", () => {
    // Reiniciar variables del jugador
    jugador.x = 50;
    jugador.y = 490;
    jugador.velY = 0;
    jugador.salto = false;

    // Reiniciar enemigo
    enemigoU.x = canvas.width;
    enemigoU.velX = 12;

    // Reiniciar fondo y velocidad
    velocidad = 6;
    fondoX = 0;

    // Reiniciar estado
    juegoTerminado = false;
    jugadorAlpha = 1; //  vuelve visible el avatar
    textoAlpha = 0;
    mostrarTexto = false;

    // Ocultar pantalla de reinicio
    pantallaReinicio.classList.add("oculto");

    // Reiniciar música
    musica.pause();
    musica.currentTime = 0;
    musica.playbackRate = 1; //  vuelve a velocidad normal
    musica.play();
    gay.pause();
    gay.currentTime = 0;

    //reomver clase colision
    canvas.classList.remove("colision");
    //reiniciar marcador
    puntaje = 0;
    document.getElementById("marcador").textContent = "Puntos: " + puntaje;


});