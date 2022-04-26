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

        for (const variable of variables) {
            // Get the variable value
            const value = style.getPropertyValue(variable);
            const name = this.#convertKebabCaseToCamelCase(variable);

            this[name] = value;
            console.log(`${name}: ${value}`);
        }
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

    getCellTextColor(cell) {
        if (cell.isSetByUser()) {
			return this.boardTextColor;
		} else if (cell.isSetBySolver()) {
			return this.boardGuessColor;
		}
    }

}