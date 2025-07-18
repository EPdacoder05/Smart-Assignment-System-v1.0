(function executeRule(current, previous /*, gs, script_case*/ ) {

    var logPrefix = '[SmartAssignment] ';
    gs.info(logPrefix + 'Rule triggered for ' + current.number);

    // Branching Logic for High Priority Tickets
    var priority = current.priority.toString();
    if (priority == '1' || priority == '2') {
        gs.info(logPrefix + 'High priority detected for ' + current.number + '. Flagging for triage.');
        current.u_triage_required = true;
        current.work_notes = "High-priority ticket detected. Flagged for immediate Queue Manager review.";
        
        // Call the notification utility
        new SmartAssignmentUtils().notifyManagerForTriage(current);
        return; // Stop processing, let the manager handle it
    }

    // --- Standard Assignment Logic ---
    var engine = new SmartAssignmentEngine();
    var assigneeId = engine.findOptimalAssignee(current.assignment_group.toString());

    if (assigneeId) {
        current.assigned_to = assigneeId;
        current.work_notes = "Ticket has been auto-assigned based on current team workload and availability by the Smart Assignment System.";
        // This comment meets the first response SLA
        current.comments = "Your ticket " + current.number + " has been received and assigned. An agent will be with you shortly.";
        gs.info(logPrefix + 'Successfully assigned ' + current.number + ' to ' + current.assigned_to.getDisplayValue());
    } else {
        // If no one is available, flag for manual review
        current.u_triage_required = true;
        current.work_notes = "Smart Assignment could not find an available agent. Flagged for Queue Manager review.";
        gs.warn(logPrefix + 'Could not find an available assignee for ' + current.number + '. Flagged for triage.');
    }

})(previous, current);