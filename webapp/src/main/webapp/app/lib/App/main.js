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
            html: '<a href="http://www.espon.eu/"><img alt="Cube viewer logo representing a rubick cube" src="app/images/oca_cube1.png" height="60" width="58" style="vertical-align:middle;"/></a><h1 style="font-size: 17px; display:inline; vertical-align:middle;">OLAP CUBE VIEWER<span style="font-size:9px;font-weight:normal; "> BETA</span></h1>'
        };
    
    var globalFooter = {
            xtype: 'container',
            height: 20,
            layout: 'fit',
            anchor: '0',
            items: [{
                xtype: 'container',
                html: '<div style="text-align: center"><span class="app-text">(C) UAB and ESPON M4D project. Part-financed by the European Regional Development Fund.</span></div>'
            }]
        };
    
    var esponDisclaimer = {
            xtype: 'container',
            html: '<div class="espon-disclaimer centered-text">This map does not necessarily reflect the opinion of the ESPON Monitoring Committee. Part-financed by the European Regional Development Fund.</div>'
        };
    
    var esponLogo = {
            xtype: 'container',
            html: '<div class="centered-text"><a href="http://www.espon.eu/"><img alt="European Spatial Planning Observation Network (ESPON) logo" src="app/images/ESPON_Logotxt_72dpi.jpg"/></a></div>'
        };
    
    var uabLogo = {
            xtype: 'container',
            html: '<div class="centered-text"><a href="http://www.uab.cat/"><img alt="Logo of Autonomous University of Barcelona" src="app/images/uab-negro-marron_72dpi.jpg"/></a></div>'
        };
    
    var leftPanelItems = [
                      leftHeader,
                      App.queryBuilder.panel,
                      App.report.panel,
                      esponLogo,
                      uabLogo
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

function getServlet() {
    var parts = window.location.pathname.split("/");
    for (var i=0; i<parts.length; i++) {
        if (parts[i]!="") {
            return parts[i];
        }
    }
    return "/";
}