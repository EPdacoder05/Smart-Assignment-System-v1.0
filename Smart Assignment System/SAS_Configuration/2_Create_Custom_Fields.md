# Steps to be performed within SN

Create_Custom_Fields.md

On the User [sys_user] table:

Add a new field:

Type: True/False

Column label: OOO Status

Column name: u_ooo_status

This is for manual OOO control and future integrations.

On the Task [task] table:

Add a new field:

Type: True/False

Column label: Triage Required

Column name: u_triage_required

This is the flag for the Queue Manager's dashboard.

