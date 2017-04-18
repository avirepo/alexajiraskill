'use strict'

exports.create = function (projectName) {
//    var skillAnalyzer = null;
//    if (projectName.toUpperCase() == "StudentNest".toUpperCase() || projectName.toUpperCase() == "Student Nest".toUpperCase()) {
//        skillAnalyzer = require('./jira/STUDJiraAnalyzer');
//    } else {
//        skillAnalyzer = require('./apache/DefaultJiraAnalyzer');
//    }
    return require('./jira/STUDJiraAnalyzer');
}