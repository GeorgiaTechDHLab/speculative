/*
  The evt class serves to simplify the transfer and arrangement of data
  throughout or program. All events are required to have a description, a year,
  players involved, eType (event type 1-9).
*/

var Evt= function(year,eType,desc,players){
  this.year=year;
  this.eType=eType;
  this.desc=desc;
  this.players=players;
}

Evt.prototype.getPlayers = function () {
  var ps=[];
  for(var i in this.players){
    ps.push(this.players[i][0]);
  }
  return ps;
}
Evt.prototype.getActor = function () {
  return this.getPlayers()[0];
}
Evt.prototype.getColors = function () {
  var cs=[];
  for(var i in this.players){
    cs.push(this.players[i][1]);
  }
  return cs;
};
Evt.prototype.getDecade = function () {
  return this.year%100;
};

Evt.prototype.getYearWithOffset = function (offset) {
  return this.year - offset;
};
/*
  EventFactory is responsible for loading all events and placinge them into the
  global scope for visualizations to utilize.

  It can generate events in a number of ways, and its generated events will be
  accessible through the .events selector.

  You could feasably have multiple events based on different datasets.
*/

var EventSet= function(specTypes = [], offset = 0){
  this.events = [];// this will contain all Evts generated by this factory.
  this.offset = offset;
  this.type = "EventSet";
  this.loaded=false;
  this.defaultColors=[
    '#8D2B1D',
    '#325B67',
    '#458867',
    '#9CB23E',
    '#74436C',
    '#BF602E'
  ];
  this.specialTypes = specTypes;
  this.allActors=[];
  this.allColors=[];
}

EventSet.prototype.createEvt=function(evtData){
    var year=parseInt(evtData.year) - this.offset;
    var eType=parseInt(evtData.eventType);
    if(evtData.country!=null){
      var desc=evtData.text;
      var players=[[evtData.country,evtData.color]];
      if(!this.allActors.includes(evtData.country)){
        console.log("NEW country ADDED!");
        this.allActors.push(evtData.country);
        this.allColors.push(evtData.color);
      }
    }else{
      var desc = evtData.description;
      if(!this.allActors.includes(evtData.actor)){
        var clr=this.defaultColors[this.allActors.length];
        console.log("NEW actor ADDED!",evtData.actor,clr);
        this.allActors.push(evtData.actor);
        this.allColors.push(clr);
      }else{
        var clr= this.defaultColors[this.allActors.indexOf(evtData.actor)];
      }
      var players = [[evtData.actor,clr]];
    }
  this.events.push(new Evt(year,eType,desc,players));
};

/*
  This function is meant to be called with a callback to execute after loading
  the data. This is due to the asynchronous nature of d3.csv().
*/
EventSet.prototype.loadFromCSV=function(csvFile,callback){
  this.events=[];
  var self = this;
  d3.csv(csvFile,function(allData){
    for(i in allData){
      self.createEvt(allData[i]);
    }
    callback();
  });
}
/*
  Searches EventSet for an event of the given year (by decade) and type. returns
  the Evt or null if not found
*/
EventSet.prototype.find=function (yr, tp, exclude=[]){
  return this.events.find(function(evt){
    return ((evt.year%100==yr) || ((evt.year % 100 == 0) && (yr == 100)))  && evt.eType==tp && !exclude.includes(evt);
  });
}

EventSet.prototype.findAll=function(yr,tp){
  var allEvts=[];
  while(!allEvts.includes(undefined)){
    allEvts.push(this.find(yr,tp,allEvts));
  }
  allEvts.pop();
  return allEvts
}

EventSet.prototype.isMulti = function (yr,tp) {
  return this.findAll(yr,tp).length>1;
};

EventSet.prototype.sortByYear=function(){
  this.events=mergeSortByYear(this.events);
}
