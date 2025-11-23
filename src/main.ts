import "./style.css";

const title = document.createElement("h1");
title.textContent = "My Drawing App";
document.body.append(title);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.classList.add("drawing-canvas");
document.body.append(canvas);

const ctx = canvas.getContext("2d")!;
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
document.body.append(clearButton);

let drawing = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
});

canvas.addEventListener("mouseleave", () => {
  drawing = false;
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
