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
    // multCross,
    product
} from './../untils'
import { findSideNode } from './../untils/record'
import { sidePointNode } from './node'

interface Style {
    width?: number;
    height?: number;
    left?: number;
    top?: number;
}

export interface GraphLineProps {
    startId: string;
    endId?: string;
    style?: Style;
    entryDirection?: Direction;
    exitDirection?: Direction;
    isMorePoint?: boolean;
    inPath?: boolean;
    isFocus?: boolean;
    focusColor?: string;
    // 0 未相交 1 垂直相交 2 水平相交
    isCrash?: 0 | 1 | 2;
    points?: Point[];
}
  
export default class GraphLine {
    startId: string;
    endId: string | undefined;
    style: Style;
    entryDirection: Direction;
    exitDirection: Direction;
    isMorePoint: boolean;
    inPath: boolean;
    isFocus: boolean;
    focusColor = 'red';
    // 0 未相交 1 垂直相交 2 水平相交
    isCrash: 0 | 1 | 2;
    points: Point[];
    cache: {
        start?: sidePointNode;
        end?: sidePointNode;
        el?: HTMLCanvasElement;
        containerEl?: HTMLCanvasElement;
        ctx?: CanvasRenderingContext2D;
    } = {}
  
    constructor(data: GraphLineProps) {
        this.startId = data.startId
        this.start.lineList.push(this)
        this.entryDirection = direction[this.start.side]
        this.exitDirection = direction[this.start.side]
        data.endId && this.setEnd(data.endId)

        this.style = data.style || {}
        this.isMorePoint = data.isMorePoint || false
        this.inPath = data.inPath || false
        this.isFocus = data.isFocus || false
        this.isCrash = data.isCrash || 0
        this.points = data.points || []
    }

    toJSON() {
        const data: { [prop: string]: any } = {}
        for (const [key, value] of Object.entries(this)) {
            if (key === 'cache') continue

            data[key] = value
        }

        return data
    }

    get start() {
        const start = (findSideNode(this.startId) as sidePointNode)
        return this.cache.start ??= start
    }
  
    get end() {
        if (!this.endId) return

        const end = (findSideNode(this.endId) as sidePointNode)
        return this.cache.end ??= end
    }

    get el() {
        return this.cache.el
    }

    get ctx() {
        return this.cache.ctx
    }

    get containerEl() {
        return this.cache.containerEl
    }
  
    setEl(el: HTMLCanvasElement) {
        this.cache.el = el
        this.cache.ctx = el.getContext('2d') as CanvasRenderingContext2D
    }
  
    setContainerEl(el: HTMLCanvasElement) {
        this.cache.containerEl = el
    }
  
    setEnd(endId: string) {
        this.endId = endId
        const end = this.end as sidePointNode
        end.lineList.push(this)
        this.exitDirection = direction[end.side]
        this.draw()
    }
  
