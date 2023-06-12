/**
 * @extends {ItemSheet}
 */
export class IASItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 520,
            height: 480
        });
    }

    /** @override */
    get template() {
        const path = "systems/ias-fsg/templates/item";
        return `${path}/item-${this.item.type}-sheet.html`;
    }


    /** @override */
    getData() {
        const context = super.getData();
        const itemData = context.item;

        context.rollData = {};
        let actor = this.object?.parent ?? null;
        if (actor) {
          context.rollData = actor.getRollData();
        }

        context.system = itemData.system;
        context.flags = itemData.flags;
        return context;
    }


    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
    }
}
