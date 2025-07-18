# Smart Assignment System v1.0 — Go-Live Battle Plan

This guide walks you through safely implementing the Smart Assignment System in ServiceNow to stage and test. **Never deploy directly to production.**

---

## Phase 1: Setup in DEV Instance (1–2 hours)

1. **Get Access:** Obtain admin rights to a non-production (DEV/TEST) ServiceNow instance.
2. **Create Update Set:**  
   - Go to **System Update Sets > Local Update Sets**.
   - Create a new set named `Smart Assignment System v1.0`.
   - Make it your current update set.  
   *This tracks every change for safe deployment.*
3. **Build Components:**  
   - Use the provided files to create all tables, fields, Script Includes, Business Rules, etc.
   - Copy/paste code and configurations as needed.
4. **Populate Config:**  
   - Add ONE pilot assignment group to your new `Smart Assignment Group Config` table.

---

## Phase 2: Testing & Validation ("Stress Test")

1. **Impersonate Users:**  
   - Impersonate a user in your pilot group.
2. **Test Case 1 (Happy Path):**  
   - Create a P3/P4 Incident for the pilot group.
   - Verify assignment to the user with the lowest workload.
   - Check work notes for audit trail.
3. **Test Case 2 (High Priority):**  
   - Create a P1 Incident.
   - Verify it is NOT assigned, `Triage Required` is checked, and manager receives an email.
4. **Test Case 3 (OOO):**  
   - Mark a user as `OOO Status = true`.
   - Create tickets; verify they are NEVER assigned to this user.
5. **Test Case 4 (The Job):**  
   - Manually assign a ticket to the OOO user.
   - Run the `Smart Assign: Reassign OOO Tickets` scheduled job.
   - Verify ticket is re-assigned to an available user.
6. **Check Logs:**  
   - Go to **System Logs > System Log > All**.
   - Filter for `[SmartAssignment]` messages for debugging.

---

## Phase 3: UAT & Deployment

1. **Get Team Feedback:**  
   - Have the pilot team's Queue Manager and agents use the system for a day.
   - Gather feedback on assignment accuracy.
2. **Tune the Weights:**  
   - Adjust `incident_weight` in System Properties as needed.
3. **Deploy:**  
   - Mark the Update Set as Complete.
   - Move to production and commit during a maintenance window.

---

## Key Business Rule: Assign_Smart_On_Insert.js

- **Name:** Smart Assign on Insert/Update
- **Table:** Task [task]
- **When:** Before
- **Order:** 100
- **Insert:** true
- **Update:** true
- **Advanced:** true

**Condition:**
```javascript
// Run only when assignment group is set, but assigned to is empty
current.assignment_group.changes() && current.assigned_to.nil() && 
// Ensure the system is globally enabled
gs.getProperty('smart_assignment.enabled', 'false') == 'true' &&
// Check if this specific assignment group is opted-in
new GlideRecord('u_assignment_group_config').get('u_assignment_group', current.assignment_group) &&
// SECURITY: Do NOT run for Major Incidents
current.major_incident_state != 'accepted'
```

---

## Security & Efficiency

- **Security:**  
  - Only runs for opted-in groups.
  - Skips major incidents.
  - All changes tracked in Update Set.
- **Efficiency:**  
  - Assignment logic uses workload and recency.
  - OOO users are excluded automatically.
  - All actions logged for audit and debugging.

---

## Final Checklist

- [ ] All components created in DEV
- [ ] Update Set contains all changes
- [ ] Pilot group configured
- [ ] All test cases passed
- [ ] Logs reviewed for errors
- [ ] Team feedback collected
- [ ] Weights tuned
- [ ] Update Set ready for production

---

**Ready to go live? Double-check everything above, then deploy with confidence!**