import "./style.css";

const title = document.createElement("h1");
title.textContent = "My Drawing App";
document.body.appendChild(title);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.classList.add("drawing-canvas");
document.body.appendChild(canvas);
