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
        const main = inject('main') as Ref<HTMLCanvasElement>
        const el = ref<HTMLCanvasElement | null>(null)
        const graphLine = props.graphLine as GraphLine

        onMounted(() => {
            graphLine.setEl(el.value as HTMLCanvasElement)
            graphLine.setContainerEl(main.value)
            main.value.addEventListener('mousemove', e => graphLine.draw(e))
        })

        return {
            el,
        }
    }
})
</script>

<style lang="scss" scoped>

.graph-line {
    position: absolute;
    // z-index: 11;
    &.graph-line-cursor {
        // cursor: pointer;
    }
}

</style>