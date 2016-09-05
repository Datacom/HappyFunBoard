import { Template } from 'meteor/templating';

import { Items } from '/lib/collections.js';

Session.setDefault("showLists", true)

Template.mainPage.helpers({
  showLists: () => Session.get("showLists")
})

Template.mainPage.events({
  'click #showLists' : () => Session.set("showLists", true),
  'click #showCloud' : () => Session.set("showLists", false),
})

function numberOfVotes(happy) {
  return function(){ 
    items = Items.find({happy:happy, active:true}).fetch()
    if (items.length > 0) {
      return items.map((d)=>d.votes).reduce((acc, d) => acc + d)
    } else return 0
  }
}

Template.happyChart.helpers({
  happyVotes: numberOfVotes(true),
  sadVotes: numberOfVotes(false),
  happySadIndicator: () => {
    yes = numberOfVotes(true)() + 1 // we are in bayes land here folkes...
    no = numberOfVotes(false)() + 1
    return (yes / (yes + no)) * 100
  },
  sadHappyIndicator: () => {
    yes = numberOfVotes(true)() + 1 // we are in bayes land here folkes...
    no = numberOfVotes(false)() + 1
    return (no / (yes + no)) * 100
  }
})

