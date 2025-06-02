import {test} from "@playwright/test";
import {SyncManager} from "../src/entity/component/SyncManager";

test('Data Sync', async ({ page }) => {
    console.log('Data Sync');
    await SyncManager.fetchSync();
});