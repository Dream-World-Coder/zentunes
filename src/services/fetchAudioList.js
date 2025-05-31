export default async function fetchMusicsList(apiUrl) {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.audio_data) {
        return data.audio_data;
    } else if (data.error) {
        console.log(`Error:`, data.error);
        throw new Error(data.error);
    } else {
        console.log(`unknown response`);
        throw new Error("unknown response");
    }
}
