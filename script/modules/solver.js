import { Cell } from "./cell.js";

export class Solver {
	constructor(main) {
		this.main = main;
	}

	get grid() {
		return this.main.grid;
	}
	get canvas() {
		return this.main.canvas;
	}

	clearSolution() {
		for (let y = 0; y < this.grid.size; y++) {
			for (let x = 0; x < this.grid.size; x++) {
				const cell = this.grid.getCell(x, y);

				if (cell.isNotEmpty() && cell.setBy == Cell.SET_BY_SOLVER)
					cell.value = null;
			}
		}
	}

	async solve() {
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
			// Set the value
			cell.value = possibleValues[i];
			cell.setBy = Cell.SET_BY_SOLVER;

			this.main.render(false);

			// Solve the grid
			if (await this.postSolve(0)) return true;

			// If the grid is not solved, reset the value and go to step 1
			cell.value = null;
		}
	}

	async postSolve(delay) {
		// Wait for the delay
		await new Promise((resolve) => setTimeout(resolve, delay));

		// Render the grid
		return await this.solve();
	}

	#findFirstEmptyCell() {
		const random = Math.random();

		if (random <= 0.33) {
			for (let y = this.grid.size - 1; y >= 0; y--) {
				for (let x = this.grid.size - 1; x >= 0; x--) {
					const cell = this.grid.getCell(x, y);

					if (cell.isEmpty()) return cell;
				}
			}
		} else if (random <= 0.66) {
			for (let y = 0; y < this.grid.size; y++) {
				for (let x = 0; x < this.grid.size; x++) {
					const cell = this.grid.getCell(x, y);

					if (cell.isEmpty()) return cell;
				}
			}
		} else {
			// Randomly pick an empty cell from the grid
			const cells = [];

			for (let y = 0; y < this.grid.size; y++) {
				for (let x = 0; x < this.grid.size; x++) {
					const cell = this.grid.getCell(x, y);

					if (cell.isEmpty()) cells.push(cell);
				}
			}

			if (cells.length > 0) {
				const cell = cells[Math.floor(Math.random() * cells.length)];

				return cell;
			}
		}

		return null;
	}

	#findPossibleValues(cell) {
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