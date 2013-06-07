Ext.namespace('App');

/**
 * A button that triggers a menu (list) to select measures.
 */
App.MeasureChooser = Ext.extend(Ext.Button, {

    measureStore: null,
    levelsStore: null,
    disabled: true,

    type: null,

    constructor: function(config) {
        this.addEvents(

            /**
            * @event select
            * Fires when a dimension is chosen
            * @param {Object} An object with dimension and hierarchy
            */
           'select'
        );
    
        this.menu = {};
        this.measureStore = App.cubeProperties.measures;
        
        
        var testLoad = function() {
            if (App.queryMgr.getQuery() && this.measureStore.getCount()>0) {
                clearInterval(interval);
                this.onDataLoad();
            }
        };
        var interval = window.setInterval(testLoad.createDelegate(this), 200);
        
        App.queryMgr.events.on({
            'update': function() {
                this.filter();
            },
            scope: this
        });

        App.MeasureChooser.superclass.constructor.call(this, config);
    },

    onMeasureSelect: function(item) {
        this.fireEvent('select', item.unique_name);
    },
    
    /**
     * Method: onDataLoad
     */
    onDataLoad: function() {
        this.enable();
        this.measureStore.each(function(measure) {
            this.menu.add([{
                    text: measure.get('MEASURE_NAME'),
                    unique_name: measure.get('MEASURE_UNIQUE_NAME'),
                    handler: this.onMeasureSelect,
                    scope: this
                }]);
        }, this);
        // select the first measure found if there is only one measure
        if (this.measureStore.getCount()==1) {
            this.onMeasureSelect(this.menu.getComponent(0));
        }
    },

    /**
     * Method: filter
     * Filters the measure store to avoid selecting a measure twice
     * (hides selected measures).
     */
    filter: function() {
        var filter = function(item) {
            return App.queryMgr.getMeasures().indexOf(item.get('MEASURE_UNIQUE_NAME'))==-1 &&
                item.get('type') == this.type;
        }.createDelegate(this);
        this.measureStore.filterBy(filter);
        this.menu.removeAll();
        this.onDataLoad();
        this.measureStore.clearFilter();
    }

});
