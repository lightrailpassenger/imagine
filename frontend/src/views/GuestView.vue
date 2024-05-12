<script setup>
import GuestImage from "../components/GuestImage.vue";

defineOptions({
    inheritAttrs: false,
});
</script>

<template>
    <main>
        <GuestImage v-bind="$attrs" />
    </main>
</template>
