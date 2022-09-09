INSERT INTO department (name)
VALUES 
("Legal"),
("Sales"),
("Human Resources");

INSERT INTO role (title, salary, department_id, is_manager, manager_tier)
VALUES
("Lawyer", 120000, 1, false, NULL),
("Sales Manager", 90000, 2, true, 1),
("Head of Human Resources", 200000, 3, true, 2),
("Salesperson", 45000, 2, false, NULL),
("Human Resource Manager", 120000, 3, true, 1),
("Human Resources Coordinator", 50000, 3, false, NULL);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Richard", "Williams", 1, NULL),
("Linda", "Wright", 2, NULL),
("Jeremy", "Boob", 4, 2),
("Diana", "Bobana", 3, NULL),
("Thorin", "Oakenshield", 4, 2); 