function normalizeQuery(question = "") {

    let text = String(question || "")
        .toLowerCase()
        .trim();

    // ------------------------------------
    // Normalize whitespace
    // ------------------------------------

    text = text.replace(/\s+/g, " ");

    // ------------------------------------
    // Common spelling & wording fixes
    // ------------------------------------

    const replacements = {

        // Bullet
        "bullett": "bullet",
        "bulit": "bullet",
        "bulle": "bullet",

        // Dome
        "doom": "dome",
        "dom": "dome",

        // HikVision
        "hik vision": "hikVision",
        "hik vison": "hikVision",
        "hik visoin": "hikVision",

        // CP Plus
        "cp plus": "cpplus",
        "cp-plus": "cpplus",

        // WiFi
        "wi fi": "wifi",
        "wi-fi": "wifi",
        "wireless": "wifi",

        // Camera
        "cam": "camera",
        "cams": "camera",

        // PTZ
        "pan tilt zoom": "ptz",

        // Channels
        "4ch": "4 channel",
        "8ch": "8 channel",
        "16ch": "16 channel",
        "32ch": "32 channel",
        "64ch": "64 channel"
    };

    for (const key in replacements) {

        const regex = new RegExp(`\\b${escapeRegex(key)}\\b`, "gi");

        text = text.replace(regex, replacements[key]);

    }

    // ------------------------------------
    // Normalize price expressions
    // ------------------------------------

    text = text.replace(/\bupto\b/g, "up to");
    text = text.replace(/\bunder rs\.?\s*/g, "under ");
    text = text.replace(/\bbelow rs\.?\s*/g, "below ");
    text = text.replace(/\bover rs\.?\s*/g, "over ");
    text = text.replace(/\babove rs\.?\s*/g, "above ");

    // Remove commas from numbers
    text = text.replace(/(\d),(?=\d)/g, "$1");

    // Final cleanup
    text = text.replace(/\s+/g, " ").trim();

    return text;

}

// ------------------------------------

function escapeRegex(str = "") {

    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

}

module.exports = {
    normalizeQuery
};