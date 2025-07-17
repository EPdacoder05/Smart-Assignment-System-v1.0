(function executeReassignment() {

    var logPrefix = '[SmartAssignment-Job] ';
    gs.info(logPrefix + 'Starting OOO ticket reassignment job.');
    var reassignedCount = 0;

    // Find all active tickets assigned to users who are now inactive or OOO
    var grTask = new GlideRecord('task');
    grTask.addActiveQuery(); // Only check active tickets
    grTask.addNotNullQuery('assigned_to');
    
    // Check the user record of the assignee
    var userQuery = grTask.addJoinQuery('sys_user', 'assigned_to', 'sys_id');
    userQuery.addCondition('active', 'false').addOrCondition('u_ooo_status', 'true');
    grTask.query();

    gs.info(logPrefix + 'Found ' + grTask.getRowCount() + ' tickets assigned to unavailable agents.');

    while (grTask.next()) {
        var originalAssignee = grTask.assigned_to.getDisplayValue();
        var ticketNumber = grTask.getValue('number');

        // Clear the assignee, which will trigger our main Business Rule to find a new one
        grTask.assigned_to = '';
        grTask.work_notes = 'Original assignee (' + originalAssignee + ') is unavailable. Re-routing ticket via Smart Assignment.';
        grTask.update();
        
        reassignedCount++;
        gs.info(logPrefix + 'Re-queued ticket ' + ticketNumber + ' from unavailable user ' + originalAssignee);
    }

    gs.info(logPrefix + 'Job complete. Reassigned ' + reassignedCount + ' tickets.');

})();