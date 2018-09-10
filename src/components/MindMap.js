import * as D3 from 'd3'
import plusImage from '../images/plus.svg'
import editImage from '../images/edit.svg'
import deleteImage from '../images/delete.svg'

class MindMap {
  constructor(selector, data) {
    const container = D3.select(selector)
    const width = container.property('clientWidth')
    const height = container.property('clientHeight')
    const uid = (type) => `${type || 'uid'}-${new Date().getTime()}`

    container.append("svg:svg")
      .attr('id', uid('svg'))
      .attr("width", width)
      .attr("height", height);
    this.data = data || JSON.parse(localStorage.getItem('mindMapData')) || ({
      nodes: [{id: uid('node'), content: 'root'}],
      links: []
    })
    this.uid = uid
    this.svg = container.select('svg')
    this.simulation = D3.forceSimulation()
      .force("link", D3.forceLink().distance(140).id(data => data.id))
      .force('charge', D3.forceManyBody().strength(-200))
      .force('center', D3.forceCenter(width/2 - 50, height/2 - 20))
      .force('collide', D3.forceCollide().radius(50))
    this.linesGroup = this.svg.append("g").attr("id", "links")
    this.nodesGroup = this.svg.append('g').attr("id", "nodes")
    this.update()
  }
  dragStart(data, simulation) {
    if (!D3.event.active) simulation.alphaTarget(0.3).restart();
    data.fx = data.x;
    data.fy = data.y;
  }
  dragging(data) {
    data.fx = D3.event.x;
    data.fy = D3.event.y;
  }
  dragEnd(data, simulation) {
    if (!D3.event.active) simulation.alphaTarget(0);
    data.fx = null;
    data.fy = null;
  }
  add(data) {
    const content = window.prompt('content')

    if (content && content.trim()) {
      const id = this.uid('node')
      this.data.nodes.push({id, content: content.trim()})
      this.data.links.push({source: data.id, target: id})
      this.update()
      this.save()
    }
  }
  edit(node) {
    const content = window.prompt('content')

    if (content && content.trim()) {
      node.content = content
      this.save()
    }
  }
  remove(data) {
    console.log(data)
  }
  update() {
    const {nodes, links} = this.data
    let linesData = this.linesGroup
      .selectAll('line')
      .data(links)
    let nodesData = this.nodesGroup
      .selectAll('g')
      .data(nodes)
    const linesDataEnter = linesData.enter().append('line')
    const nodesDataEnter = nodesData.enter().append('g')
      .attr('class', 'node')
      .call(
        D3.drag()
          .on('start', data => this.dragStart(data, this.simulation))
          .on('drag', data => this.dragging(data))
          .on('end', data => this.dragEnd(data, this.simulation))
      )
    // Plus Icon
    nodesDataEnter.append('image')
      .attr('class', 'plus')
      .attr('xlink:href', plusImage)
      .attr('x', 76)
      .attr('y', 8)
      .attr('width', 24)
      .attr('height', 24)
      .on('click', (data) => {
        D3.event.stopPropagation()
        this.add(data)
      })
    // Edit Icon
    nodesDataEnter.append('image')
      .attr('class', 'edit')
      .attr('xlink:href', editImage)
      .attr('x', 76)
      .attr('y', 8)
      .attr('width', 24)
      .attr('height', 24)
      .on('click', (data) => {
        D3.event.stopPropagation()
        this.edit(data)
      })
    // Delete Icon
    nodesDataEnter.append('image')
      .attr('class', 'delete')
      .attr('xlink:href', deleteImage)
      .attr('x', 76)
      .attr('y', 8)
      .attr('width', 24)
      .attr('height', 24)
      .on('click', (data) => {
        D3.event.stopPropagation()
        this.remove(data)
      })
    // Node Rect
    nodesDataEnter.append('rect')
      .attr('width', 100)
      .attr('height', 40)
      .attr('rx', 4)
      .attr('ry', 4)
    // Node Text
    nodesDataEnter.append('text')
      .attr('x', 10)
      .attr('y', 26)
    // Node Title
    nodesDataEnter.append('title')

    linesData.exit().remove()
    nodesData.exit().remove()
    linesData = linesDataEnter.merge(linesData)
    nodesData = nodesDataEnter.merge(nodesData)

    const ticked = () => {
      linesData.attr('x1', data => Math.round(data.source.x + 50))
        .attr('y1', data => Math.round(data.source.y + 20))
        .attr('x2', data => Math.round(data.target.x + 50))
        .attr('y2', data => Math.round(data.target.y + 10))

      nodesData.attr('transform', data => `translate(${Math.round(data.x)}, ${Math.round(data.y)})`)
      nodesData.selectAll('text').text(data => data.content.substr(0, 6))
      nodesData.selectAll('title').text(data => data.content)
    }

    this.simulation.nodes(nodes).on('tick', ticked)
    this.simulation.force('link').links(links)
    this.simulation.restart()
    this.simulation.alpha(1)
  }
  save() {
    const data = {
      nodes: this.data.nodes,
      links: this.data.links.map(item => ({source: item.source.id, target: item.target.id}))
    }
    localStorage.setItem('mindMapData', JSON.stringify(data))
  }
}

export default MindMap
