(function( $, undefined ) {
  function Position(name, abbrev) {
    this.name = name;
    this.abbrev = abbrev;
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
      };

    this.getPositions = function(callback) { callback(positions); };

    this.getTeams = function(callback) {
      sendRequest('team/allteams',callback);
    };

    this.getTeamPlayers = function(teamid,callback) {
      sendRequest('team/userTeamPlayers/'+teamid,callback);
    };

    this.getFreeAgentsByPosition = function(position,callback) {
      sendRequest('roster/freeAgentsByPosition/'+(position.replace(/[^a-zA-Z]/,'')),callback);
    };

    this.addPlayer = function(teamid,playerid,active,spot,callback) {
      sendRequest('team/addplayer/0/'+playerid+'/'+(active?1:0)+'/'+teamid+'/'+spot+'/0',callback);
    };

  }) ();

})(jQuery);