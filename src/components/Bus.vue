<script setup>
const props = defineProps({
  e: Boolean,
})
</script>

<style>
.bus {

    height: 1%;
    position: relative;
    border-width: 2px;
    border-color: black;
    border-style: solid;
    border-radius: 15%;
}


</style>

<template>
  <div class="bus"  :style="e ? 'background-color:  var(--on); border-color: var(--on-brd)':'background-color:  var(--off); border-color: var(--off-brd)'">
  </div>
</template>
