Ext.namespace('App');


App.getServlet = function() {
    var parts = window.location.pathname.split("/");
    for (var i=0; i<parts.length; i++) {
        if (parts[i]!="") {
            return parts[i];
        }
    }
    return "/";
}


App.loadCube = function(cubeName) {
    var cubeUrl = window.location.protocol+"//"+window.location.host+"/"+App.getServlet()+"/tool.html?"+"cube="+cubeName;
    window.location=cubeUrl;
};

Ext.namespace('uab.geobi');

uab.geobi.CubeChooserWin = Ext.extend(Ext.Window, {
    constructor: function(userConfig) {
        var config = {
            width:400,
            height:300,
            closable: false,
            layout: 'border'
        }
        Ext.apply(config, userConfig);
        uab.geobi.CubeChooserWin.superclass.constructor.call(this, config);
    },
    onButtonClick: function() {
        App.loadCube(this.combo.getValue());
    },
    combo: new Ext.form.ComboBox({
        fieldLabel: 'Select cube',
        displayField: 'title',
        valueField: 'name',
        mode: 'local',
        store: new Ext.data.Store({
            autoLoad: true,
            proxy: new Ext.data.HttpProxy({
                url: "/" + App.getServlet() + "/getcubes"
            }),
            reader: new Ext.data.JsonReader({
                id: 'CUBE_NAME',
                root: 'cubes'
            }, [
                {name: 'title', mapping: 'CUBE_TITLE'},
                {name: 'name', mapping: 'CUBE_NAME'},
                {name: 'desc', mapping: 'CUBE_DESC'}
            ])
        }),
        typeAhead: true,
        forceSelection: true,
        // Custom rendering Template
        tpl: new Ext.XTemplate(
            '<tpl for="."><div class="cube-selector-item">',
                '<div><h3>{title}</h3><div>{desc}</div>',
            '</div></tpl>'
        ),
        itemSelector: 'div.cube-selector-item'
    }),
    initComponent : function(){
        var formConfig = {
            bodyStyle:'background-color: #F0F0F0',
            flex: 1,
            layout: 'form',
            border:false,
            xtpye: 'container',
            items: [{
                        xtype: 'container',
                        html: '<div style="padding:10px 0px 15px 0px"><span>The OLAP cube viewer is an interactive tool to explore data that has been prepared for a specific thematic area in a database called OLAP cube.</span></div>'
                    },
                    this.combo
            ],
            buttons: [{
                text: 'Go',
                listeners: {
                    'click' : {
                        fn: this.onButtonClick,
                        scope: this,
                        delay: 100
                    }
                }
            }]
        };
        this.items = [{
            region: 'center',
            layout: 'vbox',
            layoutConfig: {
                align : 'stretch',
                pack  : 'start',
            },
            xtype: 'container',
            margins: '10 20 40 20',
            items: [{
                xtype: 'container',
                html: '<a href="whetever"><img alt="Cube viewer logo representing a rubick cube" src="app/images/oca_cube1.png" height="60" width="58" style="vertical-align:middle;"/></a><h1 style="font-size: 17px; display:inline-block; vertical-align:middle; padding-left:3px">OLAP CUBE VIEWER</h1>',
                height: 80,
                border: false
            },
            formConfig]
        }];
        this.superclass().initComponent.call(this);
    },
    getValue: function() {
        return this.combo.getValue();
    }
});

window.onload = function() {
    var win = new uab.geobi.CubeChooserWin();
    win.show();
}

