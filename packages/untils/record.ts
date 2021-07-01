import { reactive } from 'vue'
import Node from './../instance/node'
import Line from './../instance/line'

export const nodeList = reactive<Node[]>([])
export const lineList = reactive<Line[]>([])
// const records = []
// const backRecords = []

// export const saveMoment = () => {

// }

// export const backMoment = () => {

// }

// export const nextMoment = () => {

// }

// export const findNode = (id: string) => {

// }

export const findSideNode = (id: string) => {
  for (const node of nodeList) {
    for (const sideNode of node.sidePointList) {
      if (sideNode.id === id) return sideNode
    }
  }
}