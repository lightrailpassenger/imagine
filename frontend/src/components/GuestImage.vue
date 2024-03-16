<script setup>
import { ref } from "vue";

const GUEST_IMAGE_TIMEOUT = 30000; // TODO: Introduce numeric separate support to `eslint`
const { token } = window.history.state;
const imageDialog = ref();
const notFoundDialog = ref();
const errorDialog = ref();
const imgSrc = ref(null);
let timeoutId = null;

const onContinue = async () => {
    const res = await fetch(
        `${
            import.meta.env.VITE_ENDPOINT_BASE_URL
        }/user-images/share-link/${encodeURIComponent(token)}`,
        {
            method: "post",
        }
    );

    if (res.ok) {
        const blob = await res.blob();
        imgSrc.value = URL.createObjectURL(blob);
        imageDialog.value.showModal();

        timeoutId = setTimeout(() => {
            URL.revokeObjectURL(imgSrc.value);
            imgSrc.value = null;
            imageDialog.value.close();
        }, GUEST_IMAGE_TIMEOUT);
    } else if (res.status === 404) {
        notFoundDialog.value.showModal();
    } else {
        errorDialog.value.showModal();
    }
};
const onImageClose = () => {
    URL.revokeObjectURL(imgSrc.value);
    imgSrc.value = null;
    clearTimeout(timeoutId);
    timeoutId = null;
};
</script>

<template>
    <div class="guest-image-view">
        <h1>View Image</h1>
        <button class="main" @click="onContinue">Continue</button>
        <dialog ref="imageDialog" class="image-dialog" @close="onImageClose">
            <div class="guest-image-pane">
                <img :src="imgSrc" />
                <form>
                    <button class="guest-image-pane-close" formmethod="dialog">
                        Close
                    </button>
                </form>
            </div>
        </dialog>
        <dialog ref="notFoundDialog">
            <form>
                <p>No image found. Is your token valid?</p>
                <button formmethod="dialog">Close</button>
            </form>
        </dialog>
        <dialog ref="errorDialog">
            <form>
                <p>An unknown error occurred.</p>
                <button formmethod="dialog">Close</button>
            </form>
        </dialog>
    </div>
</template>

<style scoped>
h1 {
    font-size: 60px;
}

.guest-image-view {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.guest-image-pane {
    position: relative;
    width: 100%;
    height: 100%;
}

.image-dialog {
    width: 90vw;
    height: 90vh;
    padding: 5px;
}

img {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    max-width: calc(100% - 2.5px);
    max-height: calc(100% - 2.5px);
}

.guest-image-pane-close {
    position: absolute;
    right: 0;
    bottom: 0;
}

button {
    background: transparent;
    border: 1px solid black;
    border-radius: 5px;
    font-size: 13px;
}

button.main {
    font-size: 22px;
}
</style>
