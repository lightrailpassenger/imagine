<script setup>
import { useRoute } from "vue-router";

import Image from "../components/Image.vue";

const $route = useRoute();
const imageId = $route.params.imageId;
</script>

<template>
    <main>
        <Image :image-id="imageId" />
    </main>
</template>
