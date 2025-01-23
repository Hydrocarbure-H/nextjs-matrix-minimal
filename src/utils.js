import * as sdk from "matrix-js-sdk";

const matrixClient = sdk.createClient({
    baseUrl: "http://localhost:8008"
});

export default matrixClient;