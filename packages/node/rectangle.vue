<template>
  <div 
    class="rectangle"
    @mousemove="isInElement = true"
    @mouseleave="isFocus ? '' : isInElement = false"
  >
    <div class="content">
      Rectangle
    </div>
    <div
      class="point"
      v-for="(item, index) in Object.values(graphNode.pointMap)"
      :key="index"
      :style="item.style"
      :ref="el => { if(el) item.sideEl = el }"
      @click="drawLine(item)"
      @mousedown.stop
    />
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType, ref, reactive, getCurrentInstance, onMounted } from 'vue'
import GraphNode, { Point } from './../instance/node'

export default defineComponent({
    name: 'RectangleNode',
    props: {
        graphNode: {
            type: Object as PropType<GraphNode>,
            default: () => {
                return {}
            }
        },
    },
    setup(props, ctx) {
      const isFocus = ref(false)
      const isInElement = ref(false)

      onMounted( () => {
        const instance = getCurrentInstance()
        const el = (instance as any).ctx.$el as HTMLElement

        const pointList = reactive<Point[]>([
            { id: '1', el, sideEl: null, side: 1, style: { top: '-10px', left: '50%' }, lineList: [] },
            { id: '2', el, sideEl: null, side: 2, style: { right: '-10px', top: '50%' }, lineList: [] },
            { id: '3', el, sideEl: null, side: 3, style: { bottom: '-10px', left: '50%' }, lineList: [] },
            { id: '4', el, sideEl: null, side: 4, style: { left: '-10px', top: '50%' }, lineList: [] },
        ])

        props.graphNode.setPointList(pointList)
      })

      const drawLine = (point: Point) => {
        isFocus.value = true
        ctx.emit('checkNode', props.graphNode)
        ctx.emit('drawLine', point)
      }


      return {
        isFocus,
        isInElement,
        drawLine
      }
    }
})
</script>

<style lang='scss' scoped>

.rectangle {
  position: relative;
  height: 100%;
  .point {
    position: absolute;
    width: 6px;
    height: 6px;
    border: 1px solid;
    border-radius: 50%;
    background-color: #fff;
    cursor: crosshair;
  }
}

</style>