    setElStyle(e?: MouseEvent) { 
        let { x, y } = e || { x: 0, y: 0 }
        const { x: x1, y: y1 } = (this.containerEl as HTMLElement).getBoundingClientRect()
        const { x: x2, y: y2 } = this.start.getBoundingClientRect()

        let [crashWidth, crashHeight, crashTop, crashLeft] = [0, 0, 0, 0]
  
        if (this.end) {
            const { x: x3, y: y3 } = this.end.getBoundingClientRect()
            x = x3
            y = y3
            
            if (this.isCrash) {
                const { x: x4, y: y4, width: sw, height: sh } = this.start.parent.getBoundingClientRect()
  
                const { x: x5, y: y5, width: ew, height: eh } = this.end.parent.getBoundingClientRect()

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
  
    getConnectPoint(node: sidePointNode): Point {
        // 1px 偏移避免碰撞检测
        const side = node.side
        const { x: x1, y: y1, width: w1, height: h1 } = node.getBoundingClientRect()
        const { x: x2, y: y2, width: w2, height: h2 } = node.parent.getBoundingClientRect()

        if ([1, 3].includes(side)) {
            if (side === 1) return [x1, y2 - 1]

            return [x1, y2 + h2 + 1]
        } else {
            if (side === 2) return [x2 + w2 + 1, y1]

            return [x2 - 1, y1]
        }
    }
      
    draw(e?: MouseEvent) {
        if (!this.el) return
        
        const el = this.el as HTMLElement
        const { x, y } = el.getBoundingClientRect()
        
        const entryPoint: Point = this.getConnectPoint(this.start)
        const exitPoint: Point = this.end ? this.getConnectPoint(this.end) : [(e as MouseEvent).x, (e as MouseEvent).y]
        this.points = this.calculatePoint(entryPoint, exitPoint)
  
        if (e || this.end) {
            this.setElStyle(e)
        }
        e && this.end && this.mouseCrash(e)

        this.paint(this.points.map( p => [p[0] - x, p[1] - y]))
    }
    
    
    mouseclick(e: MouseEvent) {
        
        if (this.inPath) {
            this.isFocus = true
        } else if (!e.ctrlKey) {
            this.isFocus = false
        }

        this.draw(e)
    }
    

    mouseCrash({ x, y, ctrlKey }: MouseEvent) {
        if (!ctrlKey) this.inPath = false
        if (!this.end) return

        const lineList = this.getLineList(this.points)

        for (const [[x1, y1], [x2, y2]] of lineList) {
            if (
                (y > Math.max(y1, y2) || y < Math.min(y1, y2)) &&
                (x < Math.min(x1, x2) || x > Math.max(x1, x2))
            ) continue

            const l1 = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2))
            const l2 = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2))
            const l3 = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))

            const p = (l1 + l2 + l3) / 2
            const s = Math.sqrt(p * (p - l1) * (p - l2) * (p - l3))
            const dis = s * 2 / l3

            if (dis <= 10) return this.inPath = true
          }
    }
      
    drawArrows([x, y]: Point) {
        const ctx = this.ctx as CanvasRenderingContext2D
        const side = (this.end as sidePointNode).side
        
        let angle = Math.PI / 180
        if (side === 1) {
            angle *= 0
        } else if (side === 3) {
            angle *= 180
        } else if (side === 2) {
            angle *= 90
        } else if (side === 4) {
            angle *= -90
        }
        
        const size = 10
        ctx.translate(x, y)
        ctx.rotate(angle)
        if (this.inPath || this.isFocus) {
            ctx.fillStyle = this.focusColor
        }
        ctx.beginPath()
        ctx.lineTo(-size, -size)
        ctx.lineTo(0, 0)
        ctx.lineTo(size, -size)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
        ctx.restore()
    }
        
    paint([ac, ...list]: Point[]) {
        const ctx = this.ctx as CanvasRenderingContext2D
        ctx.clearRect(0, 0, 10000, 10000)
        ctx.beginPath()
        ctx.moveTo(ac[0], ac[1])
        list.forEach((p, i) => ctx.lineTo(p[0], p[1]))
        if (this.inPath || this.isFocus) {
            ctx.strokeStyle = this.focusColor
        }
        ctx.stroke()

        if (this.end) this.drawArrows(list[list.length - 1])
        ctx.save()
    }
  
    calculatePoint(entry: Point, exit: Point) {
        const start = getPoint(entry, this.start.side)
        const end = getPoint(exit, this?.end?.side || 1)
        // const xClose = Math.abs(entry[0] - exit[0]) < (2 * w)
        // const yClose = Math.abs(entry[1] - exit[1]) < (2 * w)
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
            const lineList = this.getCrashLine(points, [this.start, this.end as sidePointNode])
            // 多个相交线先暂时忽略
            if (lineList.length === 1) {
                let noCrashPoints = points
                const mathArr: ('max' | 'min')[] = ['max', 'min']
                for (const item of mathArr) {
                    const calcPoints = this.getNoCrashPoints(points, lineList[0], item)
                    const crashLineList =  this.getCrashLine(calcPoints, [this.start, this.end as sidePointNode])
                    if (!crashLineList.length) {
                        noCrashPoints = calcPoints
                        break
                    }
                }
            
                return noCrashPoints
            }
        }
        
        return points
    }
  
    getNoCrashPoints(points: Point[], line: Line, calc: ('max' | 'min') = 'max'): Point[] {
        const vector = minus(line[0], line[1])
        const isVertical = isParallel([0, 1], vector)
  
        const { x: x1, y: y1, width: w1, height: h1} = this.start.parent.getBoundingClientRect()
        const x2 = x1 + w1
        const y2 = y1 + h1
  
        const { x: x3, y: y3, width: w2, height: h2} = (this.end as sidePointNode).parent.getBoundingClientRect()
        const x4 = x3 + w2
        const y4 = y3 + h2
  
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

        const arr: Point[] = []
        arr.push(pointList.reduce((p, c) => {
            arr.push(p)
            // 缺少拐点情形，例如上上，下下
            if (p[0] !== c[0] && p[1] !== c[1]) {
                let isTaller = p[1] > c[1]
                if (isSamePoint(this.entryDirection, [0, -1])) {
                    isTaller = !isTaller
                }
                    
                const x = isTaller ? p[0] : c[0]
                const y = !isTaller ? p[1] : c[1]
                arr.push([x, y])
            }

            return c
        }))

        return arr
    }
    
    getLineList(points: Point[]): Line[] {
        const lineList: Line[] = []

        points.reduce((p, c) => {
            lineList.push([p, c])
            return c
        })

        return lineList
    }
  
    getCrashLine(points: Point[], nodeList: sidePointNode[]): Line[]{
        const lineList = this.getLineList(points)
        
        const crashLineMap: { [propName: string]: Line } = {}
        for (const n of nodeList) {
            const nodeLineList = this.getNodeLineList(n)
            for (const nodeLine of nodeLineList) {
                for (const pointLine of lineList) {
                    if (this.isLineCross(nodeLine, pointLine)) {
                        const vector = minus(pointLine[1], pointLine[0])
                        this.isCrash = isParallel([0, 1], vector) ? 1 : 2
                        const key = pointLine.toString()
                        crashLineMap[key] = pointLine
                    }
                }
            }
        }

        return Object.values(crashLineMap)
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
  
    getNodeLineList(node: sidePointNode): Line[] {
        const { x, y, width: w, height: h} = node.parent.getBoundingClientRect()
        
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