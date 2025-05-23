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
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wave {
    width: 60%;
    height: 30%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wave svg {
    width: 100%;
    height: 100%;
  }

  .wave path {
    fill: var(--background);
    stroke: var(--background);
    stroke-width: 4;
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
  <div class="src">
    <div class="body" :style="e ? 'background-color: var(--line-on); border-color: var(--line-on)':'background-color: var(--off); border-color: var(--line-off)'">
      <div class="wave">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none">
          <path d="M0,20 Q25,-20 50,20 T100,20" />
        </svg>
      </div>
    </div>
    <div class="term" :style="e ? 'background-color: var(--line-on)':'background-color: var(--line-off)'"></div>
  </div>
</template>
