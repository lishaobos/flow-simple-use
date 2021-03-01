<template>
    <canvas 
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
import { defineComponent, onMounted, PropType, inject, getCurrentInstance } from 'vue'
import GraphLine from './instance/line'
import { distance as w } from './untils'

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
        onMounted(() => {
            const graphLine = props.graphLine as GraphLine
            const instance = getCurrentInstance()
            const main = inject<Main>('main')
            const el = (instance as any).ctx.$el
            graphLine.setEl(el)

            const move = (e: MouseEvent) => {
                if (
                    graphLine.end &&
                    !graphLine.end?.parent?.isMove &&
                    !graphLine?.start?.parent?.isMove
                ) {
                    return
                }
                let { x, y } = e
                const { x: x1, y: y1 } = (main as Main).value.getBoundingClientRect()
                const { x: x2, y: y2 } = (graphLine.start.sideEl as any).getBoundingClientRect()

                if (graphLine.end) {
                    const { x: x3, y: y3 } = (graphLine.end.sideEl as any).getBoundingClientRect()
                    x = x3
                    y = y3
                }

                const width = Math.abs(x - x2)
                const height = Math.abs(y - y2)
                const isTop = y <= y2
                const isLeft = x <= x2
                const top = Math.abs(isTop ? (y - y1) : (y2 - y1))
                const left = Math.abs(isLeft ? (x - x1) : (x2 - x1))
                const dw = w + 10
                
                el.width = width + (2 * dw)
                el.height = height + (2 * dw)
                graphLine.setStyle({
                    width: width + (2 * dw),
                    height: height + (2 * dw),
                    top: top - dw,
                    left: left - dw,
                })
                graphLine.draw(e)
            }

            (main as Main).value.addEventListener('mousemove', move)

        })

    }
})
</script>

<style lang="scss" scoped>

.graph-line {
    position: absolute;
    z-index: 0;
}

</style>