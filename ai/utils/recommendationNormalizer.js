function normalizeRecommendation(question = "") {

    const q = question.toLowerCase();

    const result = {
        question,

        // Environment
        indoor: false,
        outdoor: false,

        // Usage
        home: false,
        office: false,
        shop: false,
        warehouse: false,
        parking: false,
        school: false,
        hospital: false,
        factory: false,
        farm: false,
        hotel: false,
        bank: false,

        // Coverage
        longRange: false,
        wideCoverage: false,

        // Recommendation hints
        categories: [],
        features: [],
        brands: []
    };

    //----------------------------------
    // OFFICE
    //----------------------------------

    if (
        q.includes("office") ||
        q.includes("meeting room") ||
        q.includes("conference room") ||
        q.includes("reception") ||
        q.includes("corridor") ||
        q.includes("lobby")
    ) {

        result.office = true;
        result.indoor = true;

        result.categories.push(
            "Dome",
            "Dome IP"
        );
    }

    //----------------------------------
    // HOME
    //----------------------------------

    if (
        q.includes("home") ||
        q.includes("house") ||
        q.includes("villa") ||
        q.includes("apartment") ||
        q.includes("flat")
    ) {

        result.home = true;

        result.categories.push(
            "Dome",
            "Bullet"
        );
    }

    //----------------------------------
    // SHOP
    //----------------------------------

    if (
        q.includes("shop") ||
        q.includes("store") ||
        q.includes("showroom") ||
        q.includes("supermarket")
    ) {

        result.shop = true;
        result.indoor = true;

        result.categories.push(
            "Dome",
            "Dome IP"
        );
    }

    //----------------------------------
    // WAREHOUSE
    //----------------------------------

    if (
        q.includes("warehouse")
    ) {

        result.warehouse = true;
        result.outdoor = true;

        result.categories.push(
            "Bullet",
            "Bullet IP"
        );
    }

    //----------------------------------
    // PARKING
    //----------------------------------

    if (
        q.includes("parking") ||
        q.includes("parking lot")
    ) {

        result.parking = true;
        result.outdoor = true;

        result.categories.push(
            "Bullet",
            "Bullet IP"
        );
    }

    //----------------------------------
    // SCHOOL
    //----------------------------------

    if (
        q.includes("school") ||
        q.includes("college") ||
        q.includes("classroom")
    ) {

        result.school = true;
        result.indoor = true;

        result.categories.push(
            "Dome",
            "Dome IP"
        );
    }

    //----------------------------------
    // HOSPITAL
    //----------------------------------

    if (
        q.includes("hospital") ||
        q.includes("clinic")
    ) {

        result.hospital = true;
        result.indoor = true;

        result.categories.push(
            "Dome",
            "Dome IP"
        );
    }

    //----------------------------------
    // FACTORY
    //----------------------------------

    if (
        q.includes("factory")
    ) {

        result.factory = true;
        result.outdoor = true;

        result.categories.push(
            "Bullet",
            "Bullet IP"
        );
    }

    //----------------------------------
    // FARM
    //----------------------------------

    if (
        q.includes("farm") ||
        q.includes("garden")
    ) {

        result.farm = true;
        result.outdoor = true;

        result.categories.push(
            "Bullet",
            "Bullet IP"
        );
    }

    //----------------------------------
    // HOTEL
    //----------------------------------

    if (
        q.includes("hotel")
    ) {

        result.hotel = true;
        result.indoor = true;

        result.categories.push(
            "Dome",
            "Dome IP"
        );
    }

    //----------------------------------
    // BANK
    //----------------------------------

    if (
        q.includes("bank") ||
        q.includes("atm")
    ) {

        result.bank = true;
        result.indoor = true;

        result.categories.push(
            "Dome IP"
        );
    }

    //----------------------------------
    // LONG RANGE
    //----------------------------------

    if (
        q.includes("long range") ||
        q.includes("far") ||
        q.includes("distance")
    ) {

        result.longRange = true;

        result.categories.push(
            "Bullet",
            "Bullet IP"
        );
    }

    //----------------------------------
    // WIDE COVERAGE
    //----------------------------------

    if (
        q.includes("360") ||
        q.includes("wide") ||
        q.includes("full room") ||
        q.includes("large area")
    ) {

        result.wideCoverage = true;

        result.categories.push(
            "Dome",
            "Dome IP"
        );
    }

    //----------------------------------
    // FEATURES
    //----------------------------------

    if (q.includes("wifi"))
        result.features.push("WiFi");

    if (q.includes("night vision"))
        result.features.push("Night Vision");

    if (q.includes("human detection"))
        result.features.push("Human Detection");

    if (q.includes("motion detection"))
        result.features.push("Motion Detection");

    if (q.includes("audio"))
        result.features.push("Audio");

    if (q.includes("two way audio"))
        result.features.push("Two Way Audio");

    if (q.includes("full color"))
        result.features.push("Full Color");

    if (q.includes("poe"))
        result.features.push("PoE");

    if (
        q.includes("number plate") ||
        q.includes("anpr")
    ) {
        result.features.push("Number Plate Detection");
    }

    //----------------------------------
    // BRANDS
    //----------------------------------

    if (q.includes("hikvision"))
        result.brands.push("HikVision");

    if (q.includes("cpplus"))
        result.brands.push("CpPlus");

    //----------------------------------
    // Indoor / Outdoor Feature
    //----------------------------------

    if (result.indoor)
        result.features.push("Indoor");

    if (result.outdoor)
        result.features.push("Outdoor");

    //----------------------------------
    // Remove duplicates
    //----------------------------------

    result.categories = [...new Set(result.categories)];
    result.features = [...new Set(result.features)];
    result.brands = [...new Set(result.brands)];

    return result;
}

module.exports = {
    normalizeRecommendation
};