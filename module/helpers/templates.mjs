/**
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
    return loadTemplates([

        "systems/ias-fsg/templates/actor/parts/actor-talents.html",
        "systems/ias-fsg/templates/actor/parts/actor-items.html",
        "systems/ias-fsg/templates/actor/parts/actor-bio.html",
        "systems/ias-fsg/templates/actor/parts/actor-roll.html"
    ]);
};