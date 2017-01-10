var compare = {
  string: function(a,b) {
    if (a > b)
      return 1;
    else
      return (a < b) ? -1 : 0;
  },
  number: function(a,b) {
    return a - b;
  }
};

$(document).ready(function() {
  var $tableWrapper = $('.table-wrapper');
  var $table = $tableWrapper.find('.football-table');
  var $tableBody = $table.find('tbody');
  var $teams = [];
  var currentView;
  
  function reorganizeTable($teamObj) {
    $teamObj.forEach(function($team) {
      $tableBody.append($team.$row);
    });
  }
  function getMinAndMax(table,prop) {
    var sortedTable = table.concat().sort(function(a,b) {
      return a.team[prop] - b.team[prop];
    });
    return {
      min: sortedTable[0].team[prop],
      max: sortedTable[sortedTable.length -1].team[prop]
    }
  }
  $.ajax({
    url: "https://api.football-data.org/v1/competitions/426/leagueTable",
    method: "GET",
    headers: {
      'X-Auth-Token': '11c586940cbd432984afcd169ba8a8a8'
    }
  }).done(function(json) {
    json.standing.forEach(function(team) {
      var $tr = $('<tr />');
      var td = '<td>' + team.position + '</td>';
      td += '<td><img class="crest" src="' + team.crestURI + '" alt="" /></td>';
      td += '<td>' + team.teamName + '</td>';
      td += '<td>' + team.playedGames + '</td>';
      td += '<td>' + team.points + '</td>';
      td += '<td>' + team.goals + '</td>';
      td += '<td>' + team.goalsAgainst + '</td>';
      td += '<td>' + team.goalDifference + '</td>';
      td += '<td>' + team.wins + '</td>';
      td += '<td>' + team.draws + '</td>';
      td += '<td>' + team.losses + '</td>';
      $tableBody.append($tr.html(td));
      $teams.push({
        team: team,
        $row: $tr,
        visiblePoints: true,
        visibleGoalDifference: true,
        visibleWins: true,
        visibleSearch: true
      });
    });
    
    $('.table-wrapper').on('click','th',function() {
      var $this = $(this);
      if ($this.is('.ascending') || $this.is('.descending')) {
        $this.toggleClass('ascending descending');
        $teams.reverse();
        reorganizeTable($teams);
      } else {
        $this.siblings().removeClass('ascending descending');
        $this.addClass('ascending');
        var dataType = $this.data('type');
        var dataCompare = $this.data('compare');
        if (dataType === 'number') {
          $teams.sort(function(a,b) {
            a = a.team[dataCompare];
            b = b.team[dataCompare];
            return compare.number(a,b);
          });
          reorganizeTable($teams);
        } else if (dataType === 'string') {
          $teams.sort(function(a,b) {
            a = a.team.teamName;
            b = b.team.teamName;
            return compare.string(a,b);
          });
          reorganizeTable($teams);
        }
      }
    });
    
    function updateTable(table,prop,min,max,visibleProp) {
      //currentView = table;
      table.forEach(function(team) {
        if (team.team[prop] >= min && team.team[prop] <= max) {
          team[visibleProp] = true;
        } else {
          team[visibleProp] = false;
        }
        if (team.visiblePoints && team.visibleGoalDifference && team.visibleWins && team.visibleSearch) {
           team.$row.show();
        } else {
           team.$row.hide();
        }
      });
    }
    //sliders
    function updateHandlers($slider,handlerEq,uiVal) {
      var value = uiVal || $slider.slider('values',handlerEq);
      $slider.find('.ui-slider-handle').eq(handlerEq).text(value);
    }
    
    var $sliderPoints = $('#slider-points');
   
    var pointsMinMax = getMinAndMax($teams,'points');
    $sliderPoints.slider({
      range: true,
      min: pointsMinMax.min,
      max: pointsMinMax.max,
      values: [ pointsMinMax.min, pointsMinMax.max ],
      slide: function( event, ui ) {
        updateTable($teams,'points',ui.values[0],ui.values[1],'visiblePoints');
        updateHandlers($sliderPoints,0,ui.values[0]);
        updateHandlers($sliderPoints,1,ui.values[1]);
      }
    });
    updateHandlers($sliderPoints,0);
    updateHandlers($sliderPoints,1); 
    
    var goalsDiffMinMax = getMinAndMax($teams,'goalDifference');
    var goalsDiffCurrentMin = goalsDiffMinMax[0],
        goalsDiffCurrentMax = goalsDiffMinMax[1];
    

    var $sliderGoalDiff = $('#slider-gd');
    $sliderGoalDiff.slider({
      range: true,
      min: goalsDiffMinMax.min,
      max: goalsDiffMinMax.max,
      values: [ goalsDiffMinMax.min, goalsDiffMinMax.max ],
      slide: function( event, ui ) {
        updateTable($teams,'goalDifference',ui.values[0],ui.values[1],'visibleGoalDifference');
        updateHandlers($sliderGoalDiff,0,ui.values[0]);
        updateHandlers($sliderGoalDiff,1,ui.values[1]);
      }
    });
    updateHandlers($sliderGoalDiff,0);
    updateHandlers($sliderGoalDiff,1);
    
    var $sliderWins = $('#slider-wins');
   
    var winsMinMax = getMinAndMax($teams,'wins');
    $sliderWins.slider({
      range: true,
      min: winsMinMax.min,
      max: winsMinMax.max,
      values: [ winsMinMax.min, winsMinMax.max ],
      slide: function( event, ui ) {
        updateTable($teams,'wins',ui.values[0],ui.values[1],'visibleWins');
        updateHandlers($sliderWins,0,ui.values[0]);
        updateHandlers($sliderWins,1,ui.values[1]);
      }
    });
    updateHandlers($sliderWins,0);
    updateHandlers($sliderWins,1); 
    
    //search form
    var $searchForm = $('#search-form');
    var $seachField = $searchForm.find('#searchField');
    var $searchBtn = $searchForm.find('#searchBtn');
    
    $seachField.on('input',function() {
      var userInput = $(this).val().toLowerCase();
      
      $teams.forEach(function($team) {
        if ($team.team.teamName.toLowerCase().indexOf(userInput) === -1) {
          $team.visibleSearch = false;
          //$team.$row.hide();
        } else {
          //$team.$row.show();
          $team.visibleSearch = true;
        }
        if ($team.visiblePoints && $team.visibleGoalDifference && $team.visibleWins && $team.visibleSearch) {
           $team.$row.show();
        } else {
           $team.$row.hide();
        }
      });
    });
  });
});