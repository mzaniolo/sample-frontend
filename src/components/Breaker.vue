<script setup>
const props = defineProps({
  state: Object,
  name: String,
})
</script>

<style>
.brk {
  .body {
      height: calc(100% / 3);
      width: 100%;
      top: calc(100% / 3);
      position: absolute;
      border-width: 2px;
      border-style: solid;
      border-radius: 5%;
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
    height: 2%;
    top: 49%;
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

  #body_on{
    background-color:  var(--on);
    border-color: var(--on);
  }

  #body_off{
    background-color:  var(--off);
    border-color: var(--off-brd)
  }

  position: absolute;
  cursor: pointer;
}

/* Ensure tooltips are visible */
.brk:hover {
  z-index: 1000;
  filter: brightness(1.2);
}
</style>

<template>
  <div class="brk" :name="name" :title="name">

    <div class="body" :id="(state[name].term_1 && state[name].close) ? 'body_on':'body_off'"></div>
    <div class="term" id="term_1" :style="state[name].term_1 ? 'background-color:  var(--line-on)':'background-color:  var(--line-off)'"></div>
    <div class="term" id="term_2" :style="state[name].term_2 ? 'background-color:  var(--line-on)':'background-color:  var(--line-off)'"></div>
    <div :class="state[name].close ? 'middle_on' : 'middle_off'"></div>

    </div>
</template>
