<script setup>
const props = defineProps({
  state: Object,
  name: String,
})
</script>

<style>
.sec {
  .body {
      height: calc(100% / 3);
      width: 100%;
      top: calc(100% / 3);
      position: absolute;
      border-width: 2px;
      border-style: solid;
      border-radius: 50%;
      border-color: transparent;
  }

  .term {
      width: 15%;
      height: calc(100% / 3);
      left: 42.5%;
      position: absolute;
  }

  .middle_on {
    width: 15%;
    height: calc(100% / 3);
    top: calc(100% / 3);
    left: 42.5%;
    position: absolute;
    background-color: rgb(55,55,55);
  }

  .middle_off {
    width: 100%;
    height: 5%;
    top: 47%;
    left: 0%;
    position: absolute;
    background-color: var(--off-brd);
  }

  #term_1 {
      top: 0%
  }

  #term_2 {
      top: calc((100% / 3)*2)
  }

  position: absolute;
  cursor: pointer;
}

/* Ensure tooltips are visible */
.sec:hover {
  z-index: 1000;
  filter: brightness(1.2);
}
</style>

<template>
  <div class="sec" :name="name" :title="name">
    <div class="body" :style="state[name].close ? 'background-color:  var(--sec-on);':'background-color:  var(--off)'"></div>
    <div class="term" id="term_1" :style="state[name].term_1 ? 'background-color:  var(--line-on)':'background-color:  var(--line-off)'"></div>
    <div class="term" id="term_2" :style="state[name].term_2 ? 'background-color:  var(--line-on)':'background-color:  var(--line-off)'"></div>
    <div :class="state[name].close ? 'middle_on' : 'middle_off'"></div>
  </div>
</template>
