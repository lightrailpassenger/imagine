<script setup>
import { ref, onMounted, onUnmounted, toRaw } from "vue";
import { useRouter } from "vue-router";

import Header from "./Header.vue";

const { credentialsHeader, imageId } = defineProps({
    credentialsHeader: {
        type: Object,
        required: true,
    },
    imageId: {
        type: String,
        required: true,
    },
});
const emit = defineEmits(["login"]);

const $router = useRouter();
const onClickLogout = () => {
    emit("login", null);
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
                headers: toRaw(credentialsHeader),
            }
        ).then(() => {
            $router.push({ path: "/list" });
        }); // TODO: Error state
    }
};

const createShareLinkLimit = ref(5);
const onShare = () => {
    const dialog = document.getElementById("create-share-link-dialog");
    dialog.showModal();
};

const onCreateShareLinkDialogClose = async (event) => {
    if (event.target.returnValue === "share") {
        const res = await fetch(
            `${
                import.meta.env.VITE_ENDPOINT_BASE_URL
            }/user-images/${encodeURIComponent(imageId)}/share-link`,
            {
                method: "post",
                headers: {
                    ...toRaw(credentialsHeader),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ limit: createShareLinkLimit.value }),
            }
        );

        if (res.ok) {
            const { token } = await res.json();
            const fullURL = `${
                new URL(window.location.href).origin
            }/guest/${encodeURIComponent(token)}`;

            await window.navigator.clipboard.writeText(fullURL);

            document.getElementById("shared-dialog").showModal();
        } else {
            // TODO: Error state
        }
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
            headers: toRaw(credentialsHeader),
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
        <dialog
            id="create-share-link-dialog"
            @close="onCreateShareLinkDialogClose"
        >
            <form method="dialog">
                <p>
                    Limit:
                    <input
                        class="limit-input"
                        type="number"
                        min="1"
                        max="10"
                        step="1"
                        v-model="createShareLinkLimit"
                    />
                </p>
                <button type="submit" value="cancel">Cancel</button>
                <button type="submit" value="share">Share</button>
            </form>
        </dialog>
        <dialog id="shared-dialog">
            <form>
                <p>Shared. The URL has been copied to the clipboard.</p>
                <button type="submit" formmethod="dialog" value="close">
                    Done
                </button>
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

.limit-input {
    width: 100px;
    margin-left: 20px;
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
