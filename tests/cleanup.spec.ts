import {test} from "@playwright/test";
import {FileManager} from "../src/entity/component/FileManager";
import {SyncManager} from "../src/entity/component/SyncManager";

test('Data Sync Complete', ({ page }) => {
    console.log('Data Sync Complete');
    SyncManager.sync();
    FileManager.print();
})