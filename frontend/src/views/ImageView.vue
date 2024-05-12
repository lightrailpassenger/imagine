<script setup>
import { useRoute } from "vue-router";

import Image from "../components/Image.vue";

defineOptions({
    inheritAttrs: false,
});

const $route = useRoute();
const imageId = $route.params.imageId;
</script>

<template>
    <main>
        <Image :image-id="imageId" v-bind="$attrs" />
    </main>
</template>
