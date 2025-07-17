/**
 * SmartAssignmentEngine | Scoped API: global
 *
 * The core engine for calculating and assigning tickets based on workload,
 * recency, and availability. Designed to be modular and secure.
 * All logging is prefixed with [SmartAssignment] for easy filtering.
 */
var SmartAssignmentEngine = Class.create();
SmartAssignmentEngine.prototype = {
    initialize: function() {
        // Get weights from System Properties. Allows tuning without code changes.
        this.incidentWeight = parseFloat(gs.getProperty('smart_assignment.incident_weight', '1.5'));
        this.taskWeight = parseFloat(gs.getProperty('smart_assignment.task_weight', '1.0'));
        this.logPrefix = '[SmartAssignment] ';
    },

    /**
     * Main execution function. Finds and returns the optimal assignee's sys_id.
     * @param {string} assignmentGroupId - The sys_id of the assignment group.
     * @returns {string|null} The sys_id of the chosen user, or null if no one is available.
     */
    findOptimalAssignee: function(assignmentGroupId) {
        gs.info(this.logPrefix + 'Starting search for optimal assignee in group: ' + assignmentGroupId);

        var availableMembers = this._getAvailableGroupMembers(assignmentGroupId);
        if (availableMembers.length === 0) {
            gs.warn(this.logPrefix + 'No available members found for group: ' + assignmentGroupId);
            return null;
        }
        gs.info(this.logPrefix + 'Found ' + availableMembers.length + ' available members.');

        // Add workload and recency data to each member object
        this._calculateScores(availableMembers);

        // Sort to find the best candidate
        availableMembers.sort(this._sortByScore.bind(this));
        
        var bestCandidate = availableMembers[0];
        gs.info(this.logPrefix + 'Best candidate found: ' + bestCandidate.name + ' (Score: ' + bestCandidate.workloadScore + ', Last Assigned: ' + bestCandidate.lastAssigned + ')');

        return bestCandidate.sys_id;
    },

    /**
     * Gets all active, available members for a given group.
     * @param {string} groupId - The sys_id of the assignment group.
     * @returns {Array} An array of user objects.
     * @private
     */
    _getAvailableGroupMembers: function(groupId) {
        var members = [];
        var grMember = new GlideRecord('sys_user_grmember');
        grMember.addQuery('group', groupId);
        grMember.query();

        while (grMember.next()) {
            var user = grMember.user.getRefRecord();
            // SECURITY & EFFICIENCY: Filter out inactive and OOO users at the source.
            if (user.getValue('active') == true && user.getValue('u_ooo_status') != true) {
                members.push({
                    sys_id: user.getValue('sys_id'),
                    name: user.getValue('name'),
                    workloadScore: 0,
                    lastAssigned: '1970-01-01 00:00:00' // Default for users with no history
                });
            }
        }
        return members;
    },

    /**
     * Calculates workload and recency scores for each member.
     * @param {Array} members - The array of member objects.
     * @private
     */
    _calculateScores: function(members) {
        for (var i = 0; i < members.length; i++) {
            var member = members[i];
            member.workloadScore = this._getUserWorkload(member.sys_id);
            member.lastAssigned = this._getLastAssignedTime(member.sys_id);
        }
    },

    /**
     * Calculates a user's weighted workload score.
     * @param {string} userId - The sys_id of the user.
     * @returns {number} The calculated workload score.
     * @private
     */
    _getUserWorkload: function(userId) {
        var incidentCount = new GlideAggregate('incident');
        incidentCount.addQuery('assigned_to', userId);
        incidentCount.addActiveQuery();
        incidentCount.addAggregate('COUNT');
        incidentCount.query();
        var incidents = 0;
        if (incidentCount.next()) {
            incidents = incidentCount.getAggregate('COUNT');
        }

        var taskCount = new GlideAggregate('sc_task');
        taskCount.addQuery('assigned_to', userId);
        taskCount.addActiveQuery();
        taskCount.addAggregate('COUNT');
        taskCount.query();
        var tasks = 0;
        if (taskCount.next()) {
            tasks = taskCount.getAggregate('COUNT');
        }
        
        return (incidents * this.incidentWeight) + (tasks * this.taskWeight);
    },
    
    /**
     * Gets the timestamp of the user's most recently assigned ticket.
     * @param {string} userId - The sys_id of the user.
     * @returns {string} The GlideDateTime string of the last assignment.
     * @private
     */
    _getLastAssignedTime: function(userId) {
        var lastTicket = new GlideRecord('task'); // Query parent task table for efficiency
        lastTicket.addQuery('assigned_to', userId);
        lastTicket.orderByDesc('sys_updated_on');
        lastTicket.setLimit(1);
        lastTicket.query();

        if (lastTicket.next()) {
            return lastTicket.getValue('sys_updated_on');
        }
        return '1970-01-01 00:00:00'; // Default for new users
    },

    /**
     * The sorting function for the multi-level sort logic.
     * @param {object} a - First user object.
     * @param {object} b - Second user object.
     * @returns {number}
     * @private
     */
    _sortByScore: function(a, b) {
        // 1. Primary Sort: Lowest workload score wins.
        if (a.workloadScore < b.workloadScore) return -1;
        if (a.workloadScore > b.workloadScore) return 1;

        // 2. Tie-Breaker: Oldest last assignment time wins (has been waiting longer).
        if (a.lastAssigned < b.lastAssigned) return -1;
        if (a.lastAssigned > b.lastAssigned) return 1;

        return 0; // Should be rare
    },

    type: 'SmartAssignmentEngine'
};