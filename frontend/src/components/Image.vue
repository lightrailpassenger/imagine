<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

import Header from "./Header.vue";

const { imageId } = defineProps({
    imageId: {
        type: Object,
        required: true,
    },
});

const $router = useRouter();
const onClickLogout = () => {
    window.accessToken = null;
    $router.push({ path: "/" });
};
const onDelete = () => {
    const dialog = document.getElementById("delete-dialog");
    dialog.showModal();
};

const onDeleteDialogClose = (event) => {
    if (event.target.returnValue === "yes") {
        fetch(
            `${
                import.meta.env.VITE_ENDPOINT_BASE_URL
            }/user-images/${encodeURIComponent(imageId)}`,
            {
                method: "delete",
                headers: {
                    Authorization: `Bearer ${window.accessToken}`,
                },
            }
        ).then(() => {
            $router.push({ path: "/list" });
        }); // TODO: Error state
    }
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
        <Header :should-show-upload="false" @logout.prevent="onClickLogout" />
        <img alt="Secret image" :src="srcRef" />
        <div class="button-div">
            <button class="bottom-button" @click.prevent="onShare">
                Share
            </button>
            <button class="bottom-button" @click.prevent="onDelete">
                Delete
            </button>
        </div>
        <dialog id="delete-dialog" @close="onDeleteDialogClose">
            <form method="dialog">
                <p>Do you want to delete the image? This cannot be undone.</p>
                <button type="submit" value="no">No</button>
                <button type="submit" value="yes">Yes</button>
            </form>
        </dialog>
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

.button-div {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    margin-top: 10px;
    max-width: 150px;
    max-height: 40px;
}

.bottom-button {
    margin: 3px;
    width: 50px;
    height: 25px;
    background: transparent;
    border: 1px solid black;
    border-radius: 2px;
}

form {
    text-align: right;
}

form > button {
    background: transparent;
    border: 1px solid black;
    border-radius: 2px;
    margin: 3px;
}

dialog {
    border: none;
    border-radius: 12px;
}
</style>
