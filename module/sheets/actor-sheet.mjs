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
            this._prepareItems(context);
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

    /**
   * @param {Object} actorData
   *
   * @return {undefined}
   */
    _prepareItems(context) {
        const skills = [];

        for (let i of context.items) {
            i.img = i.img || DEFAULT_TOKEN;
            if (i.type === 'skill') {
                skills.push(i);
            }
        }

        context.skills = skills;
    }


    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.rollable').click(this._onRoll.bind(this));

        html.find('.status__img').click(this._toggleStatus.bind(this));

        html.find('.talent__poolmod').click(this._updateTalentPoolMod.bind(this));
        html.find('.talent__poolmodremover').click(this._removeTalentPoolMod.bind(this));

        html.find('.viewmode').click(this._switchToEditMode.bind(this));
        html.find('.editmode').blur(this._switchToViewMode.bind(this));

        html.find('.item-create').click(ev => {
            this._onItemCreate(ev).then((item) => item.sheet.render(true));
        });
        html.find('.item-edit').click(ev => {
            const sheetItem = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(sheetItem.data("itemId"));
            item.sheet.render(true);
        });
        html.find('.item-delete').click(ev => {
            const sheetItem = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(sheetItem.data("itemId"));

            let d = new Dialog({
                title: game.i18n.format("IAS.DeletionModal.Title", { itemName: item.name }),
                content: "<p>" + game.i18n.format("IAS.DeletionModal.Content", { itemName: item.name }) + "</p>",
                buttons: {
                    yes: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize("IAS.Yes"),
                        callback: () => {
                            item.delete();
                            sheetItem.slideUp(200, () => this.render(false));
                        }
                    },
                    no: {
                        icon: '<i class="fas fa-times"></i>',
                        label: game.i18n.localize("IAS.No"),
                    }
                },
                default: "no"
            });
            d.render(true);
        });
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

    _updateTalentPoolMod(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const talentKey = element.dataset.talent;
        const talentType = element.dataset.type;
        let actor = this.actor;
        let attributesCopy = duplicate(actor.system.attributes);
        let itemsCopy = duplicate(actor.items);
        let talentPoolMod;
        const globalPoolMod = this._getGlobalPoolMod(attributesCopy, itemsCopy);

        if (talentType === 'attribute') {
            talentPoolMod = attributesCopy[talentKey].poolMod;
            attributesCopy[talentKey].poolMod = this._increaseTalentPoolMod(talentPoolMod, globalPoolMod);
            actor.update({ "system.attributes": attributesCopy });
        } else {
            talentPoolMod = itemsCopy.find(({ _id }) => _id === talentKey).system.poolMod;
            itemsCopy.find(({ _id }) => _id === talentKey).system.poolMod = this._increaseTalentPoolMod(talentPoolMod, globalPoolMod);
            actor.update({ "items": itemsCopy });
        }
    }

    _increaseTalentPoolMod(talentPoolMod, globalPoolMod) {
        if (globalPoolMod < 2) {
            talentPoolMod++;
        } else {
            return ui.notifications.warn(game.i18n.localize(CONFIG.IAS.alert.maxPoolMod));
        }
        return talentPoolMod;
    }

    _removeTalentPoolMod(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const talentKey = element.dataset.talent;
        const talentType = element.dataset.type;
        let actor = this.actor;
        let attributesCopy = duplicate(actor.system.attributes);
        let itemsCopy = duplicate(actor.items);

        if (talentType === 'attribute') {
            attributesCopy[talentKey].poolMod = 0;
            actor.update({ "system.attributes": attributesCopy });
        } else {
            itemsCopy.find(({ _id }) => _id === talentKey).system.poolMod = 0;
            actor.update({ "items": itemsCopy });
        }
    }

    _getGlobalPoolMod(attributesCopy, itemsCopy) {
        let globalPoolMod = 0;

        for (let attribute of Object.values(attributesCopy)) {
            globalPoolMod = globalPoolMod + attribute.poolMod;
        }
        for (let item of Object.values(itemsCopy)) {
            globalPoolMod = globalPoolMod + item.system.poolMod;
        }

        return globalPoolMod;
    }

    _switchToEditMode(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const editElement = document.querySelector('[data-element*="' + element.dataset.element + 'Edit' + '"]');

        element.classList.toggle("invisible");
        editElement.classList.toggle("invisible");
        editElement.focus();

    }

    _switchToViewMode(event) {
        event.preventDefault();
        const editElement = event.currentTarget;

        if (editElement.value === editElement.dataset.lastValue) {
            const element = document.querySelector('[data-element*="' + editElement.dataset.element.slice(0, editElement.dataset.element.length - 4) + '"]');

            element.classList.toggle("invisible");
            editElement.classList.toggle("invisible");
        }
    }


    /**
     * @param {Event} event
     * @private
     */
    async _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        const type = header.dataset.type;
        const name = `New ${type.capitalize()}`;

        const itemData = {
            name: name,
            type: type
        };

        return await Item.create(itemData, { parent: this.actor });
    }
}