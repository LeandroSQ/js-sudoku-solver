import { Canvas } from "./modules/canvas.js";
import { Grid } from "./modules/grid.js";
import { Solver } from "./modules/solver.js";
import { Theme } from "./modules/theme.js";

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
		this.theme = new Theme(this);

		// Setup
		this.#setup();
	}

	async #setup() {
		await this.grid.loadFile("data/2.txt");

		this.#waitForFonts();
	}

	#waitForFonts() {
		// Waits for the page to load
		window.addEventListener("load", async () => {
			const font = this.canvas.font;

			if (!document.fonts.check(font))
				await document.fonts.load(font);

			this.invalidate();
		});
	}

	render() {
		this.grid.render(this.canvas);

		//this.invalidate();
	}

	invalidate() {
		requestAnimationFrame(this.render.bind(this));
	}

}


// Runtime
new Main();
