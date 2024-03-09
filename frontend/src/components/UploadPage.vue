<script setup>
import { ref, toRaw, toValue, watch } from "vue";
import { useRouter } from "vue-router";

import Header from "./Header.vue";

const { credentialsHeader } = defineProps({
    credentialsHeader: {
        type: Object,
        required: true,
    },
});
const emit = defineEmits(["login"]);
const submitting = ref(null);
const name = ref(null);
const file = ref(null);
const error = ref(null);

const $router = useRouter();

const onFileChange = (event) => {
    file.value = event.target.files[0];
};

const onClickLogout = () => {
    emit("login", null);
    $router.push({ path: "/" });
};

const onFormSubmit = () => {
    const formData = new FormData();

    formData.append("image", toValue(file));
    formData.append("name", name.value || file.value.name);

    submitting.value = formData;
};

watch(submitting, async () => {
    const result = await fetch(
        `${import.meta.env.VITE_ENDPOINT_BASE_URL}/user-images`,
        {
            method: "post",
            body: toValue(submitting),
            headers: toRaw(credentialsHeader),
        }
    );

    if (result.ok) {
        $router.push({ path: "/list" });
    } else if (result.status === 401) {
        $router.push({ path: "/login" });
    } else {
        const { err } = await result.json();

        error.value = err;
    }
});
</script>

<template>
    <div class="upload-page">
        <Header @logout.prevent="onClickLogout" />
        <form @submit.prevent="onFormSubmit">
            <input type="file" @change.prevent="onFileChange" />
            <input v-model="name" type="text" placeholder="Name" />
            <button type="submit">Upload</button>
            <span>{{ error }}</span>
        </form>
    </div>
</template>

<style scoped>
.upload-page {
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

form {
    max-width: 680px;
}

button {
    border: 1px solid black;
    border-radius: 5px;
    background: transparent;
    padding: 5px 10px;
}

button,
input {
    display: block;
    margin-top: 8px;
    font-size: 20px;
}
</style>
