import Line from './line'
import { Side } from './../untils'

type coordinate = [number, number]

export interface Point {
  id: string;
  el: HTMLElement;
  sideEl: HTMLElement | null;
  side: Side;
  style: {
    [prop: string]: string;
  };
  lineList: Line[];
  parent?: GraphNode;
}
                
const createId = () => `${Date.now()}`
                
export default class GraphNode {
  id: string;
  name: string;
  coordinate: coordinate;
  el: HTMLElement | null;
  pointMap: { [prop: string]: Point } = {};
  isMove = false;
  isFocus = false;

  constructor(name: string, coordinate: coordinate) {
    const id = createId()
    this.id = id
    this.name = name
    this.coordinate = coordinate
    this.el = document.getElementById(id)
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

  setPointList(list: Point[]) {
    for (const p of list) {
      this.pointMap[p.id] = p
      p.parent = this
    }
  }

  blurFocus() {
    this.isFocus = false
    for (const { lineList } of Object.values(this.pointMap)) {
      for (const line of lineList) {
        line.blurFocus()
      }
    }
  }

}