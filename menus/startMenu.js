const inquirer = require("inquirer");
const data = require("../config/connection");
const tables = require("console.table");
const util = require("util");
const db = util.promisify(data.query).bind(data);

function startMenu() {
	inquirer
		.prompt([
			{
				type: "list",
				message: "What would you like to view?",
				choices: ["Departments", "Roles", "Employees", "Quit"],
				name: "sectionChoice",
			},
		])
		.then((answer) => {
			switch (answer.sectionChoice) {
				case "Departments":
					departmentsMenu();
					break;

				case "Roles":
					roleMenu();
					break;

				case "Employees":
					console.log("Employees chosen");

					break;

				case "Quit":
					console.log("Exiting Program");
					process.exit();
					return;

					break;

				default:
					console.error("\x1b31mSomething went wrong");
					break;
			}
		});
}

const departmentsMenu = async () => {
	const departments = await db("SELECT name AS Departments FROM department");

	console.table("\n", departments);

	const answer = await inquirer.prompt([
		{
			type: "list",
			message: "Which would you like to do?",
			choices: [
				"View Department Summary",
				"Add Department",
				"Remove Department",
				"Back to main menu",
			],
			name: "choice",
		},
	]);

	switch (answer.choice) {
		case "View Department Summary":
			departmentSummary();
			break;

		case "Add Department":
			addDepartment();
			break;

		case "Remove Department":
			removeDepartment();
			break;

		case "Back to main menu":
			startMenu();
			break;

		default:
			console.error("\x1b[31mSomething has gone wrong");
			break;
	}
};

const departmentSummary = async () => {
	const department = await db("SELECT * FROM department");
	const departmentChoice = await inquirer.prompt([
		{
			type: "list",
			message: "Which department would you like a summary of?",
			choices: department,
			name: "choice",
		},
	]);
	console.log(departmentChoice.choice);

	const summary = await db(
		"SELECT department.name AS Department, SUM(role.salary) AS 'Combined Department Salary', COUNT(employee.id) AS 'Total Department Employees' FROM department LEFT JOIN role ON department.id = role.department_id LEFT JOIN employee ON employee.role_id = role.id WHERE department.name = ?",
		departmentChoice.choice
	);
	console.table("\n", summary);

	const goToAnswer = await inquirer.prompt([
		{
			type: "list",
			message: "What would you like to do?",
			choices: [
				"View another department",
				"Return to Department Menu",
				"Return to Start Menu",
			],
			name: "location",
		},
	]);

	switch (goToAnswer.location) {
		case "View another department":
			departmentSummary();
			break;
		case "Return to Department Menu":
			departmentsMenu();
			break;
		case "Return to Start Menu":
			startMenu();
			break;

		default:
			console.error("\x1b[31mSomething has gone wrong");
			break;
	}
};

const addDepartment = async () => {
	const newDepartment = await inquirer.prompt([
		{
			type: "input",
			message: "What is the name of the new department?",
			name: "departmentName",
		},
	]);
	db(`INSERT INTO department (name) VALUES (?)`, newDepartment.departmentName);

	departmentsMenu();
};
const removeDepartment = async () => {
	const deleteCheck = await inquirer.prompt([
		{
			type: "confirm",
			message:
				"\x1b[33mDeleting a department will remove all roles and employees within the department do you wish to continue?",
			default: false,
			name: "answer",
		},
	]);
	if (!deleteCheck.answer) {
		departmentsMenu();
	} else {
		const department = await db("SELECT name FROM department");
		department.push("I don't want to delete any");

		const deletePrompt = await inquirer.prompt([
			{
				type: "list",
				message: "Which department would you like to delete?",
				choices: department,
				name: "deleteChoice",
			},
		]);
		if (deletePrompt.deleteChoice === "I don't want to delete any") {
			departmentsMenu();
		} else {
			db("DELETE FROM department Where name = ?", deletePrompt.deleteChoice);
			departmentsMenu();
		}
	}
};

const roleMenu = async () => {
	const roles = await db(
		"SELECT role.title AS 'Job Title', department.name AS Department, role.salary AS 'Average salary' FROM department JOIN role ON department.id = role.department_id"
	);
	console.table("\n", roles);
};

module.exports = startMenu;
