<script setup>
import { ref, onMounted, onUnmounted } from "vue";

import Header from "./Header.vue";

const { imageId } = defineProps(["imageId"]);

const onClickLogout = () => {
    window.accessToken = null;
    window.location.reload();
};
const srcUrl = `${
    import.meta.env.VITE_ENDPOINT_BASE_URL
}/user-images/${encodeURIComponent(imageId)}`;
const srcRef = ref();

onMounted(() => {
    async function fetchImage() {
        const res = await fetch(srcUrl, {
            method: "get",
            headers: {
                Authorization: `Bearer ${window.accessToken}`,
            },
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        srcRef.value = url;
    }

    fetchImage();
});

onUnmounted(() => {
    URL.revokeObjectURL(srcRef.value);
});
</script>

<template>
    <div class="image-view">
        <Header :shouldShowUpload="false" @logout.prevent="onClickLogout" />
        <img alt="Secret image" :src="srcRef" />
    </div>
</template>

<style scoped>
.image-view {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

img {
    max-width: 80vw;
    max-height: 80vh;
}
</style>
