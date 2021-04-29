<template>
    <canvas 
        ref='el'
        :style="{
            width: `${graphLine.style?.width}px`,
            height: `${graphLine.style?.height}px`,
            left: `${graphLine.style?.left}px`,
            top: `${graphLine.style?.top}px`,
        }"
        :class="['graph-line']"
    />
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, inject, ref } from 'vue'
import GraphLine from './instance/line'

interface Main {
    value: HTMLElement;
}

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
        const el = ref<HTMLCanvasElement | null>(null)

        onMounted(() => {
            const graphLine = props.graphLine as GraphLine
            const main = inject('main') as Main
            
            graphLine.setEl(el.value as HTMLCanvasElement)
            graphLine.setContainerEl(main.value)

            main.value.addEventListener('mousemove', e => graphLine.draw(e))

        })

        return {
            el
        }
    }
})
</script>

<style lang="scss" scoped>

.graph-line {
    position: absolute;
    z-index: 0;
}

</style>