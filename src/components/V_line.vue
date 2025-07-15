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
  <div class="v-line" :style="e ? 'background-color:  var(--line-on)':'background-color:  var(--line-off)'" title="Voltage Line">
  </div>
</template>
