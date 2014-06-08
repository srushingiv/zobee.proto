(function( $, undefined ) {

/*
  The dashboard displays the current status of the draft. It shows:
  1. Progress through the entire draft.
  2. Currently drafting team.

  Future state:
  1. Show how long remains in the current draft pick.
*/
$.widget("draftapp.teamroster", {
  version: "0.1",
  options: {
    title: "{} Team Roster",
    activespots: 8,
    inactivespots: 8,
    disabled: false
  },

  _create: function() {
    this.element.empty()
      .addClass( "draftapp-panel ui-widget ui-widget-content ui-corner-all" );

    this.titleDiv = $('<div class="draftapp-panel-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"></div>')
      .text(this.options.title.replace('{}',''))
      .appendTo( this.element );

    this.contentDiv = $( '<div class="draftapp-panel-content ui-widget-content"></div>' )
      .appendTo( this.element );

    var self = this;

    var buildTable = function(title,spots,active) {
      $('<div class="draftapp-panel-subtitlebar ui-corner-all ui-helper-clearfix">'+title+'</div>').appendTo(self.contentDiv);
      var table = $('<table><thead><tr><th class="l">Spot</th><th class="l"><span class="ui-icon ui-icon-person"></span>Player</th><th class="l"><span class="ui-icon ui-icon-flag"></span>Position</th></tr></thead></table>').appendTo(self.contentDiv);
      var tableBody = $('<tbody>').appendTo(table);

      for (var i = 0; i < spots; i++) {
        $('<tr><td>'+(i+1)+'</td><td></td><td></td></tr>').appendTo(tableBody);
      }

      tableBody.find('tr:odd').addClass('odd');

      return tableBody;
    }

    this.activePlayerTable = buildTable('Active Roster',this.options.activespots,true);
    this.inactivePlayerTable = buildTable('Inactive Roster',this.options.inactivespots,false);

    $(document).on("draftapp.model-loaded",function() { self.refresh(); });
    if (window.draftapp && window.draftapp.model && window.draftapp.model.ready === true)
      this.refresh();

    $(document).on("draftapp.view-team-changed",function() { self.refresh(); });
    $(document).on("draftapp.player-was-picked",function() { self.refresh(); });
  },

  _refreshTable: function(tbl,active) {
    var model = window.draftapp.model;
    tbl.find('tr').each(function(i) {
      var row = $(this).find('td:gt(0)'),
          player = window.draftapp.getPlayerInTeamBySpot(model.viewTeam, i+1, active);
      if (player) {
        $(row[0]).text(player.name);
        $(row[1]).text(player.position);
      } else {
        row.empty();
      }
      row.end().data('player',player);
    })
  },

  refresh: function() {
    var model = window.draftapp.model,
        team = window.draftapp.getTeamById(model.viewTeam);

    this.titleDiv.text(this.options.title.replace('{}',team.name))
    this._refreshTable(this.activePlayerTable,true);
    this._refreshTable(this.inactivePlayerTable,false);
  }

});

})(jQuery);