const mysql = require("mysql2");

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "wigglebouncecodedown",
	database: "employeetracker_db",
});

module.exports = connection;
