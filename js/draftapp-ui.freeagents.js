(function( $, undefined ) {

/*
  The free agents panel displays the currently available players.
  It allows the user to select a position, then view the available
  players that play that position.
*/
$.widget("draftapp.freeagents", {
  version: "0.1",
  options: {
    title: "Available Players by Position",
    disabled: false
  },

  _create: function() {
    this.element.empty()
      .addClass( "draftapp-freeagents-panel draftapp-panel ui-widget ui-widget-content ui-corner-all" );

    this.titleDiv = $('<div class="draftapp-panel-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">')
      .text(this.options.title)
      .appendTo( this.element );

    this.contentDiv = $( '<form class="draftapp-panel-content ui-widget-content">' )
      .appendTo( this.element );

    this.positionsDiv = $('<div class="draftapp-freeagents-positions">').appendTo(this.contentDiv);
    this.selectedPosDiv = $('<div class="draftapp-panel-subtitlebar ui-corner-all ui-helper-clearfix">').appendTo(this.contentDiv);
    var table = $('<table><thead><tr><th class="l"><span class="ui-icon ui-icon-person"></span>Player</th><th><span class="ui-icon ui-icon-person"></span>Team</th><th class="r"><span class="ui-icon ui-icon-transferthick-e-w"></span>Add Player</th></tr></thead></table>').appendTo(this.contentDiv);
    this.agentTable = $('<tbody>').appendTo(table);

    var self = this;

    $(document).on("draftapp.model-loaded",function() { self._initialize(); });
    if (window.draftapp && window.draftapp.model && window.draftapp.model.ready === true)
      this._initialize();

    $(document).on("draftapp.draft-ending",function() { self.refresh(); });
    $(document).on("draftapp.player-was-picked",function() { self.refresh(); });
  },

  _selectPosition: function(pos) {
    this.selectedPosDiv.text(pos.name);
    this.refresh();
  },

  _initialize: function() {
    var positions = window.draftapp.getPositions(),
        model = window.draftapp.model,
        self = this;
    this.positionsDiv.empty();
    this.agentTable.empty();
    $.each(positions,function(i,p) {
      self.positionsDiv.append($('<input type="radio" name="pos" id="pos-'+p.short+'" value="'+p.short+'">'))
        .append($('<label for="pos-'+p.short+'">'+p.abbrev+'</label>').data('position',p));
    });
    this.positionsDiv.find('input:first').attr('checked',true)
      .end().buttonset()
      .find('label').click(function(e) {
        var pos = $(e.currentTarget).data('position');
        self._selectPosition(pos);
      });
    this._selectPosition(positions[0])
  },

  refresh: function() {
    this.agentTable.empty();
    var position = this.positionsDiv.find('label[class~="ui-state-active"]').data('position'),
        agents = window.draftapp.model.freeAgents[position.short],
        self = this;
    $.each(agents, function(i, a) {
      var cell = $('<td class="r">').appendTo($('<tr><td class="l">'+a.playerName+'</td><td>'+a.team+'</td></tr>').appendTo(self.agentTable)),
          button = $('<button id="player-'+a.id+'" class="ui-state-default ui-corner-all"><span class="ui-icon ui-icon-plusthick"></span></button>').appendTo(cell);
      if (window.draftapp.model.round < window.draftapp.model.totalRounds) {
        button.click(function(e) {
          e.preventDefault();
          if (!window.draftapp.pick(position.short,a.id)) {
            alert('Could not add player!');
          }
        })
        .mouseenter(self._mouseEnterAddButton)
        .mouseleave(self._mouseLeaveAddButton);
      } else {
        button.addClass("ui-state-disabled").attr('disabled',true);
      }
    });
    this.agentTable.find('tr:odd').addClass('odd');
  },

  _mouseEnterAddButton: function(e) {
    $(e.currentTarget).addClass('ui-state-hover');
  },

  _mouseLeaveAddButton: function(e) {
    $(e.currentTarget).removeClass('ui-state-hover');
  }

});

})(jQuery);