const checkText = (input) => {
	if (typeof input !== "string" || !input.trim().length) {
		return console.log(
			"\n\x1B[31mThat is not a valid entry. This must contain characters"
		);
	} else {
		return true;
	}
};

const checkSalary = (input) => {
	const numbers = /^[0-9]*$/g;
	const characters = /^[a-z!@#$%^&*()_=\-=\[\]{};':"\\|,.<>\/?]*$/gi;
	if (numbers.test(input) && !numbers.test(characters)) {
		return true;
	} else {
		return console.log(
			"\n\x1B[31mThat is not a valid entry. Please input salary only in numerical values without any other type of character"
		);
	}
};

module.exports = { checkText, checkSalary };