(function( $, undefined ) {

/*
  The dashboard displays the current status of the draft. It shows:
  1. Progress through the entire draft.
  2. Currently drafting team.

  Future state:
  1. Show how long remains in the current draft pick.
*/
$.widget("draftapp.actionpanel", {
  version: "0.1",
  options: {
    title: "Draft to Position",
    disabled: false
  },

  _create: function() {
    this.element.empty()
      .addClass( "draftapp-panel ui-widget ui-widget-content ui-corner-all" );

    this.titleDiv = $('<div class="draftapp-panel-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"></div>')
      .text(this.options.title)
      .appendTo( this.element );

    this.contentDiv = $( '<form class="draftapp-panel-content ui-widget-content">' )
      .appendTo( this.element );

    var self = this;
    this.statusSelector = $('<select>').appendTo(
      $('<p>Status:<br/></p>').appendTo(this.contentDiv))
      .change(function(e) {
        window.draftapp.model.selectedStatus = parseInt($(e.currentTarget).val());
        self._refreshSpots()
      });

    this.spotSelector = $('<select>').appendTo(
      $('<p>Spot:<br/></p>').appendTo(this.contentDiv))
      .change(function(e) {
        window.draftapp.model.selectedSpot = parseInt($(e.currentTarget).val());
      });

    this._disable();

    $(document).on("draftapp.model-loaded",function() { self.refresh(); });
    if (window.draftapp && window.draftapp.model && window.draftapp.model.ready === true)
      this.refresh();

    $(document).on("draftapp.turn-beginning",function() { self.refresh(); });
    $(document).on("draftapp.draft-ending",function() { self.refresh(); });
  },

  _disable: function() {
    this.spotSelector.add(this.statusSelector).empty()
      .append('<option value="-1" disabled>N/A</option>')
      .attr('disabled',true);
  },

  // I'm not really happy with this... It repeats code a little bit.
  // but in the interest of time, I'm going to leave it for now.
  _refreshSpots: function() {
    var model = window.draftapp.model,
        selectedSpot = model.selectedSpot,
        availSpots = Array.apply(null,new Array(model[model.selectedStatus == 1 ? 'activeSpots' : 'inactiveSpots'])).map(function(v,i) { return i+1; }),
        players = model.teamPlayers[model.currentTeam];

    for( var i = 0; i < players.length; i++) {
      var p = players[i],
          index = (p.status == model.selectedStatus) ? availSpots.reduce(function(acc,v,i) { return v == p.spot ? i : acc; }, -1) : -1;
      if (index > -1)
        availSpots.splice(index,1);
    }

    this.spotSelector.empty();
    for (var i = 0; i < availSpots.length; i++) {
      this.spotSelector.append('<option value="'+availSpots[i]+'"'+(selectedSpot == availSpots[i] ? ' selected' : '')+'>'+availSpots[i]+'</option>');
    }
    window.draftapp.model.selectedSpot = this.spotSelector.val();
  },

  refresh: function() {
    var model = window.draftapp.model,
        availSpots = [
          Array.apply(null,new Array(model.inactiveSpots)).map(function(v,i) { return i+1; }),
          Array.apply(null,new Array(model.activeSpots)).map(function(v,i) { return i+1; })
        ],
        players = model.teamPlayers[model.currentTeam];

    for( var i = 0; i < players.length; i++) {
      var p = players[i],
          spots = availSpots[p.status],
          index = spots.reduce(function(acc,v,i) { return v == p.spot ? i : acc; }, -1);
      if (index > -1)
        spots.splice(index,1);
    }

    console.log(availSpots);

    if (!availSpots[0].length && !availSpots[1].length) {
      window.draftapp.model.selectedStatus = -1;
      this._disable();
    } else {
      var selectedStatus = window.draftapp.model.selectedStatus,
          selectedSpot = window.draftapp.model.selectedSpot;
      this.statusSelector.empty().attr('disabled',false);
      if (availSpots[1].length) {
        this.statusSelector.append('<option value="1"'+(selectedStatus == 1 ? ' selected' : '')+'>Active</option>');
      }
      if (availSpots[0].length) {
        this.statusSelector.append('<option value="0"'+(selectedStatus == 0 ? ' selected' : '')+'>Inactive</option>');
      }
      selectedStatus = this.statusSelector.val();
      window.draftapp.model.selectedStatus = selectedStatus;
      availSpots = availSpots[selectedStatus];
      this.spotSelector.empty().attr('disabled',false);
      for (var i = 0; i < availSpots.length; i++) {
        this.spotSelector.append('<option value="'+availSpots[i]+'"'+(selectedSpot == availSpots[i] ? ' selected' : '')+'>'+availSpots[i]+'</option>');
      }
      window.draftapp.model.selectedSpot = this.spotSelector.val();
    }

  }

});

})(jQuery);
