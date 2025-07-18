# Steps to be performed within SN

Notifications/Notify_Queue_Manager_for_Triage.md

Navigate to System Notification > Email > Notifications.

Click New.

Name: Smart Assign: Triage Required

Table: Task [task]

When to send:

Send when: Event is fired

Event name: smart_assignment.triage.required

Who will receive:

Check Event parm 1 contains recipient.

What it will contain:

Subject: Triage Required for High-Priority Ticket: ${number}

Message HTML:


<p>Hello Queue Manager,</p>
<p>A high-priority ticket, <strong>${number}</strong>, has been flagged for immediate manual triage.</p>
<p><strong>Short Description:</strong> ${short_description}</p>
<p>The system did not assign this ticket automatically due to its high priority. Your assessment is required.</p>
<p>Click here to view the ticket: ${URI_REF}</p>
<p>Thank you,<br/>ServiceNow Smart Assignment System</p>