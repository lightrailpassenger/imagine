import get from "lodash/fp/get.js";
import JSZip from "jszip";

const UPLOAD_URL = "https://www.virustotal.com/api/v3/files" as const;
const ANALYSIS_URL = "https://www.virustotal.com/api/v3/analyses" as const;

const MAX_NUM_RETRIES = 5 as const;
const WAITING_DURATION_MS = 30_000 as const;

class VirusTotalClient {
    #apiKey: string;

    constructor(apiKey: string) {
        this.#apiKey = apiKey;
    }

    async check(
        file: Buffer
    ): Promise<{ isPassed: boolean | { pendingId: string } }> {
        const zip = new JSZip();

        zip.file("file", file);

        const blob: Blob = await zip.generateAsync({ type: "blob" });
        const formData = new FormData();

        formData.append("file", blob, "file.zip");

        const uploadResult = await fetch(UPLOAD_URL, {
            method: "POST",
            body: formData,
            headers: {
                "x-apikey": this.#apiKey,
            },
        });

        if (!uploadResult.ok) {
            return { isPassed: false };
        }

        const uploadJson = await uploadResult.json();
        const id = get("data.id")(uploadJson);

        if (typeof id !== "string") {
            return { isPassed: false };
        }

        const fetchAnalysis = async (
            id: string,
            numRetries: number
        ): Promise<boolean | { pendingId: string }> => {
            if (numRetries >= MAX_NUM_RETRIES) {
                return { pendingId: id };
            }

            await new Promise((res) => {
                setTimeout(res, WAITING_DURATION_MS);
            });

            const analysisResult = await fetch(
                `${ANALYSIS_URL}/${encodeURIComponent(id)}`,
                {
                    headers: {
                        "x-apikey": this.#apiKey,
                    },
                }
            );

            if (!analysisResult.ok) {
                return false;
            }

            const analysisJson = await analysisResult.json();
            const attributes = get("data.attributes")(analysisJson);
            const status = get("status")(attributes);

            if (status === "queued") {
                return await fetchAnalysis(id, numRetries + 1);
            }

            const suspicious = get("stats.suspicious")(attributes);
            const malicious = get("stats.malicious")(attributes);

            return suspicious === 0 && malicious === 0;
        };

        return {
            isPassed: await fetchAnalysis(id, 0),
        };
    }
}

export default VirusTotalClient;
