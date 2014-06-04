(function( $, undefined ) {

$.widget("draftapp.teamlist", {
  version: "0.1",
  options: {
    selectedTeam: null,
    title: "Team List",
    disabled: false
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
    this.contentDiv.empty();

    var self = this,
        model = window.draftapp.model,
        list = $('<form>').appendTo(this.contentDiv);
    this.options.selectedTeam = model.currentTeam;


    $.each(model.teams, function(i,team) { // There is no I in TEAM!! LOL
      list.append($('<input type="radio" id="teamlist'+i+'" name="teamlist" value="'+team.id+'"/>'))
        .append($('<label for="teamlist'+i+'">'+team.name+'</label>'));
    });

    // mark the selected team
    var btns = list.find('input').filter(function( index ) {
      return $( this ).attr( "value" ) == self.options.selectedTeam;
    }).attr( "checked", true )

    // build the button UI components
      .end().button({disabled:this.options.disabled})

    // set up the button click handlers.
    if (!this.options.disabled) {
      btns.click(function(e) {
        self.selectTeam(this.value);
      });
    }
  },

  selectTeam: function(team) {
    this.options.selectedTeam = team;
    $(document).trigger('draftapp.view-team-changed');
  }

});

})(jQuery);