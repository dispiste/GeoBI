Ext.namespace('App');

App.chart = function() {
    // private
    var disabled = false;
    var setDisabled = function(d) {
        disabled = d;
    }
    
    var isDisabled = function() {
        return disabled;
    }
    
    var onItemCheck = function(item) {
        type = item.charttype;
        updateChart();
    };

    var styleBtn = new Ext.Button({
        text: 'Choose chart type',
        tooltip: 'Modify chart styling',
        cls: 'x-box',
        iconCls: 'style',
        menu: {
            items: [{
                text: 'Default',
                charttype: 'default',
                checked: true,
                group: 'chart-type',
                checkHandler: onItemCheck
            }, {
                text: 'Pie by row',
                charttype: 'piebyrow',
                checked: false,
                group: 'chart-type',
                checkHandler: onItemCheck
            }, {
                text: 'Pie by column',
                charttype: 'pie',
                checked: false,
                group: 'chart-type',
                checkHandler: onItemCheck
            }, {
                text: 'Vertical bars',
                charttype: 'bar',
                checked: false,
                group: 'chart-type',
                checkHandler: onItemCheck
            }, {
                text: 'Horizontal bars',
                charttype: 'horizontalbar',
                checked: false,
                group: 'chart-type',
                checkHandler: onItemCheck
            }]
        }
    });

    var relativeAbsoluteBtn = new Ext.CycleButton({
        showText: true,
        prependText: 'Values: ',
        tooltip: 'Display relative/absolute values',
        cls: 'x-box',
        disabled: true,
        items: [{ 
            text: 'relative',
            checked: true
        }, {
            text: 'absolute'
        }],
        changeHandler: function(btn, item) {
            updateChart();
        }
    });
    
    var type = "default";

    var container = new Ext.Container({
        collapsible: true,
        border: false,
        hidden: true,
        disabled: true,
        items: [
            {
                xtype: 'toolbar',
                cls: 'x-toolbar-no-style',
                items: [styleBtn, relativeAbsoluteBtn]
            },
            {
                ref: 'resizableCmp',
                height: 600,
                border: false,
                layout: 'fit',
                style: 'background-color: #dfdfdf',
                items: [{
                    ref: '../chartImg'
                }, {
                    ref: '../chartMaparea'
                }]
            },{
                height: 100,
                border: false
            }
        ]
    });

    // add a resize handle at the bottom of this widget
    container.resizableCmp.on('render', function() {
        el = Ext.get(container.resizableCmp.body.dom);
        el.resizer = new Ext.Resizable(el.id, {
            handles : 's',
            minHeight: 100
        });
        el.resizer.on('resize', function(r,w,h,e) {
            container.resizableCmp.setSize(w, h); 
            updateChart.defer(100);
        });
    });

    var indicatorsStore = new Ext.data.JsonStore({
        fields: ['data_index', 'name'],
        root: 'choropleths_indicators'
    });

    var updateChart = function() {
        var id = Ext.id();
        var url = getChartUrl();
        container.chartImg.update('<img id="' + id + '_img" usemap="#' + id + '" src="' + url + '" />');

        container.chartMaparea.getEl().getUpdater().update({
            url: url + '&map=true&imagemapId=' + id,
            scripts: false
        });
    };

    /**
     * getChartUrl
     */
    var getChartUrl = function() {
        if (App.queryMgr.getQuery().relative) {
            indicatorsStore.filterBy(function(record, id) {
                if (record.get('name').indexOf('Total') != -1) {
                    return false;
                }
                if (relativeAbsoluteBtn.getActiveItem().text == 'relative') {
                    if (record.get('name').indexOf('%') != -1) {
                        return true;
                    }
                } else {
                    if (record.get('name').indexOf('%') == -1) {
                        return true;
                    }
                }
            });
            relativeAbsoluteBtn.setDisabled(false);
        }
        var chartType = getChartType();
        var componentSize = container.chartImg.body.getSize();
        var size = getChartSize(chartType, componentSize);
        container.resizableCmp.setSize(size.width, size.height);
        var params = {
            queryId: App.queryId,
            indicators: indicatorsStore.collect('data_index').join(','),
            width: size.width - 2,
            height: size.height - 2,
            type: chartType
        };
        return 'getchart?' + Ext.urlEncode(params);
    };

    var loadIndicators = function() {
        if (!disabled) {
            indicatorsStore.loadData(App.metadata);
            updateChart();
        }
    };
    
    var getChartType = function() {
        if (type==="default") {
            query = App.queryMgr.getQuery();
            // only use pie if measures==1 && themDims==1 && cols<6 && all thematic members are selected
            // otherwise if does not really make sense
            if (query && query.measure && query.cols && query.rows) {
                var measures = query.measure.members.length;
                var thematicDims = query.cols.length;
                if (measures==1 && thematicDims==1) {
                    var columns = App.queryMgr.getNumCols(query);
                    if ( columns<6) {
                        if (query.cols[0].members) {
                            var thematicMembers = App.cubeProperties.getMembersCountByLevel(query.cols[0].level);
                            var selectedThematicMembers = query.cols[0].members.length;
                            if (thematicMembers==selectedThematicMembers) {
                                return "piebyrow";
                            }
                        }
                        else {
                            return "piebyrow";
                        }
                    }
                }
            }
            return "horizontalbar";
        }
        return type;
    };
    
    var getChartSize = function(chartType, currentSize) {
        var query = App.queryMgr.getQuery();
        var height, width;
        if (chartType=="horizontalbar") {
            var rows = App.queryMgr.getNumRows(query);
            var columns = App.queryMgr.getNumCols(query);
            var measures =  query.measure.members.length;
            height = rows*columns*measures*10;
            // width: same as component
            width = currentSize.width;
        }
        else if (chartType=="piebyrow") {
            var rows = App.queryMgr.getNumRows(query);
            height = Math.ceil(rows/5)*140;
            // width: same as component
            width = currentSize.width;
        }
        else if (chartType=="pie") {
            var columns = App.queryMgr.getNumCols(query);
            height = Math.ceil(columns/5)*140;
            // width: same as component
            width: currentSize.width;
        }
        else if (chartType=="bar") {
            // same as component
            height = currentSize.height;
            width = currentSize.width;
        }
        if (height==0) { // workaround a corner case where the query has not been loaded yet
            console.log("getChartSize: query was not ready yet");
            height = currentSize.height;
        }
        return {height: height, width: width};
    }

    App.queryMgr.events.on({
        'metadataloaded': loadIndicators,
        'beforequeryregistered': function() {
            container.setDisabled(true);
            relativeAbsoluteBtn.setDisabled(true);
        },
        'queryregistered': function() {
            if (disabled) {
                container.hide();
            }
            else {
                container.show();
                container.setDisabled(false);
            }
        }
    });

    // public
    return {
        init: function() {
        },
        panel: container,
        getChartUrl: getChartUrl,
        setDisabled: setDisabled,
        isDisabled: isDisabled
    };
}();
