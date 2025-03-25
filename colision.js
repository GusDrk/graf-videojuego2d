const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.cursor = "none";

let clickedImagesCount = 0;
document.body.insertAdjacentHTML("beforeend", "<div id='counter' style='color: white; font-size: 20px; position: absolute; top: 10px; left: 10px;'>Imágenes clickeadas: 0</div>");

let audio = new Audio("fondo.mp3");
audio.loop = true;
audio.play();

let explosionSound = new Audio("muerte.mp3");
document.addEventListener("click", () => {
    if (audio.paused) {
        audio.play();
    }
});

const imageSrc = "bit.gif";
const cursorSrc = "punteria.png";
const image = new Image();
image.src = imageSrc;

const cursorImage = new Image();
cursorImage.src = cursorSrc;

class FloatingImage {
    constructor(x, y, size, speedX, speedY, type) {
        this.posX = x;
        this.posY = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.clicked = false;
        this.angle = 0;
        this.type = type; 
        this.centerX = x;
        this.centerY = y;
        this.radius = Math.random() * 50 + 30;
    }

    draw(context) {
        if (!this.clicked) {
            context.drawImage(image, this.posX, this.posY, this.size, this.size);
        }
    }

    update(context) {
        if (this.clicked) return false;
        
        switch (this.type) {
            case "up":
                this.posY -= this.speedY;
                break;
            case "down":
                this.posY += this.speedY;
                break;
            case "diagonal":
                this.posX += this.speedX;
                this.posY += this.speedY;
                break;
            case "circular":
                this.angle += 0.05;
                this.posX = this.centerX + Math.cos(this.angle) * this.radius;
                this.posY = this.centerY + Math.sin(this.angle) * this.radius;
                break;
        }
        
        this.draw(context);
        return this.posY < window_height && this.posX < window_width && this.posX > 0 && this.posY > 0;
    }

    isClicked(x, y) {
        return (
            x >= this.posX && x <= this.posX + this.size &&
            y >= this.posY && y <= this.posY + this.size
        );
    }
}

let floatingImages = [];

function generateImage() {
    let size = Math.random() * 50 + 30;
    let x = Math.random() * (window_width - size);
    let y = Math.random() * (window_height - size);
    let speedX = Math.random() * 4 + 1;
    let speedY = Math.random() * 4 + 1;
    let types = ["up", "down", "diagonal", "circular"];
    let type = types[Math.floor(Math.random() * types.length)];
    
    floatingImages.push(new FloatingImage(x, y, size, speedX, speedY, type));
}

function animate() {
    ctx.clearRect(0, 0, window_width, window_height);
    floatingImages = floatingImages.filter(image => image.update(ctx));
    
    ctx.drawImage(cursorImage, mouseX - 15, mouseY - 15, 30, 30);
    
    requestAnimationFrame(animate);
}

let mouseX = 0, mouseY = 0;
document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    floatingImages.forEach(img => {
        if (img.isClicked(mouseX, mouseY) && !img.clicked) {
            img.clicked = true;
            explosionSound.currentTime = 0;
            explosionSound.play();
            clickedImagesCount++;
            document.getElementById("counter").innerText = `Imágenes clickeadas: ${clickedImagesCount}`;
        }
    });
});

setInterval(generateImage, 1000);
animate();