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

class ToolPreview {
  x: number;
  y: number;
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
  }

  update(x: number, y: number, thickness: number) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

const displayList: MarkerLine[] = [];
const redoStack: MarkerLine[] = [];

let currentCommand: MarkerLine | null = null;
let preview: ToolPreview | null = null;

canvas.addEventListener("mousedown", (e) => {
  currentCommand = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
  displayList.push(currentCommand);
  redoStack.length = 0;
  preview = null;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (currentCommand) {
    currentCommand.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else {
    if (!preview) {
      preview = new ToolPreview(e.offsetX, e.offsetY, currentThickness);
    } else {
      preview.update(e.offsetX, e.offsetY, currentThickness);
    }
    canvas.dispatchEvent(new Event("tool-moved"));
  }
});

canvas.addEventListener("mouseup", () => {
  currentCommand = null;
});

canvas.addEventListener("mouseleave", () => {
  currentCommand = null;
  preview = null;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

clearButton.addEventListener("click", () => {
  displayList.length = 0;
  redoStack.length = 0;
  preview = null;
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

const redraw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const command of displayList) {
    ctx.beginPath();
    command.display(ctx);
    ctx.stroke();
  }

  if (!currentCommand && preview) {
    preview.display(ctx);
  }
};

canvas.addEventListener("drawing-changed", redraw);
canvas.addEventListener("tool-moved", redraw);
