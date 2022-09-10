const inquirer = require("inquirer");
const data = require("../config/connection");
const tables = require("console.table");
const util = require("util");
const db = util.promisify(data.query).bind(data);
const { checkText, checkSalary } = require("./validations");

function startMenu() {
	inquirer
		.prompt([
			{
				type: "list",
				message: "What would you like to view?",
				choices: ["Departments", "Roles", "Employees", "Quit"],
				name: "sectionChoice",
				loop: false,
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
					employeeMenu();

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
			loop: false,
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
			loop: false,
		},
	]);

	const summary = await db(
		"SELECT department.name AS Department, SUM(role.salary) AS 'Combined Department Salary', COUNT(employee.id) AS 'Total Department Employees' FROM department LEFT JOIN role ON department.id = role.department_id RIGHT JOIN employee ON employee.role_id = role.id WHERE department.name = ?",
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
			loop: false,
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
			validate: checkText,
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
				loop: false,
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
		"SELECT role.title AS 'Role Title', department.name AS Department, role.salary AS 'Average salary' FROM department JOIN role ON department.id = role.department_id ORDER BY department.id"
	);
	console.table("\n", roles);

	const answer = await inquirer.prompt([
		{
			type: "list",
			message: "Which would you like to do?",
			choices: [
				"View Role by Department",
				"Add Role",
				"Remove Role",
				"Back to main menu",
			],
			name: "choice",
			loop: false,
		},
	]);

	switch (answer.choice) {
		case "View Role by Department":
			roleByDepartment();
			break;

		case "Add Role":
			addRole();
			break;

		case "Remove Role":
			removeRole();
			break;

		case "Back to main menu":
			startMenu();
			break;

		default:
			console.error("\x1b[31mSomething has gone wrong");
			break;
	}
};

const roleByDepartment = async () => {
	const department = await db("SELECT * FROM department");
	department.push("Back to Role Menu");

	const departmentRole = await inquirer.prompt([
		{
			type: "list",
			message: "What department do you want to view the roles of?",
			choices: department,
			name: "roleDepartment",
			loop: false,
		},
	]);

	if (departmentRole.roleDepartment === "Back to Role Menu") {
		roleMenu();
	} else {
		const rolesInDepartment = await db(
			"SELECT department.name AS Department, role.title AS 'Role Title', COUNT(employee.id) AS 'Employees in Position' FROM department LEFT JOIN role ON department.id = role.department_id LEFT JOIN employee ON role.id = employee.role_id WHERE department.name = ? GROUP BY role.title",
			departmentRole.roleDepartment
		);

		console.table("\n", rolesInDepartment);
		roleByDepartment();
	}
};

const addRole = async () => {
	const department = await db("SELECT * FROM department");

	const newRole = await inquirer.prompt([
		{
			type: "input",
			message: "What is the name of the new role?",
			name: "roleName",
			validate: checkText,
		},
		{
			type: "list",
			message: "What department is this role a part of?",
			choices: department,
			name: "roleDepartment",
			loop: false,
		},
		{
			type: "input",
			message: "What is the salary of this position?",
			name: "roleSalary",
			validate: checkSalary,
		},
		{
			type: "confirm",
			message: "Is this position a management position?",
			default: false,
			name: "manager",
		},
	]);

	const departmentId = await db(
		"SELECT id FROM department WHERE name = ?",
		newRole.roleDepartment
	);
	const { id } = departmentId[0];

	if (newRole.manager) {
		const tier = await inquirer.prompt([
			{
				type: "input",
				message: "What level manager is this position? (1 being lowest)",
				name: "managerLevel",
				validate: checkSalary,
			},
		]);

		db(
			"INSERT INTO role (title, salary, department_id, is_manager, manager_tier) VALUES ( ?, ?, ?, true, ? )",
			[newRole.roleName, newRole.roleSalary, id, tier.managerLevel]
		);

		roleMenu();
	} else {
		db(
			"INSERT INTO role (title, salary, department_id, is_manager, manager_tier) VALUES ( ?, ?, ?, false, null )",
			[newRole.roleName, newRole.roleSalary, id]
		);

		roleMenu();
	}
};

