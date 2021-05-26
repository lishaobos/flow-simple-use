<template>
  <div class="flow-container">
    <div class="side">
      <div
        class="item"
        draggable="true"
        @dragstart="dragstart"
      >
        
      </div>
    </div>
    <main
      ref='main'
      class="main"
      @drop='drop'
      @dragover.prevent
      @click="mouseclick"
    >
      <FlowNode
        v-for="(node, index) in nodeList"
        :key="`${index}-node`"
        :graphNode='node'
        @drawLine='drawLine'
        @checkNode='checkNode'
      />

      <FlowLine
        v-for="(line, index) in lineList"
        :key="`${index}-line`"
        :graphLine='line'
      />
    </main>
  </div>
</template>

<script lang='ts'>
import { defineComponent, reactive, ref, provide } from 'vue'
import FlowNode from './node/index.vue'
import GraphNode, { Point as NodePoint } from './instance/node'
import FlowLine from './line.vue'
import GraphNLine from './instance/line'

export default defineComponent({
    name: 'FlowContainer',
    components: {
      FlowNode,
      FlowLine
    },
    setup() {
      const main = ref(null)
      provide('main', main)

      let currentDrawLine: GraphNLine | null = null
      const nodeList: GraphNode[] = reactive([])
      const lineList: GraphNLine[] = reactive([])

      const dragstart = (e: DragEvent) => {
        (e.dataTransfer as DataTransfer).setData('nodeData', JSON.stringify({
          name: 'Rectangle',
          isCreate: true
        }))
      }

      const drop = (e: DragEvent) => {
        const { offsetX: x, offsetY: y } = e
        const { name, isCreate = false } = JSON.parse((e.dataTransfer as DataTransfer).getData('nodeData') || '{}')
        if (isCreate) nodeList.push(new GraphNode(name, [x, y]))
      }

      const checkNode = (node: GraphNode, ctrlKey: boolean) => {
        node.isFocus = true
        if (ctrlKey) return 

        nodeList.forEach( item => {
          if (item !== node) item.isFocus = false
        })
      }

      const mouseclick = () => {
        nodeList.forEach( item => item.isFocus = false)
      }

      const drawLine = (point: NodePoint) => {
        if (currentDrawLine) {
          currentDrawLine.setEnd(point)
          currentDrawLine = null
          return
        }
          
        currentDrawLine = new GraphNLine(point)
        point.lineList.push(currentDrawLine)
        lineList.push(currentDrawLine)
      }

      return {
        main,
        nodeList,
        lineList,
        dragstart,
        drop,
        checkNode,
        drawLine,
        mouseclick,
      }
    }
})
</script>

<style lang='scss' scoped>

.flow-container {
  display: grid;
  grid-template-columns: 20% 80%;
  height: 100%;

  > .side {
    display: flex;
    justify-content: center;
    height: 100%;
    > .item {
      width: 50px;
      height: 50px;
      border: 1px solid;
      cursor: move;
    }
  }

  > .main {
    position: relative;
    border: 1px solid;
    background-color: #efefef;
  }
}

</style>