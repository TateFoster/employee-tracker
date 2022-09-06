DROP DATABASE IF EXISTS employeeTracker_db;

CREATE DATABASE employeeTracker_db;

USE DATABASE employeeTracker_db;

CREATE TABLE department (
    id INT NOT NULL PRIMARY KEY,
    name VARCHAR(40)
);

CREATE TABLE role (
    id INT NOT NULL PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id)
    REFERENCES department(id)
    ON DELETE SET NULL
);

CREATE TABLE employee (
    id INT NOT NULL PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30)
    role_id INT,
    FOREIGN KEY (role_id)
    REFERENCES role(id)
    ON DELETE CASCADE,
    manager_id INT,
    FOREIGN KEY (manager_id)
    REFERENCES employee(id)
    ON DELETE SET NULL
);