<script setup>
import { ref } from "vue";

const button = ref();

const { style } = defineProps(["style"]);
defineExpose({
    button,
});
</script>

<template>
    <button ref="button" :style="style">
        <slot />
    </button>
</template>

<style scoped>
button {
    font-size: 20px;
    border: 1px solid black;
    border-radius: 5px;
    background: transparent;
    padding: 5px 10px;
}
</style>
