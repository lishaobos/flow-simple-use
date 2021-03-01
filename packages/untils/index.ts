export type Point = [number, number]

export type Line = [Point, Point]

export type Direction = [0 | 1 | -1, 0 | 1 | -1]

export type Side = 1 | 2 | 3 | 4

export const side: { [prop: string]: Side } = {
    top: 1,
    right: 2,
    bottom: 3,
    left: 4,
}

export const direction: { [prop: string]: Direction } = {
    1: [0, 1],
    2: [1, 0],
    3: [0, -1],
    4: [-1, 0],
}

export const distance = 20

export const minus = (p1: Point, p2: Point = [0, 0]): Point => [p2[0] - p1[0], p2[1] - p1[1]]

export const add = (p1: Point, p2: Point): Point => [p1[0] + p2[0], p1[1] + p2[1]]

export const product = (p1: Point, p2: Point): number => p1[0] * p2[0] + p1[1] * p2[1]

export const multCross = (p1: Point, p2: Point) => p1[0] * p2[1] - p2[0] * p1[1]

export const isParallel = (p1: Point, p2: Point): boolean => multCross(p1, p2) == 0

export const multiply = (p: Point, w = distance): Point =>  [p[0] * w, p[1] * w]

export const getPoint = (p: Point, side: Side = 1): Point => {
    const directPoint = [1, 3].includes(side) ? minus(direction[side]) : direction[side]
    const dp = multiply(directPoint)
    return add(p, dp)
}

export const calcPosition = (el: HTMLElement, rootEl: HTMLElement) => {
    const { x: x1, y: y1 } = rootEl.getBoundingClientRect()
    const { x: x2, y: y2 } = rootEl.getBoundingClientRect()
    return [x2 - x1, y2 - y1]
}