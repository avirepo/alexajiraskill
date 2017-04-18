'use strict'

var Request = require('request');
var config = require('./jiraConfig');
var AlexaSkill = require('./../AlexaSkill')
var projectName = "StudentNest";

var Methods = {
    POST: "POST",
    GET: "GET"
};

exports.getProjectStatus = function (intent, session, requestResult) {
    var ticketNumberSlot = intent.slots.TicketNumber;

    var hasTicketNumber = ticketNumberSlot && ticketNumberSlot.value;

    var jql;
    var url = null;
    var method = null;
    if (hasTicketNumber) {
        method = Methods.GET;
        url = config.endpoint + "issue/STUD-" + ticketNumberSlot.value + "?fields=status";
    } else {
        url = config.endpoint + "search";
        method = Methods.POST;
        jql = "project=" + projectName.toUpperCase() + " AND status = Open ORDER BY created DESC";
    }

    console.log(url);
    if (null != jql) {
        console.log(jql);
    }

    Request(buildRequest(url, method, jql), requestResult);
}

exports.getProjectSpeech = function (intent, response, body, alexaResponse) {
    var speechOutput, speech;
    var projectSlot = intent.slots.Project;
    var ticketNumberSlot = intent.slots.TicketNumber;

    var hasTicketNumber = ticketNumberSlot && ticketNumberSlot.value;


    if (response.statusCode === 200) {
        if (hasTicketNumber) {
            if (body.total === 0) {
                console.log(response.statusCode, body);
                speech = "<speak>I'm sorry, I couldn't find the status for the ticket " + projectSlot.value + " - "
                        + "<say-as interpret-as='digits'>" + ticketNumberSlot.value.toString() + "</say-as></speak>";
            } else {
                var status = body.fields.status.name;
                console.log(status);
                speech = "<speak> The current status of "
                        + projectSlot.value
                        + "<say-as interpret-as='digits'>"
                        + ticketNumberSlot.value
                        + "</say-as>" + " is "
                        + "<break time='0.5s'/>" + status
                        + "</speak>";
            }
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.SSML
            };
        } else {
            speechOutput = {
                speech: "<speak>There are<break strength='medium'/>" + body.total
                + " tickets found with the specified criteria.</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
        }
    } else {
        speechOutput = {
            speech: "<speak>" + "I'm sorry, I couldn't find the information you were looking for." + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
    }
    console.log(speechOutput);
    alexaResponse.tell(speechOutput);
//    alexaResponse.tellWithCard(speechOutput, "Ticket status", intent);
}

exports.getTicketStatus = function (intent, session, requestResult) {
    var ticketNumberSlot = intent.slots.TicketNumber;
    var hasTicketNumber = ticketNumberSlot && ticketNumberSlot.value;

    var statusSlot = intent.slots.Status;
    var hasStatus = statusSlot && statusSlot.value;

    var jql;
    if (hasTicketNumber) {
        if (hasStatus) {
            jql = "project = " + projectName.toUpperCase()
                    + " AND status = '" + statusSlot.value.toUpperCase()
                    + "' AND issuetype = Bug "
                    + "AND issue in linkedIssues(STUD-" + ticketNumberSlot.value + ") "
                    + "ORDER BY created DESC";
        } else {
            jql = "project = " + projectName.toUpperCase()
                    + " AND issuetype = Bug "
                    + "AND issue in linkedIssues(STUD-" + ticketNumberSlot.value + ") "
                    + "ORDER BY created DESC";
        }
    } else {
        if (hasStatus) {
            jql = "project=" + projectName.toUpperCase()
                    + " AND status = '" + statusSlot.value.toUpperCase()
                    + "' AND issuetype = Bug "
                    + "AND status = Open "
                    + "ORDER BY created DESC";
        } else {
            jql = "project=" + projectName.toUpperCase()
                    + " AND issuetype = Bug "
                    + "AND status = Open "
                    + "ORDER BY created DESC";
        }
    }
    var url = config.endpoint + "search";
    console.log(url);
    console.log(jql);
    Request({
        url: url,
        method: "POST",
        json: true,
        body: {
            "jql": jql,
            "maxResults": config.maxResults
        },
        headers: {
            "Authorization": config.auth,
            "Accept": "application/json"
        }
    }, requestResult);
}

exports.getTicketSpeech = function (intent, response, body, alexaResponse) {
    var speechOutput, speech;
    var projectSlot = intent.slots.Project;
    var ticketNumberSlot = intent.slots.TicketNumber;

    var hasTicketNumber = ticketNumberSlot && ticketNumberSlot.value;

    var statusSlot = intent.slots.Status;
    var status = "Open";
    var hasStatus = statusSlot && statusSlot.value;
    if (hasStatus) {
        status = statusSlot.value;
    }

    if (response.statusCode === 200) {
        if (hasTicketNumber) {
            if (body.total === 0) {
                console.log(response.statusCode, body);
                speech = "<speak>I'm sorry, I couldn't find any " + status
                        + " bugs in the " + projectSlot.value + " for the ticket "
                        + "<say-as interpret-as='digits'>" + ticketNumberSlot.value.toString() + "</say-as></speak>";
            } else {
                console.log(body.issues[0].fields);
                speech = "<speak>"
                        + "There are <break time='0.5s'/>"
                        + body.issues.length.toString() + " "
                        + status + " bugs found for the story."
                        + "</speak>";
            }
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.SSML
            };
        } else {
            speechOutput = {
                speech: "<speak>There are<break strength='medium'/>" + body.total
                + " tickets found with the specified criteria</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
        }
    } else {
        speechOutput = {
            speech: "<speak>" + "I'm sorry, I couldn't find the information you were looking for." + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
    }
    console.log(speechOutput);
    alexaResponse.tell(speechOutput);
//    alexaResponse.tellWithCard(speechOutput, "Ticket status", intent);
}

exports.getDeveloperStatus = function (intent, session, requestResult) {
    var usernameSlot = intent.slots.Username;
    var hasUsername = usernameSlot && usernameSlot.value;

    var statusSlot = intent.slots.Status;
    var hasStatus = statusSlot && statusSlot.value;

    var jql;
    var url = config.endpoint + "search";
    console.log(usernameSlot.value);
    if (hasUsername) {
        if (hasStatus) {
            jql = "project=" + projectName.toUpperCase() + " AND status = '" + statusSlot.value + "' AND assignee = '" + usernameSlot.value + "'";
        } else {
            jql = "project=" + projectName.toUpperCase() + " AND status in (Open, \"In Progress\", Reopened) AND assignee = '" + usernameSlot.value + "'";
        }
    } else {
        if (hasStatus) {
            jql = "project=" + projectName.toUpperCase() + " AND status = '" + statusSlot.value + "' ORDER BY created DESC";
        }
        else {
            jql = "project=" + projectName.toUpperCase() + " AND status in (Open, \"In Progress\", Reopened) ORDER BY created DESC";
        }
    }
    console.log(url);
    console.log(jql);
    Request({
        url: url,
        method: "POST",
        json: true,
        body: {
            "jql": jql,
            "maxResults": config.maxResults
        },
        headers: {
            "Authorization": config.auth,
            "Accept": "application/json"
        }
    }, requestResult);
}

exports.getDeveloperSpeech = function (intent, response, body, alexaResponse) {
    var speechOutput, speech;
    var statusSlot = intent.slots.Status;

    var usernameSlot = intent.slots.Username;
    var hasUsername = usernameSlot && usernameSlot.value;

    var status = "Open";
    var hasStatus = statusSlot && statusSlot.value;
    if (hasStatus) {
        status = statusSlot.value;
    }

    console.log(response.statusCode, body);
    if (response.statusCode === 200) {
        if (hasUsername) {
            speech = "<speak>There are <break strength='medium'/>" + body.total.toString()
                    + " " + status
                    + " tickets found for "
                    + usernameSlot.value
                    + "</speak>";
        } else {
            speech = "<speak>There are<break strength='medium'/>" + body.total.toString()
                    + " " + status
                    + " tickets found"
                    + "</speak>";
        }
    } else {
        speech = "<speak>" + "I'm sorry, I couldn't find the information you were looking for." + "</speak>";
    }

    speechOutput = {
        speech: speech,
        type: AlexaSkill.speechOutputType.SSML
    };
    console.log(speechOutput);
    alexaResponse.tell(speechOutput);
//    alexaResponse.tellWithCard(speechOutput, "Developer status", intent);
}

exports.getTicketErrorSpeech = function (intent, response, error, alexaResponse) {
    var projectSlot = intent.slots.Project;
    var ticketNumberSlot = intent.slots.TicketNumber;
    var hasTicketNumber = ticketNumberSlot && ticketNumberSlot.value;

    var speechOutput, speech;
    if (hasTicketNumber) {
        speech = "<speak>I'm sorry, I couldn't find the status for the "
                + projectSlot.value.toUpperCase() + " - " + "<say-as interpret-as='digits'>"
                + ticketNumberSlot.value.toString() + "</say-as></speak>";
    } else {
        speech = "<speak>I'm sorry, I couldn't find the status for the project: "
                + projectSlot.value.toUpperCase() + "</speak>";
    }
    speechOutput = {
        speech: speech,
        type: AlexaSkill.speechOutputType.SSML
    };
    alexaResponse.tellWithCard(speechOutput, "Response Not available.", "No result found for asked question");
}


function buildRequest(url, method, jql) {
    if (method === Methods.GET) {
        return {
            url: url,
            method: method,
            json: true,
            headers: {
                "Authorization": config.auth,
                "Accept": "application/json"
            }
        }
    } else {
        return {
            url: url,
            method: method,
            json: true,
            body: {
                "jql": jql,
                "maxResults": config.maxResults
            },
            headers: {
                "Authorization": config.auth,
                "Accept": "application/json"
            }
        }
    }
}
