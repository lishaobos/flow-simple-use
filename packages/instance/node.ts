import Line from './line'
import { Side, createId } from './../untils'

type coordinate = [number, number]

export interface SidePoint {
  id?: string;
  lineList?: Line[];
  side: Side;
  style: {
    [prop: string]: string;
  };
  parent: GraphNode;
}

export class sidePointNode {
  id: string;
  side: Side;
  style: {
    [prop: string]: string;
  };
  lineList: Line[] = [];
  parent: GraphNode;
  cache: {
    el?: HTMLElement;
    boundingClientRect?: DOMRect;
  } = {}

  constructor(data: SidePoint) {
    this.id = data.id || createId()
    this.side = data.side
    this.style = data.style
    this.parent = data.parent
  }
  

  getBoundingClientRect() {
    const el = this.cache.el ??= (document.getElementById(this.id) as HTMLElement)

    if (this.parent.isMove)  return this.cache.boundingClientRect = el.getBoundingClientRect()

    return  this.cache.boundingClientRect ??= el.getBoundingClientRect()
  }
}

export default class GraphNode {
  id: string;
  name: string;
  coordinate: coordinate;
  pointMap: { [prop: string]: sidePointNode } = {};
  isMove = false;
  isFocus = false;
  cache: {
    el?: HTMLElement;
    boundingClientRect?: DOMRect;
  } = {}

  constructor(name: string, coordinate: coordinate) {
    this.id = createId()
    this.name = name
    this.coordinate = coordinate
  }

  get el() {
    return this.cache.el ??= (document.getElementById(this.id) as HTMLElement)
  }

  getBoundingClientRect() {
    const el = this.el

    if (this.isMove)  return this.cache.boundingClientRect = el.getBoundingClientRect()
      
    return  this.cache.boundingClientRect ??= el.getBoundingClientRect()
  }

  drawLine(e: MouseEvent) {
    for (const { lineList } of Object.values(this.pointMap)) {
      for (const line of lineList) {
        line.draw(e)
      }
    }
  }

  setCoordinate(coordinate: coordinate) {
    this.coordinate = coordinate
  }

  setPointList(list: sidePointNode[]) {
    for (const p of list) {
      this.pointMap[p.id] = p
      p.parent = this
    }
  }

  mouseCrash(e: MouseEvent): boolean {
    const { x, y, width, height } = this.getBoundingClientRect()
    if (e.x >= x && e.x <= x + width && e.y >= y && e.y <= y + height) {
      return true
    }

    return false
  }

  mouseclick(e: MouseEvent) {
    if (e.ctrlKey) return
    
    this.isFocus = this.mouseCrash(e)
  }

}