<script setup>
import { ref, onMounted, onUpdated } from "vue";
import { useRouter } from "vue-router";

import ImageItem from "./ImageItem.vue";

const imageList = ref([]);

const $router = useRouter();

const onClickLogout = () => {
    window.accessToken = null;
    window.location.reload();
};

onMounted(async () => {
    const result = await fetch(
        `${import.meta.env.VITE_ENDPOINT_BASE_URL}/user-images`,
        {
            method: "get",
            headers: {
                Authorization: `Bearer ${window.accessToken}`,
            },
        }
    );

    if (result.ok) {
        const { images } = await result.json();

        imageList.value = images;
    } else if (result.status === 401) {
        $router.push({ path: "/login" });
    } else {
        $router.push({ path: "/error" });
    }
});
</script>

<template>
    <div v-if="imageList.length > 0" class="image-list">
        <div class="title-container">
            <h1>Imagine</h1>
            <span class="space" />
            <button class="logout-button" @click.prevent="onClickLogout">
                Log out
            </button>
        </div>
        <ImageItem
            v-for="image in imageList"
            :id="image.id"
            :name="image.name"
            :key="image.id"
        />
    </div>
</template>

<style scoped>
.title-container {
    display: flex;
    flex-direction: row;
    width: 680px;
    align-items: center;
}

h1 {
    flex: 0 0 auto;
    font-size: 40px;
}

.space {
    flex: 1 1 0;
}

.logout-button {
    flex: 0 0 auto;
    background: transparent;
    border: 1px solid black;
    font-size: 18px;
    border-radius: 2px;
}

.image-list {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
