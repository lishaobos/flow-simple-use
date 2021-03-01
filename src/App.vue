<template>
  <FlowContainer />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FlowContainer from './../packages/index.vue'

export default defineComponent({
  name: 'App',
  components: {
    FlowContainer
  },
  data() {
    return {
    }
  }
});
</script>

<style>
html,body {
  height: 100%;
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  padding-top: 60px;
  box-sizing: border-box;
}
</style>
