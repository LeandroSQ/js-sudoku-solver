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
		await this.grid.loadFile("data/1.txt");

		this.#waitForFonts();
	}

	#waitForFonts() {
		const font = this.canvas.font;
		console.log(font);

		// Waits for the page to load
		window.addEventListener("load", async () => {
			if (!document.fonts.check(font))
				await document.fonts.load(font);

			this.invalidate();
		});
	}

	render() {
		this.grid.render(this.canvas);

		// TODO: Remove this
		if (window.screenshot === true) {
			const url = this.canvas.element.toDataURL("image/png");
			const a = document.createElement("a");
			a.style.display = "none";
			a.setAttribute("download", "");
			a.href = url;
			document.body.appendChild(a);
			a.click();
			a.parentElement.removeChild(a);

			window.screenshot = false;
		}


		this.invalidate();
	}

	invalidate() {
		requestAnimationFrame(this.render.bind(this));
	}
}


// Runtime
new Main();
