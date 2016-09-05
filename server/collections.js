import { Items } from '/lib/collections.js';

console.log("items count", Items.find({}).count())
if (Items.find({}).count() === 0) {
  Items.insert({
    text:"no coffee!",
    happy:false,
    votes:2,
    active:true
  })
  Items.insert({
    text:"Free Chocolate",
    happy:true,
    votes:1,
    active:true
  })
}
