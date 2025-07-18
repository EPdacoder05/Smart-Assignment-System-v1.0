# Steps to be performed within SN

Create_Custom_Table.md

Navigate to System Definition > Tables.

Click New.

Label: Smart Assignment Group Config

Name: u_assignment_group_config (this will auto-populate)

Under the "Columns" tab, add one new column:

Type: Reference

Column label: Assignment Group

Column name: u_assignment_group

Reference: Group [sys_user_group]

Save the table. This is where you will add the assignment groups that use this system.