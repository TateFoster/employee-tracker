const inquirer = require("inquirer");
const mysql = require("mysql2");
const { start } = require("repl");

startMenu();

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
					console.log("Departments chosen");
					departmentsMenu();
					break;

				case "Roles":
					console.log("Roles chosen");

					break;

				case "Employees":
					console.log("Employees chosen");

					break;

				case "Quit":
					console.log("Exiting Program");
					return;

					break;

				default:
					console.error("\x1b31mSomething went wrong");
					break;
			}
		});
}

function departmentsMenu() {
	// display department into table

	// prompts user on if they want to make changes if yes add/remove if no return to start menu
	inquirer
		.prompt([
			{
				type: "confirm",
				message: "Would you like to add or remove a department?",
				choices: ["Y", "N"],
				default: "Y",
				name: "choice",
			},
		])
		.then((answer) => {
			if (answer.choice) {
				inquirer
					.prompt([
						{
							type: "list",
							message: "Which would you like to do?",
							choices: ["Add Department", "Remove Department", "Neither"],
							name: "choice",
						},
					])
					.then((answer) => {
						switch (answer.choice) {
							case "Add Department":
								addDepartment();
								break;
							case "Remove Department":
								removeDepartment();
								break;
							case "Neither":
								startMenu();
								break;

							default:
								console.error("\x1b31mSomething has gone wrong");
								break;
						}
					});
			} else {
				startMenu();
			}
		});
}

function addDepartment() {}
function removeDepartment() {}
