import Line from './line'
import { Side, createId } from './../untils'

export type Style = {
  [prop: string]: string;
}
export interface SidePoint {
  id?: string;
  lineList?: Line[];
  side: Side;
  style: Style;
  parent: GraphNode;
}

export class sidePointNode {
  id: string;
  side: Side;
  style: Style;
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

  toJSON() {
    const data: { [prop: string]: any } = {}
    for (const [key, value] of Object.entries(this)) {
      if (key === 'cache') continue
      
      if (key === 'lineList') {
        data.lineList = []
        continue
      }

      data[key] = value
    }
  }

  getBoundingClientRect() {
    const el = this.cache.el ??= (document.getElementById(this.id) as HTMLElement)

    if (this.parent.isMove)  return this.cache.boundingClientRect = el.getBoundingClientRect()

    return  this.cache.boundingClientRect ??= el.getBoundingClientRect()
  }
}


interface GraphNodeProps {
  id?: string;
  name?: string;
  isMove?: boolean;
  isFocus?: boolean;
  style?: Style;
}

export default class GraphNode {
  id: string;
  name: string;
  sidePointList: sidePointNode[] = [];
  isMove = false;
  isFocus = false;
  style: Style = {};
  cache: {
    el?: HTMLElement;
    boundingClientRect?: DOMRect;
  } = {}

  constructor(data: GraphNodeProps) {
    this.id = data.id || createId()
    this.name = data.name || ''
    this.isMove = data.isMove || false
    this.isFocus = data.isFocus || false
    this.style = data.style || {}
  }

  toJSON() {
    const data: { [prop: string]: any } = {}
    for (const [key, value] of Object.entries(this)) {
      if (key === 'cache') continue

      if (key === 'sidePointList') {
        data.sidePointList = (value as sidePointNode[]).map(side => side.toJSON())
        continue
      }
  
      data[key] = value
    }

    return data
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
    for (const { lineList } of this.sidePointList) {
      for (const line of lineList) {
        line.draw(e)
      }
    }
  }

  setStyle(style: Style) {
    this.style = {
      ...this.style,
      ...style
    }
  }

  setPointList(list: sidePointNode[]) {
    this.sidePointList.push(...list)
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