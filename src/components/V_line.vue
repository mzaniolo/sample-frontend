<script setup>
const props = defineProps({
  e: Boolean,
})
</script>

<style>
.v-line {
    position: relative;
    border-radius: 15%;
}


</style>

<template>
  <div class="v-line"  :style="e ? 'background-color:  var(--on-brd)':'background-color:  var(--off-brd)'">
  </div>
</template>
