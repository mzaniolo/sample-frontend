<script setup>
const props = defineProps({
  state: Object,
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
      border-color: black;
      border-style: solid;
      border-radius: 50%;
  }

  .term {
      background-color: black;
      width: 10%;
      height: calc(100% / 3);
      left: 45%;
      position: absolute;
  }

  #term_1 {
      top: 0%
  }

  #term_2 {
      top: calc((100% / 3)*2)
  }

  position: absolute;
}


</style>

<template>
  <div class="sec" >
    <div class="body" :style="(state.term && state.close) ? 'background-color:  var(--on); border-color: var(--on-brd)':'background-color:  var(--off); border-color: var(--off-brd)'"></div>
    <div class="term" id="term_1" :style="state.term ? 'background-color:  var(--on-brd)':'background-color:  var(--off-brd)'"></div>
    <div class="term" id="term_2" :style="(state.term && state.close) ? 'background-color:  var(--on-brd)':'background-color:  var(--off-brd)'"></div>
  </div>
</template>
