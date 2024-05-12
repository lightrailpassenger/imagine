<script setup>
import UploadPage from "../components/UploadPage.vue";

defineOptions({
    inheritAttrs: false,
});
</script>

<template>
    <main>
        <UploadPage v-bind="$attrs" />
    </main>
</template>
