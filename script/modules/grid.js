import { Cell } from "./cell.js";

export class Grid {
	constructor(main) {
		this.data = [];
		this.main = main;

		for (let y = 0; y < this.size; y++) {
			this.data[y] = [];
			for (let x = 0; x < this.size; x++) {
				this.data[y][x] = new Cell(x, y, null, Cell.SET_BY_USER);
			}
		}
	}

	//#region Getters and setters
	get subGridCount() {
		return this.main.subGridCount;
	}

	set subGridCount(value) {
		this.main.subGridCount = value;
	}

	get subGridSize() {
		return this.main.subGridSize;
	}

	set subGridSize(value) {
		this.main.subGridSize = value;
	}

	get size() {
		return this.main.size;
	}

	set size(value) {
		this.main.size = value;
	}
	//#endregion

	//#region File loading
	async loadFile(filename) {
		this.data = [];

		// Request the file
		const file = await fetch(filename)
			.then((response) => response.text())
			.then((text) => text.split(/\r?\n/))
			.then((lines) => lines.map((line) => line.trim().split(" ")));

		this.size = file.length;
		this.subGridCount = Math.floor(Math.sqrt(file.length));
		this.subGridSize = Math.floor(Math.sqrt(file.length));

		// Parse the response
		for (let y = 0; y < file.length; y++) {
			this.data[y] = [];

			for (let x = 0; x < file[y].length; x++) {
				const char = file[y][x];

				if (char === "X") {
					// Empty cell
					this.data[y][x] = new Cell(x, y, null, Cell.SET_BY_USER);
				} else if (char >= "1" && char <= "9") {
					// Value cell
					this.data[y][x] = new Cell(
						x,
						y,
						parseInt(char),
						Cell.SET_BY_USER
					);
				}
			}
		}

		for (let y = 0; y < this.data.length; y++) {
			for (let x = 0; x < this.data[y].length; x++) {
				const cell = this.data[y][x];
				if (x !== cell.x || y !== cell.y) {
					console.warn("Cell coordinates are not correct!");
					console.warn(`Expected: (${x}, ${y})`);
					console.warn(`Actual: (${cell.x}, ${cell.y})`);
				}
			}
		}

		// Prints out the grid
		console.table(
			this.data.map((x) => x.map((y) => (y.value || " ").toString()))
		);

		// Checks if the grid is valid
		if (!this.isValid()) console.error("Invalid grid loaded!");
		else console.log(`%cGrid loaded successfully!`, "color: lime");
	}
	//#endregion

	//#region Positional helpers
	getCell(x, y) {
		// if (x >= this.size || y >= this.size || x < 0 || y < 0) return null;
		return this.data[y][x];
	}

	getCellByIndex(index) {
		const x = index % this.size;
		const y = Math.floor(index / this.size);

		return this.getCell(x, y);
	}

	isCellEmpty(x, y) {
		return this.getCell(x, y).isEmpty();
	}

	isCellNotEmpty(x, y) {
		return this.getCell(x, y).isNotEmpty();
	}

	setCell(x, y, value) {
		this.getCell(x, y).value = value;
	}
	//#endregion

	//#region Rendering
	#calculateFontSize({ width, height }) {
		const MIN = 8;
		const MAX = 24;
		const SMOOTH = 4;

		// Calculate based on the canvas size
		let viewport = (width + height) / 2;
		let size = Math.pow(viewport / 875, SMOOTH) * (MAX - MIN) + MIN;

		// Clamp values
		return Math.min(Math.max(size, MIN), MAX * 2);
	}

	/** @param {CanvasRenderingContext2D} ctx */
	render(ctx) {
		// Define constants
		const backgroundColor = "#2c3e50";
		const subGridStrokeColor = "#34495e";
		const gridStrokeColor = "#42586c";
		const cellTextColor = {
			[Cell.SET_BY_SOLVER]: "#7f8c8d",
			[Cell.SET_BY_USER]: "#ecf0f1",
		};

		// Draws background
		ctx.fillWithColor(backgroundColor);

		// Calculate the font size
		const fontSize = this.#calculateFontSize(ctx.canvas);
		ctx.font = `bold ${fontSize}pt 'Bebas Neue'`;

		// Calculate the cell size
		const cellSize = Math.floor(
			(ctx.canvas.width + ctx.canvas.height) / 2 / this.size
		);

		// Draws the sub grid
		this.#drawGrid(ctx, this.size, cellSize, subGridStrokeColor, 1.5);
		// Draws the grid
		this.#drawGrid(
			ctx,
			this.subGridCount,
			cellSize * this.subGridCount,
			gridStrokeColor,
			2.5
		);

		// Draws the cells
		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				const cell = this.getCell(x, y);
				if (!cell || cell.isEmpty()) continue;

				// Calculate the cell position
				const cellX = x * cellSize + cellSize / 2;
				const cellY = y * cellSize + cellSize / 2;

				// Draws text
				ctx.drawTextCentered(
					cellX,
					cellY,
					cell.value.toString(),
					cellTextColor[cell.setBy]
				);
			}
		}
	}

	#drawGrid(ctx, gridSize, cellSize, color, thickness) {
		ctx.strokeStyle = color;
		ctx.lineWidth = thickness;

		// Vertical lines
		for (let y = 0; y < gridSize; y++)
			ctx.drawLine(0, y * cellSize, gridSize * cellSize, y * cellSize);

		// Horizontal lines
		for (let x = 0; x < gridSize; x++)
			ctx.drawLine(x * cellSize, 0, x * cellSize, gridSize * cellSize);
	}
	//#endregion

	//#region Validation helpers
	isValid() {
		// Check if the grid is empty
		for (let y = 0; y < this.size; y++)
			if (!this.isRowValid(y)) return false;

		for (let x = 0; x < this.size; x++)
			if (!this.isColumnValid(x)) return false;

		for (let y = 0; y < this.subGridCount; y++)
			for (let x = 0; x < this.subGridSize; x++)
				if (!this.isSubGridValid(x, y)) return false;

		return true;
	}

	isRowValid(row) {
		const values = [];

		for (let y = 0; y < this.size; y++) {
			const cell = this.getCell(row, y);

			if (cell.isEmpty()) continue;

			// Check if the value is already in the row
			if (values.includes(cell.value)) return false;
			values.push(cell.value);
		}

		// No duplicates found, valid row
		return true;
	}

	isColumnValid(column) {
		const values = [];

		for (let x = 0; x < this.size; x++) {
			const cell = this.getCell(x, column);

			if (cell.isEmpty()) continue;

			// Check if the value is already in the column
			if (values.includes(cell.value)) return false;
			values.push(cell.value);
		}

		// No duplicates found, valid column
		return true;
	}

	isSubGridValid(row, column) {
		const values = [];

		for (let y = 0; y < this.subGridCount; y++) {
			for (let x = 0; x < this.subGridSize; x++) {
				const cell = this.getCell(
					row * this.subGridSize + x,
					column * this.subGridCount + y
				);

				if (cell.isEmpty()) continue;

				// Check if the value is already in the sub grid
				if (values.includes(cell.value)) return false;
				values.push(cell.value);
			}
		}

		// No duplicates found, valid sub grid
		return true;
	}
	//#endregion
}