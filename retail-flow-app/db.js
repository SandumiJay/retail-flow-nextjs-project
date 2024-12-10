import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { Client } from "ssh2";
import fs from "fs";

dotenv.config();

const sshClient = new Client();

const dbServer = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "saysmulx_qtmp",
};

const localDbServer = {
    host: "localhost",
    port: 3306,
    user: process.env.LOCAL_DB_USERNAME,
    password: process.env.LOCAL_DB_PASSWORD,
    database: "retailflow",
};

const sshTunnelConfig = {
    host: process.env.SSH_HOST,
    port: parseInt(process.env.SSH_PORT, 10) || 22,
    username: process.env.SSH_USER,
    password: process.env.SSH_PASSWORD,
    // privateKey: process.env.SSH_PRIVATE_KEY
    //     ? fs.readFileSync(process.env.SSH_PRIVATE_KEY)
    //     : undefined,
};

const forwardConfig = {
    srcHost: "127.0.0.1",
    srcPort: 3306,
    dstHost: process.env.DB_HOST,
    dstPort: parseInt(process.env.DB_PORT, 10) || 3306,
};

const maxRetries = 2;

const SSHDBConnection = new Promise((resolve, reject) => {
    let retries = 0;

    function attemptRemoteDbConnection() {
        sshClient
            .on("ready", () => {
                console.log("SSH Client Ready");

                sshClient.forwardOut(
                    forwardConfig.srcHost,
                    forwardConfig.srcPort,
                    forwardConfig.dstHost,
                    forwardConfig.dstPort,
                    async (err, stream) => {
                        if (err) {
                            console.error("SSH Tunnel failed:", err.message);
                            handleConnectionFailure();
                            return;
                        }

                        const updatedDbServer = { ...dbServer, stream };

                        try {
                            console.log("Attempting Remote DB Connection...");
                            const connection = await mysql.createConnection(
                                updatedDbServer
                            );
                            console.log("Remote DB Connection Successful");
                            resolve(connection);
                        } catch (error) {
                            console.error(
                                "Remote DB connection failed:",
                                error.message
                            );
                            handleConnectionFailure();
                        }
                    }
                );
            })
            .on("error", (err) => {
                console.error("SSH Connection Error:", err.message);
                handleConnectionFailure();
            })
            .connect(sshTunnelConfig);
    }

    function handleConnectionFailure() {
        retries += 1;
        if (retries <= maxRetries) {
            console.log(
                `Retrying Remote DB Connection... Attempt ${retries}/${maxRetries}`
            );
            sshClient.connect(sshTunnelConfig);
        } else {
            console.error(
                "Max retries reached. Falling back to Local DB Connection."
            );
            connectToLocalDb(resolve, reject);
        }
    }

    attemptRemoteDbConnection();
});

async function connectToLocalDb(resolve, reject) {
    console.log("Attempting Local DB Connection...");
    try {
        const localConnection = await mysql.createConnection(localDbServer);
        console.log("Local DB Connection Successful");
        resolve(localConnection);
    } catch (error) {
        console.error("Local DB connection failed:", error.message);
        reject(error);
    }
}

async function syncOfflineChanges(onlineConnection) {
    console.log("Starting Offline Sync...");
    const localConnection = await mysql.createConnection(localDbServer);

    try {
        const [offlineChanges] = await localConnection.query(
            "SELECT * FROM offline_changes"
        );

        console.log("Offline Changes Retrieved:", offlineChanges);

        for (const change of offlineChanges) {
            const { table_name, change_type, record_id, data } = change;

            console.log(
                `Processing Change - Table: ${table_name}, Type: ${change_type}, Record ID: ${record_id}`
            );

            switch (change_type) {
                case "INSERT":
                    await onlineConnection.query(
                        `INSERT INTO ${table_name} SET ?`,
                        JSON.parse(data)
                    );
                    console.log("Inserted Record:", record_id);
                    break;
                case "UPDATE":
                    await onlineConnection.query(
                        `UPDATE ${table_name} SET ? WHERE id = ?`,
                        [JSON.parse(data), record_id]
                    );
                    console.log("Updated Record:", record_id);
                    break;
                case "DELETE":
                    await onlineConnection.query(
                        `DELETE FROM ${table_name} WHERE id = ?`,
                        [record_id]
                    );
                    console.log("Deleted Record:", record_id);
                    break;
                default:
                    console.warn(`Unknown change type: ${change_type}`);
            }
        }

        await localConnection.query("DELETE FROM offline_changes");
        console.log("Offline changes synced successfully.");
    } catch (error) {
        console.error("Error syncing offline changes:", error.message);
    } finally {
        localConnection.end();
    }
}

export default SSHDBConnection;
