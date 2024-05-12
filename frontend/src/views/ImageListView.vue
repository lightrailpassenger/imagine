<script setup>
import ImageList from "../components/ImageList.vue";

defineOptions({
    inheritAttrs: false,
});
</script>

<template>
    <main>
        <ImageList v-bind="$attrs" />
    </main>
</template>
