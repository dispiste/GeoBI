/**
 * This file represents the application's entry point.
 * OpenLayers and Ext globals are set, and the page
 * layout is created.
 */

window.onload = function() {

    Ext.QuickTips.init();
    App.queryMgr.init();

    var content = new Ext.Panel({
        border: false,
        columnWidth: 1,
        defaults: {
            style: 'padding: 5px',
            frame: true
        },
        items: [
            App.map.panel,
            App.table.panel,
            App.chart.panel
        ]
    });
    
    var globalHeader = {
            xtype: 'container',
            //html: '<span>Header</span>',
            anchor: '-10'
        }
    
    var leftHeader = {
            xtype: 'container',
            id: 'logo',
            html: '<a href="whetever"><img alt="Cube viewer logo representing a rubick cube" src="app/images/oca_cube1.png" height="60" width="58" style="vertical-align:middle;"/></a><h1 style="font-size: 17px; display:inline-block; vertical-align:middle; padding-left:3px">OLAP CUBE VIEWER</h1>'
        };
    
    var globalFooter = {
            xtype: 'container',
            cls: 'indented-block',
            heigth: 200,
            anchor: '0',
            items: [{
                xtype: 'container',
                html: '<div><span class="app-text">(C) UAB and CampToCamp. Source code available on <a href="https://github.com/dispiste/GeoBI">GitHub</a>.</span></div>'
            }]
        };
    
    var leftPanelItems = [
                      leftHeader,
                      App.queryBuilder.panel,
                      App.report.panel
                  ];
    
    var layout = new Ext.Container({
            layout: 'anchor',
            xtype: 'container',
            style: {
                overflow: 'auto'
            },
            items: [
                    globalHeader,
                    {
                        xtype: 'container',
                        anchor: '0',
                        autoScroll: true,
                        layout: 'column',
                        items: [{
                            xtype: 'container',
                            width: 300,
                            items: leftPanelItems
                        }, 
                            content
                        ]
                    },
                    globalFooter
            ],
        renderTo: Ext.getBody()
    });

    App.map.init();

    Ext.EventManager.onWindowResize(
        function() {
            layout.doLayout();
        }
    );

    App.queryMgr.events.on({
        'queryregistered': function() {
            layout.doLayout();
        }
    });
};
