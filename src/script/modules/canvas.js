export class Canvas {
	constructor(main) {
		// Get elements
		this.element = document.getElementById("canvas");
		this.ctx = this.element.getContext("2d");
		this.main = main;

		// Set canvas size
		this.#setupSize();

		// Attach hooks
		this.#attachHooks();
	}

	#setupSize() {
		// Set the canvas size
		const screen = {
			x: document.body.clientWidth,
			y: document.body.clientHeight,
		};

		const cell = {
			x: screen.x / this.main.gridSize,
			y: screen.y / this.main.gridSize,
		};

		if (cell.x > cell.y) {
			cell.x = cell.y;
		} else {
			cell.y = cell.x;
		}

		canvas.width = cell.x * this.main.gridSize;
		canvas.height = cell.y * this.main.gridSize;
	}

	#onResizeHook() {
		this.#setupSize();

		CanvasRenderingContext2D.purgeCache();

		this.main.render(false);
	}

	#onClickHook() {
		console.log("Solving...");
		this.main.solver.clearSolution();
		this.main.solver.solve();
	}

	#attachHooks() {
		// Attach resize hook
		window.addEventListener("resize", this.#onResizeHook.bind(this));

		this.element.addEventListener("click", this.#onClickHook.bind(this));
	}

	screenshot() {
		// Get the image data
		const data = this.element.toDataURL("image/png");

		// Create a new anchor element
		const link = document.createElement("a");
		link.style.display = "none";
		link.href = data;
		link.download = "sudoku.png";

		// Append to the document, simulate click and then remove it
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	get font() {
		const MIN = 8;
		const MAX = 24;
		const SMOOTH = 4;

		// Calculate based on the canvas size
		const viewport = (this.width + this.height) / 2;
		const fontSize = Math.pow(viewport / 875, SMOOTH) * (MAX - MIN) + MIN;

		// Clamp values
		const clampedFontSize = Math.floor(Math.min(Math.max(fontSize, MIN), MAX * 2));

		return `bold ${clampedFontSize}pt 'Bebas Neue'`;
	}

	get width() {
		return this.element.width;
	}

	get height() {
		return this.element.height;
	}

	get context() {
		return this.ctx;
	}
}

// Extensions
CanvasRenderingContext2D.prototype.fillWithColor = function(color) {
	this.fillStyle = color;
	this.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

CanvasRenderingContext2D.prototype.drawLine = function(x1, y1, x2, y2, color = null, thickness = null) {
	if (color) this.strokeStyle = color;
	if (thickness) this.lineWidth = thickness;

	this.beginPath();
	this.moveTo(x1, y1);
	this.lineTo(x2, y2);
	this.stroke();
};

// Caching the measurements
CanvasRenderingContext2D._measurementsCache = [];
CanvasRenderingContext2D.purgeCache = function() {
	CanvasRenderingContext2D._measurementsCache = [];
};

CanvasRenderingContext2D.prototype.drawTextCentered = function(x, y, text, color = null, font = null) {
	if (color) this.fillStyle = color;
	if (font) this.font = font;

	// Caches the font measurements
	let measurements = null;
	if (CanvasRenderingContext2D._measurementsCache[text]) {
		measurements = CanvasRenderingContext2D._measurementsCache[text];
	} else {
		measurements = this.measureText(text);
		measurements = {
			horizontal: measurements.width / 2,
			vertical: (measurements.actualBoundingBoxAscent + measurements.actualBoundingBoxDescent) / 2
		};

		CanvasRenderingContext2D._measurementsCache[text] = measurements;
	}

	this.fillText(text, x - measurements.horizontal, y + measurements.vertical);
};
