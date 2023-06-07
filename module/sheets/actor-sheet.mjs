/**
 * @extends {ActorSheet}
 */
export class IASActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/ias-fsg/templates/actor/actor-sheet.html",
            width: 600,
            height: 600,
            tabs: [{ navSelector: ".nav", contentSelector: ".sheet__body", initial: "skills" }]
        });
    }

    /** @override */
    get template() {
        return `systems/ias-fsg/templates/actor/actor-${this.actor.type}-sheet.html`;
    }

    /** @override */
    getData() {
        const context = super.getData();
        const actorData = this.actor.toObject(false);

        context.system = actorData.system;
        context.flags = actorData.flags;

        if (actorData.type == 'character') {
            this._prepareCharacterData(context);
        }

        context.rollData = context.actor.getRollData();

        return context;
    }

    _prepareCharacterData(context) {
        for (let [k, v] of Object.entries(context.system.reserves)) {
            v.label = game.i18n.localize(CONFIG.IAS.reserves[k]) ?? k;
        }
        for (let [k, v] of Object.entries(context.system.status)) {
            v.label = game.i18n.localize(CONFIG.IAS.status[k]) ?? k;
        }
        for (let [k, v] of Object.entries(context.system.attributes)) {
            v.label = game.i18n.localize(CONFIG.IAS.attributes[k]) ?? k;
        }
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.rollable').click(this._onRoll.bind(this));

        html.find('.status__img').click(this._toggleStatus.bind(this));

        html.find('.attribute__poolmod').click(this._addAttributePoolMod.bind(this));
        html.find('.attribute__poolmodremover').click(this._removeAttributePoolMod.bind(this));
    }

    _onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        //todo
    }

    _toggleStatus(event) {
        event.preventDefault();
        const element = event.currentTarget;

        element.classList.toggle("status__img--active");
    }

    _addAttributePoolMod(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const attributeKey = element.dataset.attribute;
        let attributesCopy = duplicate(this.actor.system.attributes);
        let attributePoolMod = attributesCopy[attributeKey].poolMod;
        let globalPoolMod = 0;

        /*todo extract getGlobalPoolMod to actor*/
        for (let attributeVal of Object.values(attributesCopy)) {
            globalPoolMod = globalPoolMod + attributeVal.poolMod;
        }

        if(globalPoolMod <2){
            attributePoolMod++;
        }

        attributesCopy[attributeKey].poolMod = attributePoolMod;
        this.actor.update({ "system.attributes": attributesCopy});
    }

    _removeAttributePoolMod(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const attributeKey = element.dataset.attribute;
        let attributesCopy = duplicate(this.actor.system.attributes);

        attributesCopy[attributeKey].poolMod = 0;
        this.actor.update({ "system.attributes": attributesCopy});
    }
}