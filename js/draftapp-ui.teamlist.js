(function( $, undefined ) {

$.widget("draftapp.teamlist", {
  version: "0.1",
  options: {
    selectedTeam: null,
    title: "Teams",
    disabled: false
  },

  _create: function() {
    this.element.empty()
      .addClass( "draftapp-panel ui-widget ui-widget-content ui-corner-all" )
      .attr({
        role: "navigation"
      });

    this.titleDiv = $('<div class="draftapp-panel-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"></div>')
      .text(this.options.title)
      .appendTo( this.element );

    this.contentDiv = $( '<div class="draftapp-panel-content ui-widget-content"></div>' )
      .appendTo( this.element );

    var self = this;

    $(document).on("draftapp.model-loaded",function() { self._refreshTeams(); });
    if (window.draftapp && window.draftapp.model && window.draftapp.model.ready === true)
      this._refreshTeams();

    $(document).on('draftapp.view-team-changed', function() {
      self.contentDiv.find('input').attr( "checked", false )
      .filter("[value='" + window.draftapp.model.viewTeam+"']").attr( "checked", true )
      .end().button('refresh');

      // after the first round, the buttons themselves aren't enough to update the appearance
      self.contentDiv.find("label[for='teamlist"+window.draftapp.model.viewTeam+"']")
        .addClass('ui-state-active').attr('aria-pressed','true');
    });
  },

  _refreshTeams: function() {
    this.contentDiv.empty();

    var self = this,
        model = window.draftapp.model,
        list = $('<form>').appendTo(this.contentDiv);

    $.each(model.teams, function(i,team) { // There is no I in TEAM!! LOL
      list.append($('<input type="radio" id="teamlist'+team.id+'" name="teamlist" value="'+team.id+'"/>'))
        .append($('<label for="teamlist'+team.id+'">'+team.name+'</label>'));
    });

    // mark the selected team
    var btns = list.find('input')
      .filter("[value='" + window.draftapp.model.viewTeam+"']").attr( "checked", true )

    // build the button UI components
      .end().button({disabled:this.options.disabled})

    // set up the button click handlers.
    if (!this.options.disabled) {
      btns.click(function(e) {
        window.draftapp.changeView(this.value);
      });
    }
  }

});

})(jQuery);