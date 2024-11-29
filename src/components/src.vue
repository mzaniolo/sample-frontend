<script setup>
const props = defineProps({
  e: Boolean,
})
</script>

<style>
.src {
  .body {
    height: calc((100% / 3)*2);
    width: 100%;
    border-width: 2px;
    border-color: black;
    border-style: solid;
    border-radius: 50%;
    text-align: center;
    position: relative;

    p{
        top: -5px;
        height: fit-content;
        width: 100%;
        position: relative;
    }
  }
  .term {
      background-color: black;
      width: 10%;
      height: calc(100% / 3);
      left: 45%;
      position: absolute;
  }

  position: absolute;
}


</style>

<template>
  <div class="src" >
    <div class="body" :style="e ? 'background-color:  var(--on); border-color: var(--on-brd)':'background-color:  var(--off); border-color: var(--off-brd)'"><p>~</p></div>
    <div class="term" id="term_1" :style="e ? 'background-color:  var(--on-brd)':'background-color:  var(--off-brd)'"></div>
    </div>
</template>
