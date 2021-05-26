<template>
  <div
    class="component"
    :id='graphNode.id'
    @mousedown="mousedown"
    @mouseup="mouseup"
    @click.stop="mouseclick"
    :style="{
        left: `${graphNode['coordinate']['0']}px`,
        top: `${graphNode['coordinate']['1']}px`
    }"
  >

    <template v-if="graphNode.isFocus">
        <Scale :parentId='graphNode.id' />
    </template>

    <component
        :is='graphNode.name'
        :graphNode='graphNode'
        v-bind="$attrs"
    />
  </div>
</template>

<script lang='ts'>
/* eslint-disable vue/no-mutating-props */
import { defineComponent, inject, PropType, Ref } from 'vue'
import GraphNode from './../instance/node'
import Rectangle from './rectangle.vue'
import Scale from './Scale.vue'

export default defineComponent({
    inheritAttrs: false,
    components: {
        Rectangle,
        Scale
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
        const main = inject('main') as Ref<HTMLElement>
        let coordinate = { x: 0,  y: 0 }

        const mousemove = (e: MouseEvent) => {
            const { left, top } = main.value.getBoundingClientRect()
            const { x,  y } = e
            props.graphNode.setCoordinate([x - left - coordinate.x, y - top - coordinate.y])
        }

        const mouseup = () => {
            main.value.removeEventListener('mousemove', mousemove)
        }
        
        const mousedown = (e: MouseEvent) => {
            const { offsetX: x, offsetY: y, ctrlKey } = e
            coordinate = { x, y }
            main.value.addEventListener('mousemove', mousemove)
        }

        const mouseclick = (e: MouseEvent) => {
            const { offsetX: x, offsetY: y, ctrlKey } = e
            ctx.emit('checkNode', props.graphNode, ctrlKey)
        }


        return {
            mouseup,
            mousedown,
            mouseclick,
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