const start = require("./menus/startMenu");
const data = require("./config/connection");
const tables = require("console.table");
const inquirer = require("inquirer");
const util = require("util");
const db = util.promisify(data.query).bind(data);

start();

// let test;
// data.query(
// 	"SELECT CONCAT(m.first_name, ' ', m.last_name)AS Manager, CONCAT(e.first_name, ' ', e.last_name) AS Employee FROM employee e LEFT JOIN employee m ON m.id = e.manager_id",
// 	function (err, results) {
// 		test = results;
// 		console.table(results);
// 	}
// );
// console.log("testing where things end up");
// data.query(
// 	"SELECT department.name AS Department, role.title AS 'Job Title', CONCAT(employee.first_name, ' ', employee.last_name) AS Employee, role.salary AS Salary, CONCAT(m.first_name, ' ', m.last_name)AS Manager FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id LEFT JOIN employee m ON m.id = employee.manager_id WHERE department.id = 2",
// 	function (err, results) {
// 		console.table(results);
// 	}
// );
// console.log("test mk 2");
// const testFunction = async () => {
// 	const department = await db("SELECT * FROM department");

// 	const answer = await inquirer.prompt([
// 		{
// 			type: "list",
// 			message: "Test choice from dataquery",
// 			choices: department,
// 			name: "test",
// 		},
// 	]);

// 	console.log(answer);
// };

// testFunction();
