import { Cell } from "./cell.js";

export class Solver {

	constructor(main) {
		this.main = main;
		this.cache = null;
		this.empty = [];
		this.iterations = 0;
		this.backtracks = 0;
	}

	get grid() {
		return this.main.grid;
	}
	get canvas() {
		return this.main.canvas;
	}

	clearSolution() {
		this.cache = null;
		this.empty = [];
		this.iterations = 0;
		this.backtracks = 0;

		// Removes all the guesses made by the solver
		for (let y = 0; y < this.grid.size; y++) {
			for (let x = 0; x < this.grid.size; x++) {
				const cell = this.grid.getCell(x, y);

				if (cell.isNotEmpty() && cell.setBy == Cell.SET_BY_SOLVER)
					cell.value = null;
			}
		}
	}

	#preCachePossibilities() {
		// Purge cache
		this.cache = { };

		// Find all empty cells
		const cells = this.grid.data.map(row => row.filter(cell => cell.isEmpty())).flat();

		// Save all the empty cells
		this.empty = cells;

		// For each empty cell, find all possible values
		for (const cell of cells) {
			const id = `${cell.x},${cell.y}`;

			this.cache[id] = this.#findPossibleValues(cell);
		}
	}

	async solve() {
		if (!this.cache) this.#preCachePossibilities();

		// Solve the grid
		// 1. Find the first empty cell
		// 2. Find all possible values for the cell
		// 3. For each possible value
		//    a. Set the value
		//    b. Solve the grid
		//    c. If the grid is solved, return
		//    d. If the grid is not solved, reset the value and go to step 1
		// 4. If no value can be set, return false

		// Find the first empty cell
		let cell = this.#findFirstEmptyCell();

		// If the grid is solved, return
		if (!cell) {
			console.log(`Grid solved!`);
			console.log(this.grid.isValid());
			return true;
		}

		// Find all possible values for the cell
		const possibleValues = this.#findPossibleValues(cell);

		// For each possible value
		for (let i = 0; i < possibleValues.length; i++) {
			// Remove from the empty cell list
			this.empty.splice(this.empty.indexOf(cell), 1);

			// Set the value
			cell.value = possibleValues[i];
			cell.setBy = Cell.SET_BY_SOLVER;

			// Render the grid again
			setTimeout(() => this.main.invalidate(), 0);

			// Solve the grid
			if (await this.postSolve(0)) return true;

			// If the grid is not solved, reset the value and go to step 1
			cell.value = null;

			// Add it to the empty cell list
			this.empty.push(cell);
		}
	}

	async postSolve(delay) {
		// Wait for the delay
		await new Promise((resolve) => setTimeout(resolve, delay));

		// Render the grid
		return await this.solve();
	}

	#findFirstEmptyCell() {
		if (this.cache) {
			// Find the empty cell with the lowest number of possible values
			let cell = null;
			let minPossibleValues = Infinity;

			for (const c of this.empty) {
				const id = `${c.x},${c.y}`;
				const possibleValues = this.cache[id];

				if (possibleValues.length < minPossibleValues) {
					cell = c;
					minPossibleValues = possibleValues.length;
				}
			}

			if (cell) return cell;
		} else {
			// If the cache is not available, find the first empty cell by brute force
			for (let y = 0; y < this.grid.size; y++) {
				for (let x = 0; x < this.grid.size; x++) {
					// Top-left
					const cell = this.grid.getCell(x, y);

					if (cell.isEmpty()) return cell;
				}
			}
		}

		return null;
	}

	#findPossibleValues(cell) {
		// Check cache first
		const id = `${cell.x},${cell.y}`;
		if (this.cache[id]) return this.cache[id];

		// Otherwise find all possible values within the cell's row, column, and subgrid
		const possibleValues = [];

		nearest_loop:
		for (let n = 1; n <= 9; n++) {
			// Check if the number appears on the row already
			for (let y = 0; y < this.grid.size; y++) {
				const c = this.grid.getCell(cell.x, y);
				if (c && c.value === n) continue nearest_loop;
			}

			// Check if the number appears on the column already
			for (let x = 0; x < this.grid.size; x++) {
				const c = this.grid.getCell(x, cell.y);
				if (c && c.value === n) continue nearest_loop;
			}

			// Check if the number appears on the sub grid already
			const subGridX = Math.floor(cell.x - (cell.x % this.main.subGridSize));
			const subGridY = Math.floor(cell.y - (cell.y % this.main.subGridCount));
			for (let y = 0; y < this.main.subGridCount; y++) {
				for (let x = 0; x < this.main.subGridSize; x++) {
					const c = this.grid.getCell(x + subGridX, y + subGridY);
					if (c && c.value === n) continue nearest_loop;
				}
			}

			// If we got here, the number is not in the row, column or sub grid
			possibleValues.push(n);
		}

		return possibleValues;
	}

}