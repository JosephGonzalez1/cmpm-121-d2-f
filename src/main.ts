import "./style.css";

const title = document.createElement("h1");
title.textContent = "My Drawing App";
document.body.append(title);

const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
document.body.append(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
document.body.append(thickButton);

let currentThickness = 2;

const updateToolButtons = () => {
  thinButton.classList.remove("selectedTool");
  thickButton.classList.remove("selectedTool");
  if (currentThickness === 2) thinButton.classList.add("selectedTool");
  else thickButton.classList.add("selectedTool");
};

thinButton.addEventListener("click", () => {
  currentThickness = 2;
  updateToolButtons();
});

thickButton.addEventListener("click", () => {
  currentThickness = 8;
  updateToolButtons();
});

updateToolButtons();

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

class MarkerLine {
  points: Point[];
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.points = [{ x, y }];
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;
    ctx.lineWidth = this.thickness;
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
  }
}

const displayList: MarkerLine[] = [];
let currentCommand: MarkerLine | null = null;

const redoStack: MarkerLine[] = [];

canvas.addEventListener("mousedown", (e) => {
  currentCommand = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
  displayList.push(currentCommand);
  redoStack.length = 0;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (!currentCommand) return;
  currentCommand.drag(e.offsetX, e.offsetY);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
  currentCommand = null;
});

canvas.addEventListener("mouseleave", () => {
  currentCommand = null;
});

clearButton.addEventListener("click", () => {
  displayList.length = 0;
  redoStack.length = 0;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

undoButton.addEventListener("click", () => {
  if (displayList.length === 0) return;
  const removed = displayList.pop()!;
  redoStack.push(removed);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

redoButton.addEventListener("click", () => {
  if (redoStack.length === 0) return;
  const restored = redoStack.pop()!;
  displayList.push(restored);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const command of displayList) {
    ctx.beginPath();
    command.display(ctx);
    ctx.stroke();
  }
});
