import {
    Point,
    Line,
    Direction,
    distance as w,
    side,
    direction,
    getPoint,
    isParallel,
    minus,
    add,
    multCross,
    product
  } from './../untils'
  import { Point as NodePoint } from './node'
  
  interface Style {
    width?: number;
    height?: number;
    left?: number;
    top?: number;
  }
  
  
  export default class GraphLine {
    start: NodePoint;
    end: NodePoint | null = null;
    el: HTMLCanvasElement | null = null;
    containerEl: HTMLElement | null = null;
    ctx: CanvasRenderingContext2D | null = null;
    style: Style = {};
    entryDirection: Direction = direction[side.top];
    exitDirection: Direction = direction[side.top];
    isMorePoint = false;
    // 0 未相交 1 垂直相交 2 水平相交
    isCrash: 0 | 1 | 2 = 0;
  
    constructor(node: NodePoint) {
        this.start = node
        this.start.lineList.push(this)
        this.entryDirection = direction[node.side]
    }
  
    setEl(el: HTMLCanvasElement) {
        this.el = el
        this.ctx = el.getContext('2d') as CanvasRenderingContext2D
    }
  
    setContainerEl(el: HTMLElement) { 
        this.containerEl = el
    }
  
    setEnd(node: NodePoint) {
        this.end = node
        this.end.lineList.push(this)
        this.exitDirection = direction[node.side]
        this.draw()
    }
  
    setElStyle(e: MouseEvent) { 
        let { x, y } = e
        const { x: x1, y: y1 } = (this.containerEl as HTMLElement).getBoundingClientRect()
        const { x: x2, y: y2 } = (this.start.sideEl as HTMLElement).getBoundingClientRect()

        let [crashWidth, crashHeight, crashTop, crashLeft] = [0, 0, 0, 0]
  
        if (this.end) {
            const sideEl = this.end.sideEl as HTMLElement
            const { x: x3, y: y3 } = sideEl.getBoundingClientRect()
            x = x3
            y = y3
            
            if (this.isCrash) {
                const startEl = this.start.el
                const { x: x4, y: y4 } = startEl.getBoundingClientRect()
                const sw = startEl.offsetWidth
                const sh = startEl.offsetHeight
  
                const endEl = this.end.el
                const { x: x5, y: y5 } = endEl.getBoundingClientRect()
                const ew = endEl.offsetWidth
                const eh = endEl.offsetHeight

                crashTop = Math.min(y4, y5)
                crashLeft = Math.min(x4, x5)
                crashWidth = x4 < x5 ? (x5 + ew - x4) : (x4 + sw - x5)
                crashHeight = y4 < y5 ? (y5 + eh - y4) : (y4 + sh - y5)
  
                // if (this.isCrash === 1) {
                //     crashWidth = x4 < x5 ? (x5 + ew - x4) : (x4 + sw - x5)
                // } else if (this.isCrash === 2) {
                //     crashHeight = y4 < y5 ? (y5 + eh - y4) : (y4 + sh - y5)
                // }
            }
        }
        
        const el = this.el as HTMLCanvasElement
        const pd = w * 2

        const width = (crashWidth || Math.abs(x - x2)) + 2 * pd
        const height = (crashHeight || Math.abs(y - y2)) + 2 * pd
        const top = (crashTop || Math.min(y, y2))- y1 - pd
        const left = (crashLeft || Math.min(x, x2)) - x1 - pd
      
        el.width = width
        el.height = height
        this.style = {
            ...this.style,
            width,
            height,
            top,
            left,
        }
    }
  
    draw(e?: MouseEvent) {
        const startEl = this.start.sideEl as HTMLElement
        const el = this.el as HTMLElement
  
        const { x, y } = el.getBoundingClientRect()
        const { x: x1, y: y1 } = startEl.getBoundingClientRect()
        const { x: x2, y: y2 } = this?.end?.sideEl?.getBoundingClientRect() || e as MouseEvent
        const entryPoint: Point = [x1, y1]
        const exitPoint: Point = [x2, y2]
        const points = this.calculatePoint(entryPoint, exitPoint)
  
        if(e) this.setElStyle(e)
        this.paint(points.map( p => [p[0] - x, p[1] - y]))
    }
  
    paint(list: Point[]) {
        const ctx = this.ctx as CanvasRenderingContext2D
        ctx.clearRect(0, 0, 10000, 10000)
        ctx.beginPath()
  
        list.forEach((p, i) => {
            if (i === 0) return ctx.moveTo(p[0], p[1])
            ctx.lineTo(p[0], p[1])
        })
  
        ctx.stroke()
        ctx.save()
    }
  
      calculatePoint(entry: Point, exit: Point) {
        const start = getPoint(entry, this.start.side)
        const end = getPoint(exit, this?.end?.side || 1)
        const xClose = Math.abs(entry[0] - exit[0]) < (2 * w)
        const yClose = Math.abs(entry[1] - exit[1]) < (2 * w)
        const points: Point[] = []

        // if (xClose || yClose) {
        //     start = entry
        //     end = exit
        // }
        
        this.isCrash = 0
        const vectorHorizontal: Point = [end[0] - start[0], 0]
        const vectorVertical: Point = [0, end[1] - start[1]]
        const startDirection = this.getDirection(
            vectorHorizontal,
            vectorVertical,
            isParallel(this.entryDirection, [0, 1]) ? minus(this.entryDirection) : this.entryDirection
        )
        const endDirection = this.getDirection(
            minus(vectorHorizontal),
            minus(vectorVertical),
            isParallel(this.exitDirection, [0, 1]) ? minus(this.exitDirection) : this.exitDirection
        )
        
        if (isParallel(startDirection, endDirection)) {
            this.isMorePoint = true
            const x = (entry[0] + exit[0]) / 2
            const y = (entry[1] + exit[1]) / 2
            const isVertical = isParallel([0, 1], startDirection)
            
            if (isVertical) {
                points.push([start[0], y], [end[0], y])
            } else { 
                points.push([x, start[1]], [x, end[1]])
            }
            
        } else {
            this.isMorePoint = false
            points.push(add(startDirection, start))
        }
          
        points.unshift(entry, start)
        points.push(end, exit)

        if (this.end) {
            const line = this.getCrashLine(points, [this.start, this.end as NodePoint])
            if (line) {
                const noCrashPoints = this.getNoCrashPoints(points, line, 'max')
                const line1 =  this.getCrashLine(noCrashPoints, [this.start, this.end as NodePoint])
                if (line1) {
                    return  this.getNoCrashPoints(points, line, 'min')
                }
                
                return noCrashPoints
            }
        }
        
        return points
    }
  
    getNoCrashPoints(points: Point[], line: Line, calc: ('max' | 'min') = 'max'): Point[] {
        const vector = minus(line[0], line[1])
        const isVertical = isParallel([0, 1], vector)
  
        const startEl = this.start.el
        const { x: x1, y: y1} = startEl.getBoundingClientRect()
        const x2 = x1 + startEl.offsetWidth
        const y2 = y1 + startEl.offsetHeight
  
        const endEl = (this.end as NodePoint).el
        const { x: x3, y: y3} = endEl.getBoundingClientRect()
        const x4 = x3 + endEl.offsetWidth
        const y4 = y3 + endEl.offsetHeight
  
        const [lp1, lp2] = line
        const isSamePoint = (p1: Point, p2: Point) => p1[0] === p2[0] && p1[1] === p2[1]
        
        const pointList = points.map<Point>(p => {
            let [x, y] = p
            const wid = calc === 'min' ? (-w) : w
            if (isSamePoint(lp1, p) || isSamePoint(lp2, p)) {
                if (isVertical) x = Math[calc](x1, x2, x3, x4) + wid
                else y = Math[calc](y1, y2, y3, y4) + wid
            }

            return [x, y]
        })

        // console.log(points, line)
        const arr: Point[] = []
        pointList.reduce((p, c) => {
            if (p[0] !== c[0] && p[1] !== c[1]) {
                const isTaller = p[1] >= c[1]
                const x = isTaller ? p[0] : c[0]
                const y = !isTaller ? p[1] : c[1]
                arr.push(p, [x, y], c)
            } else {
                arr.push(p, c)
            }

            return c
        })

        return arr
    }
  
    getCrashLine(points: Point[], nodeList: NodePoint[]): Line | undefined {
        const lineList: Line[] = []
        points.reduce((p, c) => {
            lineList.push([p, c])
            return c
        })
        
        for (const n of nodeList) {
            const nodeLineList = this.getLineList(n)
            for (const nodeLine of nodeLineList) {
                for (const pointLine of lineList) {
                    if (this.isLineCross(nodeLine, pointLine)) {
                        // console.log(pointLine)
                        const vector = minus(pointLine[1], pointLine[0])
                        this.isCrash = isParallel([0, 1], vector) ? 1 : 2
                        return pointLine
                    }
                }
            }
        }
    }
  
    isLineCross(line1: Line, line2: Line): boolean {
        const [p1, p2] = line1
        const [p3, p4] = line2
        const { min, max } = Math
  
        if (
            min(p1[0], p2[0]) > max(p3[0], p4[0]) ||
            max(p1[0], p2[0]) < min(p3[0], p4[0]) ||
            min(p1[1], p2[1]) > max(p3[1], p4[1]) ||
            max(p1[1], p2[1]) < min(p3[1], p4[1])
        ) {
            return false
        }
  
        // if (multCross(p1, p3) * multCross(p2, p3) > 0) { 
        //     return false
        // }
  
        return true
    }
  
    getLineList(node: NodePoint): Line[] {
        const el = node.el
        const { x, y} = el.getBoundingClientRect()
        const w = el.offsetWidth
        const h = el.offsetHeight
        
        return [
            [[x, y], [x + w, y]],
            [[x + w, y], [x + w, y + h]],
            [[x, y + h], [x + w, y + h]],
            [[x, y], [x, y + h]],
        ]
    }
  
    getDirection(horizontal: Point, vertical: Point, direction: Direction | Point) {
        if (isParallel(vertical, direction)) {
            if (product(vertical, direction) > 0) return vertical
            return horizontal
        } else {
            if (product(horizontal, direction) > 0) return horizontal
            return vertical
        }
    }
  }