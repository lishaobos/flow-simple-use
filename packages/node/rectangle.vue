<template>
  <div 
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
      v-for="(item, index) in graphNode.sidePointList"
      :id='item.id'
      :key="index"
      :style="item.style"
      @click="drawLine(item)"
      @mousedown.stop
    />
  </div>
</template>

<script lang='ts'>
import { defineComponent, nextTick, PropType, ref } from 'vue'
import GraphNode, { SidePoint, sidePointNode } from './../instance/node'

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
      const isInElement = ref(false)

      // eslint-disable-next-line vue/no-setup-props-destructure
      const { graphNode: parent } = props
      const { id: parentId } = parent
      const sidePointList: SidePoint[] = [
        { side: 1, style: { top: '-5px', left: '50%' }, parentId, },
        { side: 2, style: { right: '-5px', top: '50%' }, parentId, },
        { side: 3, style: { bottom: '-5px', left: '50%' }, parentId, },
        { side: 4, style: { left: '-5px', top: '50%' }, parentId, },
      ]

      parent.setPointList(sidePointList)

      const drawLine = (point: sidePointNode) => {
        ctx.emit('checkNode', props.graphNode)
        ctx.emit('drawLine', point)
      }


      return {
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