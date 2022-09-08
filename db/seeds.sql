INSERT INTO department (name)
VALUES 
("Legal"),
("Sales"),
("Human Resources");

INSERT INTO role (title, salary, department_id)
VALUES
("Lawyer", 120000, 1),
("Sales Manager", 90000, 2),
("Head of Human Resources", 150000, 3),
("Salesperson", 45000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Richard", "Williams", 1, null),
("Linda", "Wright", 2, null),
("Jeremy", "Boob", 4, 2),
("Diana", "Bobana", 3, null),
("Thorin", "Oakenshield", 4, 2);