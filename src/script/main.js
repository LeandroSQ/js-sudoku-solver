import { Canvas } from "./modules/canvas.js";
import { Grid } from "./modules/grid.js";
import { Solver } from "./modules/solver.js";

class Main {
	constructor() {
		// (3 x 3)
		this.subGridSize = 3;
		this.subGridCount = 3;
		this.gridSize = this.subGridSize * this.subGridCount;

		// Components
		this.canvas = new Canvas(this);
		this.grid = new Grid(this);
		this.solver = new Solver(this);

		// Setup
		this.#setup();
	}

	async #setup() {
		await this.grid.loadFile("./../data/1.txt");

		this.#invalidate();
	}

	render(invalidate = true) {
		const ctx = this.canvas.ctx;

		this.grid.render(ctx);

		if (invalidate) this.#invalidate();
	}

	#invalidate() {
		requestAnimationFrame(this.render.bind(this));
	}
}


// Runtime
new Main();
