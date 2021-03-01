<template>
  <div
    class="component"
    :id='graphNode.id'
    @mousedown="mousedown"
    @mouseup="mouseup"
    :style="{
        left: `${graphNode['coordinate']['0']}px`,
        top: `${graphNode['coordinate']['1']}px`
    }"
  >
      <component
        :is='graphNode.name'
        :graphNode='graphNode'
        v-bind="$attrs"
      />
  </div>
</template>

<script lang='ts'>
import { defineComponent, inject, PropType } from 'vue'
import GraphNode from './../instance/node'
import Rectangle from './rectangle.vue'

interface Main {
    value: HTMLElement;
}

export default defineComponent({
    inheritAttrs: false,
    components: {
        Rectangle
    },
    props: {
        graphNode: {
            type: Object as PropType<GraphNode>,
            default: () => {
                return {}
            }
        },
    },
    setup(props, ctx) {
        const main = inject('main')
        let coordinate = { x: 0,  y: 0 }

        const mousemove = (e: MouseEvent) => {
            if (!props.graphNode.isMove) return
            const { left, top } = (main as Main).value.getBoundingClientRect()
            const { x,  y } = e
            props.graphNode.setCoordinate([x - left - coordinate.x, y - top - coordinate.y])
            // props.graphNode.drawLine(e)
        }

        const mouseup = () => {
            // eslint-disable-next-line vue/no-mutating-props
            props.graphNode.isMove = false;
            (main as Main).value.removeEventListener('mousemove', mousemove)
        }
        
        const mousedown = (e: MouseEvent) => {
            const { offsetX: x, offsetY: y } = e
            coordinate = { x, y }
            // eslint-disable-next-line vue/no-mutating-props
            props.graphNode.isMove = true;
            (main as Main).value.addEventListener('mousemove', mousemove)
            ctx.emit('checkNode', ctx)
        }


        return {
            mouseup,
            mousedown,
        }
    }
}) 
</script>

<style lang='scss' scoped>

.component {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 1px solid;
  z-index: 10;
}

</style>