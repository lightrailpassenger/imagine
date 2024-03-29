<script setup>
import { ref, onMounted, toRaw } from "vue";
import { useRouter } from "vue-router";

import Header from "./Header.vue";
import ImageItem from "./ImageItem.vue";

const imageList = ref([]);

const $router = useRouter();

const { credentialsHeader } = defineProps({
    credentialsHeader: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["login"]);
const onClickLogout = () => {
    emit("login", null);
    $router.push({ path: "/" });
};

const onUpload = () => {
    $router.push({ path: "/upload" });
};

onMounted(async () => {
    const result = await fetch(
        `${import.meta.env.VITE_ENDPOINT_BASE_URL}/user-images`,
        {
            method: "get",
            headers: toRaw(credentialsHeader),
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
        <Header
            :should-show-upload="true"
            @logout.prevent="onClickLogout"
            @upload.prevent="onUpload"
        />
        <ImageItem
            v-for="image in imageList"
            :id="image.id"
            :key="image.id"
            :name="image.name"
        />
    </div>
</template>

<style scoped>
.image-list {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
