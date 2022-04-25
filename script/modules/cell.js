export class Cell {
	constructor(x, y, value, setBy = Cell.SET_BY_USER) {
		this.x = x;
		this.y = y;
		this.value = value;
		this.setBy = setBy;
	}

	isEmpty() {
		return this.value === null || this.value <= 0 || this.value > 9;
	}

	isNotEmpty() {
		return !this.isEmpty();
	}

	isSetByUser() {
		return this.setBy === Cell.SET_BY_USER;
	}

	isSetBySolver() {
		return this.setBy === Cell.SET_BY_SOLVER;
	}
}
Cell.SET_BY_USER = 0;
Cell.SET_BY_SOLVER = 1;