const removeRole = async () => {
	const deleteCheck = await inquirer.prompt([
		{
			type: "confirm",
			message:
				"\x1b[33mDeleting a role will remove all employees with that position do you wish to continue?",
			default: false,
			name: "answer",
		},
	]);
	if (!deleteCheck.answer) {
		departmentsMenu();
	} else {
		const role = await db("SELECT title AS name FROM role");
		role.push("I don't want to delete any");

		const deletePrompt = await inquirer.prompt([
			{
				type: "list",
				message: "Which role would you like to delete?",
				choices: role,
				name: "deleteChoice",
				loop: false,
			},
		]);
		if (deletePrompt.deleteRole === "I don't want to delete any") {
			roleMenu();
		} else {
			db("DELETE FROM role Where title = ?", deletePrompt.deleteChoice);
			roleMenu();
		}
	}
};

const employeeMenu = async () => {
	const employeeInfo = await db(
		"SELECT department.name AS Department, role.title AS 'Job Title', CONCAT(employee.first_name, ' ', employee.last_name) AS Employee, role.salary AS Salary, CONCAT(m.first_name, ' ', m.last_name)AS Manager FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id LEFT JOIN employee m ON m.id = employee.manager_id ORDER BY department.id"
	);

	console.table("\n", employeeInfo);

	const answer = await inquirer.prompt([
		{
			type: "list",
			message: "Which would you like to do?",
			choices: [
				"View Employee by ___",
				"Update Employee Info",
				"Add New Employee",
				"Remove Employee",
				"Back to main menu",
			],
			name: "choice",
			loop: false,
		},
	]);

	switch (answer.choice) {
		case "View Employee by ___":
			employeeBy();
			break;

		case "Update Employee Info":
			updateEmployee();
			break;

		case "Add New Employee":
			addEmployee();
			break;

		case "Remove Employee":
			removeEmployee();
			break;

		case "Back to main menu":
			startMenu();
			break;

		default:
			console.error("\x1b[31mSomething has gone wrong");
			break;
	}
};

const employeeBy = async () => {
	const viewEmployee = await inquirer.prompt([
		{
			type: "list",
			message: "What would you like to view employees by?",
			choices: ["Role", "Manager", "Department"],
			name: "employeeView",
			loop: false,
		},
	]);

	switch (viewEmployee.employeeView) {
		case "Role":
			employeeByRole();
			break;

		case "Manager":
			employeeByManager();
			break;

		case "Department":
			employeeByDepartment();
			break;

		default:
			console.error("\x1b[31mSomething has gone wrong");
			break;
	}
};

const employeeByRole = async () => {
	const role = await db(
		"SELECT role.title AS name FROM role JOIN department ON department.id = role.department_id ORDER BY department.id"
	);
	role.push("I don't want to view any of these roles");

	const roleView = await inquirer.prompt([
		{
			type: "list",
			message: "Which role would you like to view employee list of?",
			choices: role,
			name: "choice",
			loop: false,
		},
	]);

	if (roleView.choice === "I don't want to view any of these roles") {
		employeeMenu();
	} else {
		const employeeRoleDisplay = await db(
			"SELECT department.name AS Department, role.title AS 'Job Title', CONCAT(employee.first_name, ' ', employee.last_name) AS Employee, role.salary AS Salary, CONCAT(m.first_name, ' ', m.last_name)AS Manager FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id LEFT JOIN employee m ON m.id = employee.manager_id WHERE role.title = ? ORDER BY employee.id",
			roleView.choice
		);
		if (employeeRoleDisplay.length !== 0) {
			console.table("\n", employeeRoleDisplay);
			employeeByRole();
		} else {
			console.log("\nThere is currently nobody assigned to this role\n");
			employeeByRole();
		}
	}
};

