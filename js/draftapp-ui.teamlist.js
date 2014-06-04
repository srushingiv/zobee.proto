(function( $, undefined ) {

$.widget("draftapp.teamlist", {
  version: "0.1",
  options: {
    selectedTeam: null,
    title: "Team List"
  },

  _create: function() {
    this.element
      .addClass( "ui-dialog ui-widget ui-widget-content ui-corner-all" )
      .attr({
        role: "navigation"
      });

    this.titleDiv = $('<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"></div>')
      .text(this.options.title)
      .appendTo( this.element );

    this.contentDiv = $( '<div class="ui-dialog-content ui-widget-content"></div>' )
      .appendTo( this.element );

    var self = this;

    $(document).on("draftapp.model-loaded",function() { self._refreshTeams(); });
    if (window.draftapp && window.draftapp.model && window.draftapp.model.ready === true)
      this._refreshTeams();
  },

  _refreshTeams: function() {
    var self = this, model = window.draftapp.model;
    this.contentDiv.empty();
    $.each(model.teams, function(i,team) { // There is no I in TEAM!! LOL
      $('<div>').addClass('team-item ui-widget ui-corner-all ui-button-text-only')
        .html('<span class="ui-button-text">'+team.name+'</span>')
        .addClass(team.id == model.currentTeam ? 'ui-state-active' : 'ui-state-default')
        .appendTo(self.contentDiv);
    });
  }

});

})(jQuery);