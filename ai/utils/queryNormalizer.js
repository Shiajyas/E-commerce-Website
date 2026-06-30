const synonyms = require("../data/synonyms.json");

function normalizeQuery(question){

    let text = question.toLowerCase();

    text = text.replace(/\s+/g," ");

    const words = {

        "bulle":"bullet",
        "bulit":"bullet",
        "bullett":"bullet",

        "hik vison":"hikvision",
        "hik visoin":"hikvision",
        "hik vision":"hikvision",

        "cp plus":"cpplus",
        "cp-plus":"cpplus",

        "cam":"camera",
        "cams":"cameras",

        "8ch":"8 channel",
        "16ch":"16 channel",
        "32ch":"32 channel",
        "64ch":"64 channel"

    };

    for(const key in words){

        text=text.replaceAll(key,words[key]);

    }

    return text;

}

module.exports={
    normalizeQuery
};