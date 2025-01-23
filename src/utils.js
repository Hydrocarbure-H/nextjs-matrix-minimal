import * as sdk from "matrix-js-sdk";

const matrixClient = sdk.createClient({
    baseUrl: "http://localhost:8008",
    accessToken: sessionStorage.getItem("accessToken"),
    userId: sessionStorage.getItem("userId"),
    cryptoStore: new sdk.IndexedDBCryptoStore(window.indexedDB, "matrix-client-crypto"),
});
await matrixClient.initRustCrypto();

export default matrixClient;