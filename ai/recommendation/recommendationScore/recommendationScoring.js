function normalize(text = "") {
    return String(text).toLowerCase().trim();
}

// ----------------------------
// Score helper
// ----------------------------
function clamp(num, min, max) {
    return Math.max(min, Math.min(max, num));
}

function recommendationScoringV3(products, requirements = {}, ruleFilters = {}) {

    const categories = (ruleFilters.category || []).map(normalize);
    const features = (ruleFilters.feature || []).map(normalize);
    const reqBrand = normalize(requirements.brand || "");
    const reqBudget = requirements.maxPrice;

    // Track diversity (to avoid repetition)
    const seenBrands = new Map();
    const seenCategories = new Map();

    return products
        .map(product => {

            let score = 0;
            const reasons = [];

            const pCategory = normalize(product.category);
            const pFeature = normalize(product.feature);
            const pBrand = normalize(product.brand);

            // ----------------------------
            // CATEGORY MATCH (strong + soft)
            // ----------------------------
            if (categories.includes(pCategory)) {
                score += 40;
                reasons.push("Exact category match");
            } else if (categories.some(c => pCategory.includes(c))) {
                score += 20;
                reasons.push("Partial category match");
            } else {
                score -= 10; // irrelevant penalty
            }

            // ----------------------------
            // FEATURE MATCH
            // ----------------------------
            if (features.includes(pFeature)) {
                score += 25;
                reasons.push("Feature match");
            }

            // ----------------------------
            // BRAND MATCH
            // ----------------------------
            if (reqBrand && pBrand === reqBrand) {
                score += 30;
                reasons.push("Brand match");
            }

            // ----------------------------
            // BUDGET SCORING (GRADIENT)
            // ----------------------------
            if (reqBudget != null) {

                const price = product.salePrice;

                if (price <= reqBudget) {
                    const ratio = price / reqBudget;

                    // cheaper = better but not too biased
                    score += clamp(30 * (1 - ratio), 5, 30);

                    reasons.push("Within budget");
                } else {
                    // penalty increases with distance
                    const overshoot = price - reqBudget;
                    score -= clamp(overshoot / 500, 5, 25);

                    reasons.push("Over budget penalty");
                }
            }

            // ----------------------------
            // STOCK HEALTH
            // ----------------------------
            if (product.quantity > 50) score += 15;
            else if (product.quantity > 20) score += 10;
            else if (product.quantity > 0) score += 5;
            else score -= 25;

            // ----------------------------
            // IP / TECH BOOST
            // ----------------------------
            if (pCategory.includes("ip")) {
                score += 8;
            }

            // ----------------------------
            // DIVERSITY PENALTY (brand repetition control)
            // ----------------------------
            if (seenBrands.has(pBrand)) {
                score -= seenBrands.get(pBrand) * 5;
            }

            seenBrands.set(
                pBrand,
                (seenBrands.get(pBrand) || 0) + 1
            );

            // ----------------------------
            // CATEGORY DIVERSITY
            // ----------------------------
            if (seenCategories.has(pCategory)) {
                score -= seenCategories.get(pCategory) * 3;
            }

            seenCategories.set(
                pCategory,
                (seenCategories.get(pCategory) || 0) + 1
            );

            // ----------------------------
            // FINAL NORMALIZATION (0 - 100)
            // ----------------------------
            score = clamp(score, 0, 100);

            return {
                ...product,
                recommendationScore: Math.round(score),
                reasons
            };
        })

        // stable sorting (important for UI consistency)
        .sort((a, b) => {
            if (b.recommendationScore === a.recommendationScore) {
                return b.salePrice - a.salePrice;
            }
            return b.recommendationScore - a.recommendationScore;
        });
}

module.exports = recommendationScoringV3;