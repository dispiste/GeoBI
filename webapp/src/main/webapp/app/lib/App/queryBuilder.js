Ext.namespace('App');

App.queryBuilder = function(options) {

    // private
    var _events = new Ext.util.Observable();

    /**
     * Method: build
     * Builds the builder (yeah!) using the current query
     */
    var build = function() {
        var query = App.queryMgr.getQuery(),
            cols = query.cols,
            rows = query.rows,
            measures = query.measure.members,
            i;

        // remove all the DimensionSelectors, ie. clear the queryBuilder
        Ext.ComponentMgr.all.each(function(component) {
            if (component instanceof App.DimensionSelector || component instanceof App.MeasureQueryUI) {
                component.destroy();
            }
        });

        for (i = 0; i < rows.length; i++) {
            addDimension(spatialBlock, rows[i]);
        }
        for (i = 0; i < cols.length; i++) {
            addDimension(thematicBlock, cols[i]);
        }
        
        for (i=0; i<measures.length; i++) {
            addMeasure(measures[i]);
        }
    };

    App.queryMgr.events.on({
        'update': function() {
            build();
            var query = App.queryMgr.getQuery();
            queryButton.setDisabled(query.rows.length < 1 || query.measure.members.length < 1);
            relativeCheckBox.setDisabled(query.cols.length<1);
        }
    });

    /**
     * adds a new DimensionSelector to a block
     *
     * Parameters:
     * block - the block to insert the new dimension in
     * config - the config object for the dimension to add
     */
    var addDimension = function(block, config) {
        var selector = new App.DimensionSelector(config);
        selector.on({
            'remove': function() {
                App.queryMgr.removeDimension(config.dimension);
            },
            'change': function() {
                App.queryMgr.setMembers(config.dimension, selector.members);
            }
        });
        block.insert(
            block.items.getCount() - 1,
            selector
        );
        block.doLayout();
    };
    
    /**
     * the spatial dimension chooser
     */
    var spatialBlock = new Ext.Panel({
        items:[{
            xtype: 'box',
            html: '<h3>Spatial dimensions</h3>'
        },
            new App.DimensionChooser({
                text: 'Add new dimension',
                iconCls: 'add',
                spatial: true,
                listeners: {
                    'select': function(level) {
                        var dimension = App.cubeProperties
                            .findLevelByUniqueName(level)
                            .get('DIMENSION_UNIQUE_NAME');
                        App.queryMgr.addRowDimension(dimension, level);
                    }
                }
            })
        ]
    });

    var thematicBlock = new Ext.Panel({
        items:[{
            xtype: 'box',
            html: '<h3>Thematic dimensions</h3>'
        },
            new App.DimensionChooser({
                text: 'Add new dimension',
                iconCls: 'add',
                listeners: {
                    'select': function(level) {
                        var dimension = App.cubeProperties
                            .findLevelByUniqueName(level)
                            .get('DIMENSION_UNIQUE_NAME');
                        App.queryMgr.addColDimension(dimension, level);
                    }
                }
            })
        ]
    });

    /*
    // FIXME: selects the first measure if there is only one measure
    var selectFirstMeasure = function() {
        var r = measureCombo.store.getAt(0);
        var value = r.get('MEASURE_UNIQUE_NAME');
        measureCombo.setValue(value);
        App.queryMgr.addMeasure(
            value);
    };
     */

    var relativeCheckBox = new Ext.form.Checkbox({
        boxLabel: 'Relative values (%)',
        disabled: true
    });
    relativeCheckBox.on({
        'check': function(checkbox, checked) {
            App.queryMgr.useRelativeValues(checked);
        }
    });
    
    var measureBlock = new Ext.Panel({
        items:[{
            xtype: 'box',
            html: '<h3>Measures</h3>'
        },
            new App.MeasureChooser({
                text: 'Add new measure',
                iconCls: 'add',
                listeners: {
                    'select': function(measure) {
                        App.queryMgr.addMeasure(measure);
                    }
                }
            }),
            relativeCheckBox
        ]
    });
    
    /**
     * adds a new DimensionSelector to a block
     *
     * Parameters:
     * block - the block to insert the new dimension in
     * config - the config object for the dimension to add
     */
    var addMeasure = function(config) {
        var measureUI = new App.MeasureQueryUI(config);
        measureUI.on({
            'remove': function() {
                App.queryMgr.removeMeasure(config);
            }
        });
        measureBlock.insert(
            measureBlock.items.getCount() - 2,
            measureUI
        );
        measureBlock.doLayout();
    };
    
    var mdxInfo = new Ext.form.TextArea({
        width: '98%',
        height: 150,
        editable: false
    });
    var mdxInfoBlock = new Ext.Container({
        autoEl: {
            tag: 'div',
            style: 'display: none'
        },
        items: [
            mdxInfo
        ]
    });

    var queryButton = new Ext.Button({
        text: 'Execute query',
        iconCls: 'execute',
        handler: App.queryMgr.executeQuery,
        disabled: true
    });

    App.queryMgr.events.on({
        'beforequeryregistered': function() {
            queryButton.setIconClass('loading');
        },
        'queryregistered': function() {
            queryButton.setIconClass(queryButton.initialConfig.iconCls);
        }
    });

    // public
    return {

        events: _events,

        /**
         * APIProperty: panel
         */
        panel: new Ext.Panel({
            border: false,
            bodyStyle: 'padding: 2px;',
            defaults: {
                baseCls: "x-box",
                frame: true,
                style: "padding: 2px;"
            },
            items:[
                spatialBlock,
                thematicBlock,
                measureBlock,
                mdxInfoBlock
            ],
            buttons: [queryButton]
        })
    };
}();

