

function parseJson(text) {
    try {
        // Remove markdown code fences
        text = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("JSON Parse Error");
        console.error(text);
        throw error;
    }
}

module.exports = parseJson;