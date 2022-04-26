export class Theme {

    constructor(main) {
        this.main = main;

        this.#loadVariables();
        this.#observeChanges();
    }

    #loadVariables() {
        const style = getComputedStyle(document.body);
        const variables = [
            `--background`,
            `--board-background`,
            `--board-grid-color`,
            `--board-subgrid-color`,
            `--board-text-color`,
            `--board-guess-color`,
        ];

        console.groupCollapsed(`Loading theme variables`);

        for (const variable of variables) {
            // Get the variable value
            const value = style.getPropertyValue(variable);
            const name = this.#convertKebabCaseToCamelCase(variable);

            this[name] = value;
            
            console.log(`%c${name}`, `color: ${this.#isColorLight(value) ? '#212121' : '#eee'}; background-color: ${value}`);
        }

        console.groupEnd();
    }

    #observeChanges() {
        window.matchMedia("(prefers-color-scheme: dark)")
              .addEventListener("change", () => {
                    this.#loadVariables();
                    this.main.invalidate();
              });
    }

    #convertKebabCaseToCamelCase(input) {
        return input.replace(`--`, ``)
                    .replace(/-./g, x => x[1].toUpperCase());
    }

    #isColorLight(hex) {
		const color = +("0x" + hex.trim().slice(1).replace(hex.length < 5 && /./g, "$&$&"));

		const r = color >> 16;
		const g = (color >> 8) & 255;
		const b = color & 255;

		// HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
		const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

        return hsp > 127.5;
	}

    getCellTextColor(cell) {
        if (cell.isSetByUser()) {
			return this.boardTextColor;
		} else if (cell.isSetBySolver()) {
			return this.boardGuessColor;
		}
    }

}