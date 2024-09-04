class PluginClass {
    constructor(params, config) {
        this.params = {
            ...params,
        };
    }

    /** the following values of 'event' possible
     * init - before start gitrep
     * done - before closing
     * */
    async action(event, config) {
        // abstact
    }
}

module.exports = PluginClass;
