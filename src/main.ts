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

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
document.body.append(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
document.body.append(redoButton);

type Point = { x: number; y: number };

const strokes: Point[][] = [];
let currentStroke: Point[] | null = null;

const redoStack: Point[][] = [];

canvas.addEventListener("mousedown", (e) => {
  currentStroke = [{ x: e.offsetX, y: e.offsetY }];
  strokes.push(currentStroke);
  redoStack.length = 0;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (!currentStroke) return;
  currentStroke.push({ x: e.offsetX, y: e.offsetY });
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
  currentStroke = null;
});

canvas.addEventListener("mouseleave", () => {
  currentStroke = null;
});

clearButton.addEventListener("click", () => {
  strokes.length = 0;
  redoStack.length = 0;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

undoButton.addEventListener("click", () => {
  if (strokes.length === 0) return;
  const removed = strokes.pop()!;
  redoStack.push(removed);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

redoButton.addEventListener("click", () => {
  if (redoStack.length === 0) return;
  const restored = redoStack.pop()!;
  strokes.push(restored);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  for (const stroke of strokes) {
    if (stroke.length < 2) continue;
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i].x, stroke[i].y);
    }
  }
  ctx.stroke();
});
