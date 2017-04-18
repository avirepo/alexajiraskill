'use strict'

var config = require('./common/projectConfig');
var appId = config.appId;

var AlexaSkill = require('./skillAnalyzer/AlexaSkill')
var SkillFactory = require('./skillAnalyzer/SkillFactory');


var JirAlexa = function () {
    AlexaSkill.call(this, appId);
};

JirAlexa.prototype = Object.create(AlexaSkill.prototype);
JirAlexa.prototype.constructor = JirAlexa;

JirAlexa.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = "Welcome to your Jira Story Board. Now, what can I help you...";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

JirAlexa.prototype.intentHandlers = {
    "ProjectStatus": function (intent, session, alexaResponse) {
        var projectSlot = intent.slots.Project;
        var hasProject = projectSlot && projectSlot.value;

        if (!hasProject) {
            getNotFoundSpeech(alexaResponse, session);
        } else {
            var SkillsAnalyzer = SkillFactory.create(projectSlot.value);

            SkillsAnalyzer.getProjectStatus(intent, session
                    , function (error, response, body) {
                        if (error) {
                            console.log(error);
                            SkillsAnalyzer.getTicketErrorSpeech(intent, response, error, alexaResponse);
                        } else {
                            SkillsAnalyzer.getProjectSpeech(intent, response, body, alexaResponse);
                        }
                    });
        }
    },

    "TicketStatus": function (intent, session, alexaResponse) {
        var projectSlot = intent.slots.Project;
        var hasProject = projectSlot && projectSlot.value;

        if (!hasProject) {
            getNotFoundSpeech(alexaResponse, session);
        } else {
            var SkillsAnalyzer = SkillFactory.create(projectSlot.value);

            SkillsAnalyzer.getTicketStatus(intent, session
                    , function (error, response, body) {
                        if (error) {
                            console.log(error);
                            SkillsAnalyzer.getTicketErrorSpeech(intent, response, error, alexaResponse);
                        } else {
                            SkillsAnalyzer.getTicketSpeech(intent, response, body, alexaResponse);
                        }
                    });
        }
    },

    "DeveloperStatus": function (intent, session, alexaResponse) {
        var usernameSlot = intent.slots.Username;
        var projectSlot = intent.slots.Project;

        var hasUsername = usernameSlot && usernameSlot.value;
        var hasProject = projectSlot && projectSlot.value;

        if (!hasUsername || !hasProject) {
            getNotFoundSpeech(alexaResponse, session);
        } else {
            var SkillsAnalyzer = SkillFactory.create(projectSlot.value);

            SkillsAnalyzer.getDeveloperStatus(intent, session, function (error, response, body) {
                if (error) {
                    console.log(error);
                    SkillsAnalyzer.getTicketErrorSpeech(intent, response, error, alexaResponse);
                } else {
                    SkillsAnalyzer.getDeveloperSpeech(intent, response, body, alexaResponse);
                }
            });
        }

    },
    "AMAZON.StopIntent": function () {
        var speechOutput = "Goodbye";
        this.tell(speechOutput);
    },
    "AMAZON.YesIntent": function () {
        var speechOutput = "Yes";
        this.tell(speechOutput);
    },
    "AMAZON.NoIntent": function () {
        var speechOutput = "I'm sorry, I couldn't find any details.";
        this.tell(speechOutput);
    },
    "AMAZON.CancelIntent": function () {
        var speechOutput = "Goodbye";
        this.tell(speechOutput);
    },
    "AMAZON.HelpIntent": function () {
        var speechText = "You can ask questions about Ticket Status such as, what's the number of open tickets for Kafka, or, you can say exit... Now, what can I help you with?";
        var repromptText = "You can say things like, what's the number of open tickets for Kafka, or you can say exit... Now, what can I help you with?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        this.ask(speechOutput, repromptOutput);
    }
}

function getNotFoundSpeech(alexaResponse, session) {
    var speechOutput;
    speechOutput = {
        speech: "<speak>" + "I'm sorry, I couldn't find the information you were looking for." + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
//    alexaResponse.tell(speechOutput);
    alexaResponse.tellWithCard(speechOutput, "No Project","Not found");
}

exports.handler = function (event, context) {
    var jirAlexa = new JirAlexa();
    jirAlexa.execute(event, context);
}