const employeeByManager = async () => {
	const manager = await db(
		"Select CONCAT(employee.first_name, ' ', employee.last_name) AS name FROM role CROSS JOIN employee ON employee.role_id = role.id WHERE is_manager = true"
	);
	manager.push("I don't want to view any of these managers");

	const managerView = await inquirer.prompt([
		{
			type: "list",
			message: "Which manager would you like to view the employee list of?",
			choices: manager,
			name: "choice",
			loop: false,
		},
	]);

	if (managerView.choice === "I don't want to view any of these managers") {
		employeeMenu();
	} else {
		const managerName = managerView.choice.split(" ");

		const managerId = await db(
			"SELECT id FROM employee WHERE first_name = ? AND last_name = ?",
			managerName
		);
		const { id } = managerId[0];

		const employeeManagerDisplay = await db(
			"SELECT department.name AS Department, role.title AS 'Job Title', CONCAT(employee.first_name, ' ', employee.last_name) AS Employee, role.salary AS Salary, CONCAT(m.first_name, ' ', m.last_name)AS Manager FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id LEFT JOIN employee m ON m.id = employee.manager_id WHERE employee.manager_id = ? ORDER BY employee.id",
			id
		);
		if (employeeManagerDisplay.length !== 0) {
			console.table("\n", employeeManagerDisplay);
			employeeByManager();
		} else {
			console.log("\nThere is currently nobody assigned to this manager\n");
			employeeByManager();
		}
	}
};

const employeeByDepartment = async () => {
	const department = await db("SELECT name FROM department");
	department.push("I don't want to view any of these departments");

	const departmentView = await inquirer.prompt([
		{
			type: "list",
			message: "Which department would you like to view employee list of?",
			choices: department,
			name: "choice",
			loop: false,
		},
	]);

	if (
		departmentView.choice === "I don't want to view any of these departments"
	) {
		employeeMenu();
	} else {
		const employeeDepartmentDisplay = await db(
			"SELECT department.name AS Department, role.title AS 'Job Title', CONCAT(employee.first_name, ' ', employee.last_name) AS Employee, role.salary AS Salary, CONCAT(m.first_name, ' ', m.last_name)AS Manager FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id LEFT JOIN employee m ON m.id = employee.manager_id WHERE department.name = ? ORDER BY employee.id",
			departmentView.choice
		);
		if (employeeDepartmentDisplay.length !== 0) {
			console.table("\n", employeeDepartmentDisplay);
			employeeByDepartment();
		} else {
			console.log("\nThere is currently nobody assigned to this department\n");
			employeeByDepartment();
		}
	}
};

const updateEmployee = async () => {
	const employees = await db(
		"SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee"
	);
	employees.push("I don't want to update an employee");

	const updateConfirm = await inquirer.prompt([
		{
			type: "list",
			message: "Which employee would you like to update?",
			choices: employees,
			name: "employeeChoice",
			loop: false,
		},
	]);

	if (updateConfirm.employeeChoice === "I don't want to update an employee") {
		employeeMenu();
	} else {
		const employeeChoices = await inquirer.prompt([
			{
				type: "list",
				message: "What would you like to update?",
				choices: [
					"Employee Role",
					"Employee Manager",
					"I don't want to update an employee",
				],
				loop: false,
				name: "update",
			},
		]);
		switch (employeeChoices.update) {
			case "Employee Role":
				updateEmployeeRole(updateConfirm.employeeChoice);
				break;

			case "Employee Manager":
				updateEmployeeManager(updateConfirm.employeeChoice);
				break;

			case "I don't want to update an employee":
				employeeMenu();
				break;

			default:
				console.error("\x1b[31mSomething has gone wrong");
				break;
		}
	}
};

const updateEmployeeRole = async (employee) => {
	const role = await db("SELECT title AS name FROM role");

	const newRole = await inquirer.prompt([
		{
			type: "list",
			message: `What role would you like ${employee} to now have?`,
			choices: role,
			name: "choice",
			loop: false,
		},
	]);

	const roleInfo = await db(
		"SELECT id AS roleId, department_id AS departmentId, manager_tier AS level FROM role WHERE title = ?",
		newRole.choice
	);
	let { roleId, departmentId, level } = roleInfo[0];

	if (level === null) {
		level = 0;
	}
	const managerOptions = await db(
		"SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS name FROM employee JOIN role ON employee.role_id = role.id WHERE role.department_id = ? AND role.manager_tier > ?",
		[departmentId, level]
	);
	managerOptions.push("None of the above");

	const manager = await inquirer.prompt([
		{
			type: "list",
			message: "Who is the employee's direct manager?",
			choices: managerOptions,
			name: "managerChoice",
			loop: false,
		},
	]);
	let newManager;

	if (manager.managerChoice === "None of the above") {
		newManager = null;
	} else {
		const managerInfo = await db(
			"SELECT id AS managerId FROM employee WHERE first_name = ? AND last_name = ?",
			manager.managerChoice.split(" ")
		);
		const { managerId } = managerInfo[0];
		newManager = managerId;
	}
	const roleManager = [roleId, newManager];

	const update = roleManager.concat(employee.split(" "));

	db(
		"UPDATE employee SET role_id = ?, manager_id = ? WHERE first_name = ? AND last_name = ? ",
		update
	);

	employeeMenu();
};

