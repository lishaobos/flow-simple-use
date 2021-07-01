import { reactive, nextTick } from 'vue'
import Node, { GraphNodeProps } from './../instance/node'
import Line, { GraphLineProps } from './../instance/line'

export const nodeList = reactive<Node[]>([])
export const lineList = reactive<Line[]>([])
const records: string[] = []
const cancelRecords: string[] = []
const { parse, stringify } = JSON

export const saveRecord = async () => {
  await nextTick()
  const data = stringify({
    nodeList,
    lineList
  })
  records.push(data)
}

export const cancelRecord = async () => {
  if (!records.length) return
  
  cancelRecords.push(records.pop() as string)
  nodeList.length = 0
  lineList.length = 0

  if (!records.length) return
  await nextTick()
  const {
    nodeList: n,
    lineList: l
  } = parse(records[records.length - 1])
  const nodeRecord = n.map((item: GraphNodeProps) => new Node(item))
  nodeList.push(...nodeRecord)
  await nextTick()
  const lineRecord = l.map((item: GraphLineProps) => new Line(item))
  lineList.push(...lineRecord)
}

export const nextRecord = async () => {
  if (!cancelRecords.length) return

  records.push(cancelRecords.pop() as string)
  nodeList.length = 0
  lineList.length = 0

  if (!records.length) return
  await nextTick()
  const {
    nodeList: n,
    lineList: l
  } = parse(records[records.length - 1])
  const nodeRecord = n.map((item: GraphNodeProps) => new Node(item))
  nodeList.push(...nodeRecord)
  await nextTick()
  const lineRecord = l.map((item: GraphLineProps) => new Line(item))
  lineList.push(...lineRecord)
}

export const findSideNode = (id: string) => {
  for (const node of nodeList) {
    for (const sideNode of node.sidePointList) {
      if (sideNode.id === id) return sideNode
    }
  }
}

export const findNode = (id: string) => {
  return nodeList.find(item => item.id === id)
}