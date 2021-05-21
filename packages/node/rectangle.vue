<template>
  <div 
    ref='rectangle'
    class="rectangle"
    @mousemove="isInElement = true"
    @mouseleave="isInElement = false"
  >
    <div class="content">
      Rectangle
    </div>
    <div
      :class="{
        'point': true,
        'point-show': isInElement
      }"
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
import { defineComponent, PropType, ref, reactive, onMounted } from 'vue'
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
      const rectangle = ref<HTMLElement | null>(null)

      onMounted( () => {
        const pointList = reactive<Point[]>([
            { id: '1', el: rectangle.value as HTMLElement, sideEl: null, side: 1, style: { top: '-5px', left: '50%' }, lineList: [] },
            { id: '2', el: rectangle.value as HTMLElement, sideEl: null, side: 2, style: { right: '-5px', top: '50%' }, lineList: [] },
            { id: '3', el: rectangle.value as HTMLElement, sideEl: null, side: 3, style: { bottom: '-5px', left: '50%' }, lineList: [] },
            { id: '4', el: rectangle.value as HTMLElement, sideEl: null, side: 4, style: { left: '-5px', top: '50%' }, lineList: [] },
        ])

        props.graphNode.setPointList(pointList)
      })

      const drawLine = (point: Point) => {
        isFocus.value = true
        ctx.emit('checkNode', props.graphNode)
        ctx.emit('drawLine', point)
      }


      return {
        rectangle,
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
    width: 10px;
    height: 10px;
    border: 1px solid;
    border-radius: 50%;
    background-color: #fff;
    cursor: crosshair;
    box-sizing: border-box;
    opacity: 0;
    &.point-show {
      opacity: 1;
    }
  }
}

</style>