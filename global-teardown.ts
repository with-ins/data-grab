import {FileManager} from "./entity/component/FileManager";

export default async function globalTeardown() {
    // 모든 worker가 끝난 후 실행됨
    FileManager.print();
}