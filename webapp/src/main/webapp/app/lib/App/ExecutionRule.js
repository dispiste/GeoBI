Ext.namespace('App');

/**
 * Execution rules are used to constraint the range of valid queries.
 * This is a base class providing a common interface for execution rules.
 * Subclasses should implement the check() and getConfirmText() functions.
 */
App.ExecutionRule = Ext.extend(Ext.util.Observable, {
    /**
     * The result of the rule check has been positive, the query can be
     * executed (or the next rule checked).
     * @type integer
     */
	EXECUTE: 1,
	/**
     * The result of the rule check has been negative, the query can't be
     * executed. No further rules need to be checked.
     * @type integer
     */
    CANCEL: 2,
    /**
     * The result of the rule check requires the user to decide whether
     * execution should proceed or not.
     * @type integer
     */
    ASKUSER: 3,
    

    /**
     * Checks this rule. 
     * @return {integer} checkResult Returns App.ExecutionRule.EXECUTE, 
     * App.ExecutionRule.CANCEL or App.ExecutionRule.ASKUSER
     */
    check: function(){
    	return this.EXECUTE;
    },
    /**
     * Gets the text to be shown by the confirm dialog. 
     */
    getConfirmText: function() {
    	return "Do you really want to execute this query?"; 
    }
});

/**
 * Execution rules are used to constraint the range of valid queries.
 */
App.ExecutionRuleProcessor = Ext.extend(Ext.util.Observable, {
    constructor: function(options) {
        App.ExecutionRuleProcessor.superclass.constructor.call(this);
        this.addEvents('rulesaccepted','rulesrejected');
        this.executionRules = options.executionRules || {};
    },
    askUserRules: [],
    executionRules: null,
    /**
     * checkRules
     */
    checkRules: function() {
        this.askUserRules = [];
        for (var i=0; i<this.executionRules.length; i++) {
            var rule = this.executionRules[i];
            var result = rule.check();
            if (result==rule.CANCEL) {
                this.fireEvent("rulesrejected", this);
                return;
            }
            else if (result==rule.ASKUSER) {
                this.askUserRules.push(rule);
            }
        }
        this.processAskUserRules();
    },
    showConfirmMessage: function(confirmText) {
        Ext.MessageBox.confirm('Confirm', confirmText,
            function(btn, text){
                if (btn == 'yes'){
                    this.processAskUserRules();
                }
                else {
                    this.fireEvent("rulesrejected", this);
                }
            },
            this
        );
    },
    processAskUserRules: function() {
    	if (this.askUserRules.length>0) {
    		var rule = this.askUserRules.pop();
    		this.showConfirmMessage(rule.getConfirmText());
    	}
    	else {
    		this.fireEvent("rulesaccepted", this);
    	}
    }
});


/**
 * Too big queries kill the client&server and are usually meaningless.
 * Check the size of the query and ask the user if the query should be
 * cancelled (in case it is a big one) or executed. 
 */
App.LimitQuerySizeRule = Ext.extend(App.ExecutionRule, {
    /**
     * Checks this rule. 
     * Too big queries kill the client&server and are usually meaningless.
     * Check the size of the query and ask the user if the query should be
     * cancelled (in case it is a big one) or executed. 
     * 
     * @return {integer} checkResult Returns App.ExecutionRule.EXECUTE, 
     * App.ExecutionRule.CANCEL or App.ExecutionRule.ASKUSER
     */
    check: function(){
        var columns = 1, rows = 1;
        query = App.queryMgr.getQuery();
        if (query) {
            if (query.rows){
                for (var i=0; i<query.rows.length; i++) {
                    if (query.rows[i].members) {
                        rows = rows*query.rows[i].members.length;
                    }
                    else {
                        rows = rows*App.cubeProperties
                            .getMembersCountByLevel(query.rows[i].level);
                    }
                }
            }
            if (query.cols){
                for (var i=0; i<query.cols.length; i++) {
                    if (query.cols[i].members) {
                        columns = columns*query.cols[i].members.length;
                    }
                    else {
                        columns = columns*App.cubeProperties
                            .getMembersCountByLevel(query.cols[i].level);
                    }
                }
            }
        }
        if (rows>50 || ((rows*columns) > 300)) {
            return this.ASKUSER;
        }
        return this.EXECUTE;
    },
    getConfirmText: function() {
        return 'This query may include many members and it may take long to execute. Big queries are usually meaningless. Do you really want to execute this query?'; 
    }
});
