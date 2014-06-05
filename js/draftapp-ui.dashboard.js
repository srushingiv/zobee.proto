(function( $, undefined ) {

/*
  The dashboard displays the current status of the draft. It shows:
  1. How log remains in the current draft pick.
  2. Progress through the entire draft.
  3. Currently drafting team.

  Future state: May want to have the ability to display the loged in player's
  team seperately from the currently drafting player.
*/
$.widget("draftapp.dashboard", {
  version: "0.1",
  options: {
    title: "Dashboard",
    disabled: false
  },

  _create: function() {
    this.element
      .addClass( "draftapp-panel ui-widget ui-widget-content ui-corner-all" );

    this.titleDiv = $('<div class="draftapp-panel-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"></div>')
      .text(this.options.title)
      .appendTo( this.element );

    this.contentDiv = $( '<div class="draftapp-panel-content ui-widget-content"></div>' )
      .appendTo( this.element );

    var self = this;

    //$(document).on("draftapp.model-loaded",function() { self._refreshDisplay(); });
    //if (window.draftapp && window.draftapp.model && window.draftapp.model.ready === true)
    //  this._refreshDisplay();
  },



});

})(jQuery);