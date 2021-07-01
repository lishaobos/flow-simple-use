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
      tabindex='1'
      @drop='drop'
      @dragover.prevent
      @click="mouseclick"
      @keydown.ctrl.s="save"
      @keydown.ctrl.z="cancel"
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
import { defineComponent, reactive, ref, provide, onMounted } from 'vue'
import FlowNode from './node/index.vue'
import GraphNode, { sidePointNode } from './instance/node'
import FlowLine from './line.vue'
import GraphNLine from './instance/line'
import { nodeList, lineList } from './untils/record'

export default defineComponent({
    name: 'FlowContainer',
    components: {
      FlowNode,
      FlowLine
    },
    setup() {
      const main = ref<null | HTMLElement>(null)
      provide('main', main)

      let currentDrawLine: GraphNLine | null = null

      const dragstart = (e: DragEvent) => {
        (e.dataTransfer as DataTransfer).setData('nodeData', JSON.stringify({
          name: 'Rectangle',
          isCreate: true
        }))
      }

      const drop = (e: DragEvent) => {
        const { offsetX: x, offsetY: y } = e
        const { name, isCreate = false } = JSON.parse((e.dataTransfer as DataTransfer).getData('nodeData') || '{}')
        if (isCreate) {
          nodeList.push(new GraphNode({
            name,
            style: {
              left: `${x}px`,
              top: `${y}px`
            }
          }))
        }
      }

      const checkNode = (node: GraphNode, ctrlKey: boolean) => {
        node.isFocus = true
        if (ctrlKey) return

        nodeList.forEach( item => {
          if (item !== node) item.isFocus = false
        })
      }

      const mouseclick = (e: MouseEvent) => {
        nodeList.forEach( item => item.mouseclick(e))
        lineList.forEach( item => item.mouseclick(e))
        console.log(nodeList, lineList)
        // console.log(nodeList, JSON.parse(JSON.stringify(nodeList)))
        // console.log(lineList, JSON.parse(JSON.stringify(lineList)))
      }

      const drawLine = (point: sidePointNode) => {
        if (currentDrawLine) {
          currentDrawLine.setEnd(point.id)
          currentDrawLine = null
          return
        }
          
        currentDrawLine = new GraphNLine({ startId: point.id })
        point.lineList.push(currentDrawLine)
        lineList.push(currentDrawLine)
      }

      onMounted(() => {
        document.onkeydown = (e: KeyboardEvent) => {
          if(e.ctrlKey && e.key === 's'){
            e.preventDefault()
          }
        }
      })

      const save = () => {
        console.log(123)
      }

      const cancel = () => {
        console.log('cancel')
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
        save,
        cancel
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