/**
 * SmartAssignmentUtils | Scoped API: global
 *
 * Utility functions for the Smart Assignment system, such as notifications.
 */
var SmartAssignmentUtils = Class.create();
SmartAssignmentUtils.prototype = {
    initialize: function() {
        this.logPrefix = '[SmartAssignment] ';
    },

    /**
     * Triggers a notification for a high-priority ticket requiring manual triage.
     * @param {GlideRecord} currentTicket - The current incident/task GlideRecord.
     */
    notifyManagerForTriage: function(currentTicket) {
        var queueManagerGroup = gs.getProperty('smart_assignment.p1_p2_notify_group');
        if (!queueManagerGroup) {
            gs.error(this.logPrefix + 'System Property [smart_assignment.p1_p2_notify_group] is not set. Cannot send triage notification.');
            return;
        }

        gs.eventQueue(
            "smart_assignment.triage.required", // Event Name
            currentTicket, // GlideRecord
            queueManagerGroup, // Parameter 1: Group sys_id to notify
            currentTicket.number // Parameter 2: Ticket Number
        );
        
        gs.info(this.logPrefix + 'Triage event queued for ' + currentTicket.number + ' to group ' + queueManagerGroup);
    },

    type: 'SmartAssignmentUtils'
};