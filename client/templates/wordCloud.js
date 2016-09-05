import { Template } from 'meteor/templating';
import { Items } from '/lib/collections.js';

let observing = false
let nodes = []
let foci = {}
let width = 0
let height = 500
const force = d3.layout.force()
  .nodes(nodes)
  .size([400, 400])
  .gravity(0)
  .charge(-300)
  .on("tick", tick)
  

dragend = function (d) {
  if ((d.y > height || d.y < 0) || (d.x > width || d.x < 0)){
   Items.update(d._id,{$set:{active:false}})
  // force.stop()
  } 
  // d.fixed = true;
  force.start()
}

function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }

function dragmove(d, i) {
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy; 
    drawTick(); // this is the key to make it work together with updating both px,py,x,y on d !
}

const node_drag = d3.behavior.drag()
  .on("dragstart", dragstart)
  .on("drag", dragmove)
  .on("dragend", dragend)

Template.cloudInputs.events({
  'submit .new-sad' : (event, instance) => {
    event.preventDefault()
    Items.insert({
      text:event.target.text.value,
      votes:1,
      happy:false,
      active:true
    })
    event.target.text.value = ""
  },
  'submit .new-happy' : (event, instance) => {
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



Template.wordCloud.helpers({
  items: () => Items.find({active:true}).fetch(),
  // renderCloud: makeCloud
})

Template.wordCloud.onRendered(setSize)
Template.wordCloud.onRendered(makeCloud)
Template.wordCloud.onDestroyed(removeCloud)

function setSize(){
  width = d3.select(".wordcloud").node().getBoundingClientRect().width
  force.size([500,width])

  foci = {
    true:  {x:width*.75,y:250},
    false: {x:width*.25,y:250}
  }
}

function makeCloud(){

  startObserving()
  item_elements = d3.select("svg").selectAll('g').data(nodes, (d) => d._id)
  item_group = item_elements.enter().append('g')
    // .call(force.drag())
    .call(node_drag)
    .on('click',(d) => {
      if (d3.event.defaultPrevented) return;
      Items.update(d._id,{
      $inc:{votes:1}
    })}
      )
  item_group.append('title')
  item_group.append('text').attr('text-anchor','middle')

  item_elements.select("text").text((d) => d.text)
    .attr({
      fill: (d) => d.happy?'darkgreen':'darkred',
      'font-size': (d) => d.votes+12
    })
  item_elements.select("title").text((d) => d.votes + " votes")
  item_elements.exit().remove()
}

function removeCloud() {
  force.stop()
  nodes = []
  force.nodes(nodes)
  observing.stop()
  observing = false
}

function startObserving() {
  if (observing) return undefined//already running !

  observing = Items.find({active:true}).observe({
    added: function(doc) {
      // console.log('add', doc)
      force.stop()
      nodes.push(doc)
      force.nodes(nodes)
      makeCloud()
      force.start()
    },
    changed: function(doc) {
      // console.log('change', doc, nodes)
      node = _.find(nodes, function(d){return d._id == doc._id})
      node.votes = doc.votes
      node.text = doc.text
      makeCloud()
    },
    removed: function(doc) {
      // console.log('remove', doc)
      force.stop()
      nodes = _.filter(nodes, function(d){return d._id != doc._id})
      force.nodes(nodes)
      makeCloud()
      force.start()
    }
  });
}



function tick(e){

// has drag taken us outside our box?
 

  let k = .1 * e.alpha;
  nodes.forEach(function(d, i) {
    if (!d.fixed) {
      d.y += (foci[d.happy].y - d.y) * k;
      d.x += (foci[d.happy].x - d.x) * k;
    }
  });
  drawTick()
}


function drawTick(){
  item_elements.attr('transform',function(d){return 'translate('+d.x+','+d.y +')'})
}