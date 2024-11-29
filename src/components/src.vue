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
        position: absolute;
        color: var(--background);
        font-weight: bold;
        font-size: 100%;
    }
  }
  .term {
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
    <div class="body" :style="e ? 'background-color:  var(--line-on); border-color: var(--line-on)':'background-color:  var(--off); border-color: var(--line-off)'"><p>~</p></div>
    <div class="term" :style="e ? 'background-color:  var(--line-on)':'background-color:  var(--line-off)'"></div>
  </div>
</template>
