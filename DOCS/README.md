# Smart Assignment System

The Smart Assignment System automates ticket assignment in ServiceNow, optimizing for agent workload, recency, and availability. It also handles out-of-office (OOO) scenarios and escalates high-priority tickets for manual triage.

## Features

- **Automatic Assignment:** Tickets are assigned to the optimal agent based on workload and last assignment time.
- **OOO Handling:** Tickets assigned to unavailable agents are automatically re-queued for reassignment.
- **High-Priority Triage:** P1/P2 tickets are flagged for manual review and notify the Queue Manager group.
- **Configurable Weights:** Assignment logic is tunable via system properties.
- **Manual Controls:** Admins can set OOO status and triage flags via custom fields.

## Folder Structure

- `Bizz_Rules/Assign_Smart_On_Insert.js`: Business rule for smart assignment on ticket insert/creation.
- `Core_Logic/SmartAssignmentEngine.js`: Core engine for assignment logic.
- `Core_Logic/SmartAssignmentUtils.js`: Utility functions (e.g., notifications).
- `OOO_Filter/Reassign_OOO_Agent_Tickets.js`: Job to reassign tickets from OOO/inactive agents.
- `Que_Notifier/Notify_Queue_Manager_for_Triage.md`: Setup for triage notifications.
- `SAS_Configuration/`: Guides for custom tables, fields, and system properties.

## Configuration

See [`SAS_Configuration/1_Create_Custom_Table.md`](Smart%20Assignment%20System/SAS_Configuration/1_Create_Custom_Table.md), [`2_Create_Custom_Fields.md`](Smart%20Assignment%20System/SAS_Configuration/2_Create_Custom_Fields.md), and [`3_Create_System_Properties.md`](Smart%20Assignment%20System/SAS_Configuration/3_Create_System_Properties.md) for setup steps.

## How It Works

1. On ticket creation, [`Assign_Smart_On_Insert.js`](Smart%20Assignment%20System/Bizz_Rules/Assign_Smart_On_Insert.js) assigns the ticket or flags for triage.
2. [`SmartAssignmentEngine`](Smart%20Assignment%20System/Core_Logic/SmartAssignmentEngine.js) selects the best agent.
3. OOO/inactive agent tickets are re-queued by [`Reassign_OOO_Agent_Tickets.js`](Smart%20Assignment%20System/OOO_Filter/Reassign_OOO_Agent_Tickets.js).
4. High-priority tickets trigger notifications via [`SmartAssignmentUtils`](Smart%20Assignment%20System/Core_Logic/SmartAssignmentUtils.js).

---