const updateEmployeeManager = async (employee) => {
	const roleNum = await db(
		"SELECT role_id AS roleId FROM employee WHERE first_name = ? AND last_name = ?",
		employee.split(" ")
	);

	const { roleId } = roleNum[0];
	const roleInfo = await db(
		"SELECT department_id AS departmentId, manager_tier AS level FROM role WHERE id = ?",
		roleId
	);
	let { departmentId, level } = roleInfo[0];

	if (level === null) {
		level = 0;
	}
	const managerOptions = await db(
		"SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS name FROM employee JOIN role ON employee.role_id = role.id WHERE role.department_id = ? AND role.manager_tier > ?",
		[departmentId, level]
	);
	managerOptions.push("None of the above");

	const manager = await inquirer.prompt([
		{
			type: "list",
			message: `Who is the employee's direct manager?`,
			choices: managerOptions,
			name: "managerChoice",
			loop: false,
		},
	]);

	if (manager.managerChoice === "None of the above") {
		db(
			"UPDATE employee SET manager_id = null WHERE first_name = ? AND last_name =?",
			employee.split(" ")
		);
	} else {
		const managerInfo = await db(
			"SELECT id as managerId FROM employee WHERE first_name = ? AND last_name = ?",
			manager.managerChoice.split(" ")
		);
		const { managerId } = managerInfo[0];

		const update = employee.split(" ");
		update.unshift(managerId);
		db(
			"UPDATE employee SET manager_id = ? WHERE first_name = ? AND last_name =?",
			update
		);
	}
	employeeMenu();
};

const addEmployee = async () => {
	const role = await db("SELECT title AS name FROM role");

	const employeeInfo = await inquirer.prompt([
		{
			type: "input",
			message: "What is the employee's first name?",
			name: "firstName",
			validate: checkText,
		},
		{
			type: "input",
			message: "What is the employee's last name?",
			name: "lastName",
			validate: checkText,
		},
		{
			type: "list",
			message: "What is the employee's position?",
			choices: role,
			loop: false,
			name: "roleChoice",
		},
	]);

	const roleInfo = await db(
		"SELECT id AS roleId, department_id AS departmentId, manager_tier AS level FROM role WHERE title = ?",
		employeeInfo.roleChoice
	);
	let { roleId, departmentId, level } = roleInfo[0];

	if (level === null) {
		level = 0;
	}
	const managerOptions = await db(
		"SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS name FROM employee JOIN role ON employee.role_id = role.id WHERE role.department_id = ? AND role.manager_tier > ?",
		[departmentId, level]
	);
	managerOptions.push("None of the above");

	const manager = await inquirer.prompt([
		{
			type: "list",
			message: "Who is the employee's direct manager?",
			choices: managerOptions,
			name: "managerChoice",
			loop: false,
		},
	]);

	if (manager.managerChoice === "None of the above") {
		db(
			"INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, null)",
			[employeeInfo.firstName, employeeInfo.lastName, roleId]
		);
	} else {
		const managerName = manager.managerChoice.split(" ");

		const managerInfo = await db(
			"SELECT id AS managerId FROM employee WHERE first_name = ? AND last_name = ?",
			managerName
		);
		const { managerId } = managerInfo[0];
		db(
			"INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
			[employeeInfo.firstName, employeeInfo.lastName, roleId, managerId]
		);
	}
	employeeMenu();
};

const removeEmployee = async () => {
	const employees = await db(
		"SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee"
	);
	employees.push("I don't want to delete any");

	const deleteEmployee = await inquirer.prompt([
		{
			type: "list",
			message: "Which employee would you like to remove?",
			choices: employees,
			name: "deleteChoice",
			loop: false,
		},
	]);

	if (deleteEmployee.deleteChoice === "I don't want to delete any") {
		employeeMenu();
	} else {
		db(
			"DELETE FROM employee WHERE first_name = ? AND last_name =?",
			deleteEmployee.deleteChoice.split(" ")
		);
		employeeMenu();
	}
};

module.exports = startMenu;
