import {
    Point,
    Line,
    Direction,
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
    ctx: CanvasRenderingContext2D | null = null;
    style: Style = {};
    entryDirection: Direction = direction[side.top];
    exitDirection: Direction = direction[side.top];

    constructor(node: NodePoint) {
        this.start = node
        this.start.lineList.push(this)
        this.entryDirection = direction[node.side]
    }

    setEl(el: HTMLCanvasElement) {
        this.el = el
        this.ctx = el.getContext('2d') as CanvasRenderingContext2D
    }

    setEnd(node: NodePoint) {
        this.end = node
        this.end.lineList.push(this)
        this.exitDirection = direction[node.side]
        this.draw()
    }

    setStyle(style: Style) {
        this.style = {
            ...this.style,
            ...style
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

        const startPoint = getPoint(entryPoint, this.start.side)
        const endPoint = getPoint(exitPoint, this?.end?.side || 1)
        const points = this.calculatePoint(startPoint, endPoint)

        const pointList = [
            entryPoint,
            ...points,
            exitPoint
        ]

        this.paint(pointList.map( p => [p[0] - x, p[1] - y]))
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

    calculatePoint(start: Point, end: Point) {
        let isMorePoint = false
        const points: Point[] = [start]
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
            isMorePoint = true
            const x = (end[0] + start[0]) / 2
            const y = (end[1] + start[1]) / 2
            const isVertical = isParallel([0, 1], startDirection)
            
            if (isVertical) {
                points.push([start[0], y], [end[0], y])
            } else { 
                points.push([x, start[1]], [x, end[1]])
            }
            
        } else {
            points.push(add(startDirection, start))
        }
        
        points.push(end)

        // if (isMorePoint) {
        //     /* eslint-disable */
        //     debugger
        //     const line = this.getCrashLine(points, [this.start, this.end as NodePoint])
        //     console.log('isMorePoint', line)
        //     if (line) return this.getNoCrashPoints(points, line)
        // }

        return points
    }

    getNoCrashPoints(points: Point[], line: Line): Point[] {
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

        const [p1] = line
        points.forEach(p => {
            if (isVertical && p[0] === p1[0]) {
                p[0] = Math.max(x1, x2, x3, x4)
            }
            
            if(!isVertical && p[1] === p1[1]){
                p[1] = Math.max(y1, y2, y3, y4)
            }
        })

        return points
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
                    if (this.isLineCross(nodeLine, pointLine)) return pointLine
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

        if (multCross(p1, p3) * multCross(p2, p3) > 0) { 
            return false
        }

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