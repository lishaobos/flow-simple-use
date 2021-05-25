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
import { defineComponent, inject, Ref } from 'vue'

export default defineComponent({
  name: 'Scale',
  props: {
    parentId: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const main = inject<Ref<HTMLElement>>('main') as Ref<HTMLElement>
    const pointRef = new WeakMap<HTMLElement, (1 | 2 | 3 | 4)>()

    let parentNode: HTMLElement
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
        if(l) parentNode.style.left = `${l}px`
        parentNode.style.width = `${width}px`
      }

      if (height > min) {
        if(t) parentNode.style.top = `${t}px`
        parentNode.style.height = `${height}px`
      }
    }

    const mouseup = () => main.value.removeEventListener('mousemove', mousemove)

    const mousedown = (e: MouseEvent) => {
      parentNode = document.getElementById(props.parentId) as HTMLElement
      parentBoundInfo = parentNode.getBoundingClientRect()
      boundInfo = (currentNode = e.target as HTMLElement).getBoundingClientRect()
      main.value.addEventListener('mousemove', mousemove)
      main.value.addEventListener('mouseup', mouseup)
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