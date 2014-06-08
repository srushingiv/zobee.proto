(function( $, undefined ) {
  function Position(name, abbrev) {
    this.name = name;
    this.abbrev = abbrev;
    this.short = this.abbrev.replace(/[^a-zA-Z]/,'');
  };

  window.draftapp = window.draftapp || new (function() {
    var apiUrl = "http://fcdev.zobee.co/api/",
      positions = [
        new Position('Quarterback','QB'),
        new Position('Running Back','RB'),
        new Position('Wide Receiver','WR'),
        new Position('Tight End','TE'),
        new Position('Kicker','K'),
        new Position('Defense / Special Teams','D/St')
      ],

      // for manually sending requests.
      sendRequest = function(req, callback) {
        $.support.cors = true;
        // console.log(req);
        jQuery.ajax ({
          type: 'GET',
          url: apiUrl + req,
          dataType: "json",
          
          //headers: JSON.stringify(this.token),
          beforeSend: function (xhr) {
            /*xhr.withCredentials = true;
            xhr.setRequestHeader('Authentication', that.token[0]);
            xhr.setRequestHeader('X-WSSE', that.token[1]);
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');*/       
          },
          success: function(data,status,jqXHR)
          {
            if (data.success == 1) callback(data.data);
            else console.log(data);
          },
          error: function(jqXHR,status,err)
          {
            console.log(status+' '+err);
          }
        });
      },

      trigger = function(eventName) {
        $(document).trigger('draftapp.'+eventName);
      }

    this.getPositions = function() { return positions };

    this.loadTeams = function(callback) {
      sendRequest('team/allteams',callback);
    };

    this.loadTeamPlayers = function(teamid,callback) {
      sendRequest('team/userTeamPlayers/'+teamid,callback);
    };

    this.loadFreeAgentsByPosition = function(position,callback) {
      sendRequest('roster/freeAgentsByPosition/'+position,callback);
    };

    /*
    this.addPlayer = function(teamid,playerid,active,spot,callback) {
      sendRequest('team/addplayer/0/'+playerid+'/'+(active?1:0)+'/'+teamid+'/'+spot+'/0',callback);
    };
    */

    this.changeViewTeam = function(teamid) {
      this.model.viewTeam = teamid;
      trigger('view-team-changed');
    }

    this.pick = function(position,playerid) {
      // get the player from free agents
      var player,
        self = this,
        index = this.model.freeAgents[position].reduce(function(acc,p,i) {
          if (p.id == playerid) {
            player = p;
            return i;
          }
          return acc;
        },-1);
      if (index == -1) {
        alert('Player not found in free-agent list.')
        return false;
      }

      // validate that there is room on the team
      var spotfilled = this.model.teamPlayers[this.model.currentTeam].reduce(
        function(acc,p,i) {
          return (p.status == self.model.selectedStatus && (self.model.selectedSpot == p.spot)) || acc;
        },false);
      if (spotfilled) {
        alert('Selected spot is already filled.');
        return false;
      }

      // remove from free agents
      this.model.freeAgents[position].splice(index,1);

      // add to team
      this.model.teamPlayers[this.model.currentTeam].push({
        'name': player.playerName,
        'playerId': player.id,
        'position': player.position,
        'spot': this.model.selectedSpot,
        'status': this.model.selectedStatus
        /* , userPlayerId: 781 // TODO: this will come later from the API */
      });

      console.log(this.model.teamPlayers[this.model.currentTeam])

      trigger('player-was-picked');

      // start next turn
      this.nextTurn();

      return true;
    };

    this.nextTurn = function() {
      if (this.model.round >= this.model.totalRounds) return false;

      var self = this,
        index = this.getTurnInRound();

      var nextIndex = index == -1 ? 0 : (index + 1) % this.model.teams.length;
      trigger('turn-ending');
      this.model.currentTeam = this.model.teams[nextIndex].id;

      // increment the round
      if (nextIndex == 0) {
        trigger('round-ending');
        this.model.round ++;

        if (this.model.round >= this.model.totalRounds)
          trigger('draft-ending');
      }

      if (this.model.round < this.model.totalRounds) {
        trigger('turn-beginning');
        this.changeView(this.model.currentTeam);
      }

      return true;
    };

    this.getTurnInRound = function() {
      return this.model.teams.reduce(function(acc,t,i) {
        return (t.id == self.model.currentTeam) ? i : acc;
      },-1);
    };

    this.getPlayerInTeamBySpot = function(teamid, spot, active) {
      return this.model.teamPlayers[teamid].reduce(function(acc,p,i) {
        return (p.spot == spot && (active ? 1 : 0) == p.status) ? p : acc;
      },null);
    }

    this.getTeamById = function(teamid) {
      return this.model.teams.reduce(function(acc,t,i) {
        return (t.id == teamid) ? t : acc;
      },null);
    }

    this.changeView = function(teamid) {
      if (this.model.viewTeam != teamid) {
        this.model.viewTeam = teamid;
        trigger('view-team-changed')
      }
    };

    var modelLoaded = function() {
      this.model.readyCount += 1;
      if (this.model.teams && this.model.readyCount >= positions.length + 1 + this.model.teams.length) {

        // if the teams have already picked up some players, determine the current
        // round and re-order the teams if necessary
        var self = this,
            maxplayers = this.model.teams.reduce(function(acc,t,i) {
              return Math.max(acc, self.model.teamPlayers[t.id].length);
            },0);
        if (maxplayers > 0) {
          this.model.round = maxplayers;
          var withmax = [];
          var withless = [];
          for (var i = 0; i < this.model.teams.length; i++) {
            var t = this.model.teams[i];
            (this.model.teamPlayers[t.id].length < maxplayers ? withless : withmax).push(t);
          }
          if (withless.length > 0) {
            this.model.round -= 1;
            this.model.currentTeam = withless[0].id;
            this.model.teams = withMax.concat(withless);
          }
        }

        // for debug purposes only, show us what got loaded.
        this.model.ready = true;
        console.log(draftapp.model);
        trigger("model-loaded");
      }
    }

    /***** load data model *****/
    var self = this;
    this.model = {
      readyCount:0,
      ready:false,
      currentTeam:0,
      freeAgents:{},
      timeInTurn:30,
      round:0,
      selectedStatus:-1,
      selectedSpot:-1,
      totalRounds:16, // TODO - this may need to be configurable eventually
      activeSpots:8,
      inactiveSpots:8,
      teamPlayers:{}
    };
    this.loadTeams(function(teamData) {
      self.model.teams = teamData;
      self.model.viewTeam = self.model.currentTeam = teamData[0].id;
      modelLoaded.call(self);
      $.each(teamData,function(i, team) {
        self.loadTeamPlayers(team.id,function(data) {
          self.model.teamPlayers[team.id] = data || []
          modelLoaded.call(self);
        });
      });
    });
    $.each(positions,function(i, p) {
      self.loadFreeAgentsByPosition(p.short,function(data) {
        self.model.freeAgents[p.short] = data || [];
        modelLoaded.call(self);
      });
    });

  }) ();

  $(document).ready(function() {
    $('#team-list').teamlist();
    $('#dashboard').dashboard({title:"FANTASY COACH DRAFT TEST"});
    $('#free-agents').freeagents({
      activespots: window.draftapp.model.activeSpots,
      inactivespots: window.draftapp.model.inactiveSpots
    });
    $('#roster').teamroster();
    $('#action-panel').actionpanel();
  });

})(jQuery);