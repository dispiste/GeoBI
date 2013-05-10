Ext.namespace('App');

/**
 * A container showing a the measure name and a delete button to remove this
 * measure from the measure list.
 */
App.MeasureQueryUI = function(measure) {
    var config = {
        defaults: {
            xtype: 'container'
        },
        layout: 'column',
        width: '100%'
    };
    Ext.apply(this, config);

    this.measure = App.cubeProperties.findMeasureByUniqueName(measure);
    this.addEvents(
        /**
        * @event remove
        * Fires when this dimension is to be removed 
        */
       'remove'
    );
    App.MeasureQueryUI.superclass.constructor.call(this);
};

Ext.extend(App.MeasureQueryUI, Ext.Container, {
    initComponent: function() {
        App.MeasureQueryUI.superclass.initComponent.call(this);

        this.membersBtn = new Ext.form.Label();

        this.add({
            layout: 'column',
            width: '100%',
            items: [{
                xtype: 'container',
                columnWidth: 0.95,
                items: this.membersBtn
            },{
                xtype: 'button',
                iconCls: 'delete',
                tooltip: 'Remove this measure',
                handler: function() {
                    this.fireEvent('remove', this.measure.get('MEASURE_UNIQUE_NAME'));
                },
                scope: this
            }]
        });

        this.add({
            ref: 'membersList',
            width: '100%',
            cls: 'members-list'
        });

        this.on('afterlayout', function() {
            this.setText();
        }, this);
    },
    setText: function() {
        var txt = [
            '<b>',
            this.measure.get('MEASURE_NAME'),
            '</b>'
        ].join('');
        this.membersBtn.setText(txt, false);
    }
});
