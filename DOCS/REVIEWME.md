# Smart Assignment System: Risks & Considerations

This document outlines known edge cases, potential risks, and human factors associated with the Smart Assignment System v1.0. It should be reviewed before any major changes are made to the system.

---

## 1. Technical Considerations

### 1.1. Business Rule Conflicts
* **Risk:** Other `before insert/update` business rules on the `Task` table could interfere with the assignment logic, especially if they have a similar order (around 100).
* **Mitigation:** Before modifying this system, review other active rules on the `Task` table to prevent conflicts. The `current.assignment_group.changes()` condition provides significant protection against recursion.

### 1.2. Empty or Fully Unavailable Groups
* **Scenario:** An assignment group in the configuration table has no active, available members.
* **System Behavior (By Design):** The system will not find an assignee and will flag the ticket with `Triage Required = true`. This is a safety net, not a failure.
* **Action:** The Queue Manager should review the group's membership.

### 1.3. Service Account Health
* **Risk:** The OOO reassignment job could fail if the service account it runs as is locked out, disabled, or lacks the `itil` role.
* **Mitigation:** Monitor the execution of the scheduled job. Use a dedicated service account with non-expiring credentials where possible, per company policy.

### 1.4. Performance Impact
* **Risk:** Large assignment groups or high ticket volume could slow down assignment logic or scheduled jobs.
* **Mitigation:** Monitor system performance post-launch. Consider indexing key fields (e.g., `assignment_group`, `assigned_to`) and optimizing queries. Use ServiceNow's Performance Analytics and Scheduled Job logs to identify bottlenecks.

### 1.5. Audit & Compliance
* **Risk:** Automated assignments may complicate audit trails or compliance reporting.
* **Mitigation:** Ensure all assignment actions are logged in work notes and system logs (e.g., using `gs.log()` with a `[SmartAssignment]` prefix). Periodically review logs for anomalies. Consider building a dashboard or report for assignment actions.

---

## 2. Process & Human Factors

### 2.1. "Gaming the System"
* **Risk:** Agents may intentionally keep low-effort tasks open to artificially inflate their workload score and avoid new, complex Incidents.
* **Mitigation:** This is a management concern. Queue Managers should use the dashboard to monitor not just ticket counts, but also the age of open tickets to identify stale records.

### 2.2. Change Freeze / Blackout Periods
* **Risk:** The system will continue to assign tickets during a critical production freeze.
* **Mitigation:** A process should be defined to temporarily disable the system by setting the `smart_assignment.enabled` System Property to `false`.

### 2.3. User Onboarding/Offboarding
* **Process Requirement:** A checklist for onboarding/offboarding must include adding/removing users from assignment groups and ensuring the `active` flag on their user profile is set correctly. The daily OOO job serves as a safety net for offboarding.

---

## 3. Future-Proofing & Governance

### 3.1. System Ownership
* **Designated Owner:** The [Service Desk Manager / Name] is the designated owner of this system.
* **Responsibility:** The owner is responsible for approving configuration changes (e.g., adding groups, tuning weights) and managing the system's lifecycle.

### 3.2. Scope Limitation (v1.0)
* **Workload vs. Skill:** This version is explicitly designed to balance **workload** based on ticket counts. It does **not** account for agent skill sets.
* **Future Scope:** Skill-based routing is a potential **v2.0** enhancement and would require a separate project.

### 3.3. Configuration Rationale
* **Incident Weight (`1.5`):** Chosen based on the hypothesis that Incidents represent 50% more effort than standard Tasks.
* **Tuning:** This value is intended to be tuned based on team feedback and observed behavior post-launch. All changes should be documented here.