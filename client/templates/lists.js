import { Template } from 'meteor/templating';

import { Items } from '/lib/collections.js';


Template.sadList.helpers({
  items: () => Items.find({happy:false, active:true},{sort:{votes:-1}}).fetch()
})

Template.happyList.helpers({
  items: () => Items.find({happy:true, active:true},{sort:{votes:-1}}).fetch()
})

Template.happyList.events({
  'submit .new-item' : (event, instance) => {
    event.preventDefault()
    Items.insert({
      text:event.target.text.value,
      votes:1,
      happy:true,
      active:true
    })
    event.target.text.value = ""
  }
})


Template.sadList.events({
  'submit .new-item' : (event, instance) => {
    event.preventDefault()
    Items.insert({
      text:event.target.text.value,
      votes:1,
      happy:false,
      active:true
    })
    event.target.text.value = ""
  }
})


Template.item.events({
  'click .fa-check-circle': function (event, instance) {
    Items.update(this._id,{
      $inc:{votes:1}
    })
  },
  'click .fa-times': function (event, instance) {
    Items.update(this._id,{
      $set:{active:false}
    })
  }
})
