import { IASActor } from "./documents/actor.mjs";
import { IASItem } from "./documents/item.mjs";
import { IASActorSheet } from "./sheets/actor-sheet.mjs";
import { IASItemSheet } from "./sheets/item-sheet.mjs";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { IAS_CONFIG } from "./helpers/config.mjs";

CONFIG.IAS = IAS_CONFIG;
CONFIG.Actor.documentClass = IASActor;

Hooks.once('init', async function () {

    game.ias = {
        IASActor,
        IASItem
    };

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("ias", IASActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("ias", IASItemSheet, { makeDefault: true });

    return preloadHandlebarsTemplates();
});

/*todo
Handlebars.registerHelper('getRollModByAttribute', function (attributesWithRollMod, attribute) {
    debugger;
    if (attributesWithRollMod) {
        for (let attributeBonus of attributesWithRollMod) {
            if (attribute === attributeBonus.name) {
                return attributeBonus.value;
            } else {
                return '0';
            }
        }
    } else {
        return '0';
    }
});*/
