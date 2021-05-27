<template>
    <canvas 
        ref='el'
        :style="{
            width: `${graphLine.style?.width}px`,
            height: `${graphLine.style?.height}px`,
            left: `${graphLine.style?.left}px`,
            top: `${graphLine.style?.top}px`,
        }"
        :class="{
            'graph-line': true,
            'graph-line-cursor': graphLine.inPath
        }"
        @click.stop="mouseclick"
    />
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, inject, ref, Ref } from 'vue'
import GraphLine from './instance/line'

export default defineComponent({
    props:{
        graphLine: {
            type: Object as PropType<GraphLine>,
            default: () => {
                return { }
            }
        }
    },
    setup(props) {
        const main = inject('main') as Ref<HTMLElement>
        const el = ref<HTMLCanvasElement | null>(null)
        const graphLine = props.graphLine as GraphLine


        const mouseclick = (e:MouseEvent) => {
            if (graphLine.inPath) return graphLine.isFocus = true

            graphLine.isFocus = false
        }

        onMounted(() => {
            graphLine.setEl(el.value as HTMLCanvasElement)
            graphLine.setContainerEl(main.value)
            main.value.addEventListener('mousemove', e => {
                graphLine.draw(e)
                graphLine.mouseCrash(e)
            })
        })

        return {
            el,
            mouseclick
        }
    }
})
</script>

<style lang="scss" scoped>

.graph-line {
    position: absolute;
    z-index: 0;
    &.graph-line-cursor {
        // cursor: pointer;
    }
}

</style>