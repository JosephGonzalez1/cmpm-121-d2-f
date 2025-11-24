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
let currentTool: "marker" | "sticker" = "marker";
let selectedSticker: string | null = null;

const updateToolButtons = () => {
  thinButton.classList.remove("selectedTool");
  thickButton.classList.remove("selectedTool");
  if (currentTool === "marker") {
    if (currentThickness === 2) thinButton.classList.add("selectedTool");
    else thickButton.classList.add("selectedTool");
  }
};

thinButton.addEventListener("click", () => {
  currentThickness = 2;
  currentTool = "marker";
  selectedSticker = null;
  updateToolButtons();
});

thickButton.addEventListener("click", () => {
  currentThickness = 8;
  currentTool = "marker";
  selectedSticker = null;
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

const exportButton = document.createElement("button");
exportButton.textContent = "Export";
document.body.append(exportButton);

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
  sticker: string | null = null;

  constructor(
    x: number,
    y: number,
    thickness: number,
    sticker: string | null = null,
  ) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
    this.sticker = sticker;
  }

  update(x: number, y: number, thickness: number, sticker: string | null) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
    this.sticker = sticker;
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.sticker) {
      ctx.font = `24px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.sticker, this.x, this.y);
    } else {
      ctx.beginPath();
      ctx.lineWidth = this.thickness;
      ctx.strokeStyle = "black";
      ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

class StickerCommand {
  x: number;
  y: number;
  sticker: string;

  constructor(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.sticker, this.x, this.y);
  }
}

const initialStickers: string[] = ["😀", "🌟", "🍕"];
const stickerButtons: HTMLButtonElement[] = [];

const addStickerButton = (emoji: string) => {
  const btn = document.createElement("button");
  btn.textContent = emoji;
  document.body.append(btn);
  stickerButtons.push(btn);
  btn.addEventListener("click", () => {
    currentTool = "sticker";
    selectedSticker = emoji;
    thinButton.classList.remove("selectedTool");
    thickButton.classList.remove("selectedTool");
    canvas.dispatchEvent(new Event("tool-moved"));
  });
};

initialStickers.forEach(addStickerButton);

const customStickerButton = document.createElement("button");
customStickerButton.textContent = "Custom Sticker";
document.body.append(customStickerButton);
customStickerButton.addEventListener("click", () => {
  const text = prompt("Custom sticker text", "🧽");
  if (text) addStickerButton(text);
});

const displayList: (MarkerLine | StickerCommand)[] = [];
const redoStack: (MarkerLine | StickerCommand)[] = [];

let currentCommand: MarkerLine | StickerCommand | null = null;
let preview: ToolPreview | null = null;

canvas.addEventListener("mousedown", (e) => {
  if (currentTool === "marker") {
    currentCommand = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
  } else if (currentTool === "sticker" && selectedSticker) {
    currentCommand = new StickerCommand(e.offsetX, e.offsetY, selectedSticker);
  }
  if (currentCommand) {
    displayList.push(currentCommand);
    redoStack.length = 0;
    preview = null;
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (currentCommand && currentTool === "marker") {
    currentCommand.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else if (!currentCommand) {
    if (!preview) {
      preview = new ToolPreview(
        e.offsetX,
        e.offsetY,
        currentTool === "marker" ? currentThickness : 0,
        selectedSticker,
      );
    } else {
      preview.update(
        e.offsetX,
        e.offsetY,
        currentTool === "marker" ? currentThickness : 0,
        selectedSticker,
      );
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

exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d")!;

  const scaleFactor = exportCanvas.width / canvas.width;
  exportCtx.scale(scaleFactor, scaleFactor);

  for (const command of displayList) {
    exportCtx.beginPath();
    command.display(exportCtx);
    exportCtx.stroke?.();
  }

  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});

const redraw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const command of displayList) {
    ctx.beginPath();
    command.display(ctx);
    ctx.stroke?.();
  }

  if (!currentCommand && preview) {
    preview.display(ctx);
  }
};

canvas.addEventListener("drawing-changed", redraw);
canvas.addEventListener("tool-moved", redraw);
