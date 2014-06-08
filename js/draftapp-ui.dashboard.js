(function( $, undefined ) {

/*
  The dashboard displays the current status of the draft. It shows:
  1. Progress through the entire draft.
  2. Currently drafting team.

  Future state:
  1. Show how long remains in the current draft pick.
*/
$.widget("draftapp.dashboard", {
  version: "0.1",
  options: {
    title: "Dashboard",
    disabled: false
  },

  _create: function() {
    this.element.empty()
      .addClass( "draftapp-panel ui-widget ui-widget-content ui-corner-all" );

    this.titleDiv = $('<div class="draftapp-panel-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"></div>')
      .text(this.options.title)
      .appendTo( this.element );

    this.contentDiv = $( '<div class="draftapp-panel-content ui-widget-content"></div>' )
      .appendTo( this.element );

    var teamP = $('<p>Team Drafting:&nbsp;</p>').appendTo(this.contentDiv);

    this.teamNameSpan = $('<span class="draftapp-dashboard-teamname">N/A</span>').appendTo(teamP);

    this.progressBar = $('<div class="draftapp-progressbar">').appendTo(this.contentDiv);
    this.progressLabel = $('<div class="draftapp-progress-label">Loading...</div>').appendTo(this.progressBar);

    this.progressBar.progressbar({ value:false })



    var self = this;

    $(document).on("draftapp.model-loaded",function() { self.refresh(); });
    if (window.draftapp && window.draftapp.model && window.draftapp.model.ready === true)
      this.refresh();

    $(document).on("draftapp.turn-beginning",function() { self.refresh(); });
    $(document).on("draftapp.draft-ending",function() { self.refresh(); });
  },

  refresh: function() {
    var model = window.draftapp.model,
        teamCount = model.teams.length,
        turnIndex = window.draftapp.getTurnInRound(),
        value = (turnIndex+(model.round * teamCount)),
        max = model.totalRounds * teamCount,
        html = 'Turn '+(turnIndex+1)+' of '+teamCount+' in Round '+(model.round+1)+' of '+model.totalRounds;

    if (value >= max) {
      this.progressBar.progressbar( 'value', 100);
      this.progressLabel.html('Draft Complete');
      this.teamNameSpan.text('N/A');
    } else {
      this.progressBar.progressbar( 'value', value * 100.0 / max);
      this.progressLabel.html(html);
      this.teamNameSpan.text(model.teams[turnIndex].name);
    }
  }

});

})(jQuery);
