<template>
  <div 
    v-for="(item, index) in pointList" 
    :key="index"
    class="scale-point"
    :style="item.style"
    :ref="node => { if(node) pointRef.set(node, index + 1) }"
    @mousedown.stop="mousedown"
  />
</template>

<script lang='ts'>
import GraphNode, { Style } from './../instance/node'
import { defineComponent, inject, Ref, PropType } from 'vue'

export default defineComponent({
  name: 'Scale',
  props: {
    graphNode: {
      type: Object as PropType<GraphNode>,
      default: null
    }
  },
  setup(props) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const graphNode = props.graphNode
    const main = inject<Ref<HTMLElement>>('main') as Ref<HTMLElement>
    const pointRef = new WeakMap<HTMLElement, (1 | 2 | 3 | 4)>()

    let currentNode: HTMLElement
    let parentBoundInfo = { x: 0, y: 0, width: 0, height: 0 }
    let boundInfo = { x: 0, y: 0, width: 0, height: 0  }

    const pointList = [
      { style: { top: '-4px', left: '-4px', cursor: 'nw-resize' } },
      { style: { top: '-4px', right: '-4px', cursor: 'nesw-resize' } },
      { style: { bottom: '-4px', right: '-4px', cursor: 'nw-resize' } },
      { style: { bottom: '-4px', left: '-4px', cursor: 'nesw-resize' } },
    ]

    const mousemove = (e: MouseEvent) => {
      const { x, y } = e
      const { x: x1, y: y1 } = boundInfo
      const { x: x2, y: y2 } = main.value.getBoundingClientRect()
      const idx = pointRef.get(currentNode)
      const style: Style = {}

      const min = 20
      let w = x - x1
      let h = y - y1
      let t = 0
      let l = 0
      if (idx && [1, 2].includes(idx)) {
        h = -h
        t = y - y2
      }
      if (idx && [1, 4].includes(idx)) {
        w = -w
        l = x - x2
      }
      
      const width = parentBoundInfo.width + w
      const height = parentBoundInfo.height + h

      if (width > min) {
        if(l) style.left = `${l}px`
        style.width = `${width}px`
      }

      if (height > min) {
        if(t) style.top = `${t}px`
        style.height = `${height}px`
      }

      graphNode.setStyle(style)
    }

    const mouseup = () => {
      graphNode.isMove = false
      main.value.removeEventListener('mousemove', mousemove)
    }

    main.value.addEventListener('mouseup', mouseup)
    
    const mousedown = (e: MouseEvent) => {
      graphNode.isMove = true
      parentBoundInfo = graphNode.getBoundingClientRect()
      boundInfo = (currentNode = e.target as HTMLElement).getBoundingClientRect()
      main.value.addEventListener('mousemove', mousemove)
    }


    return {
      pointRef,
      pointList,
      mousedown,
    }
  }
})
</script>

<style lang='scss' scoped>

.scale-point {
  position: absolute;
  width: 8px;
  height: 8px;
  box-sizing: border-box;
  border: 1px solid;
  background-color: #fff;
}

</style>