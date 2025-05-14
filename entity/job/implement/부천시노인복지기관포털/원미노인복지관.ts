import {AbstractJob} from "../../AbstractJob";
import { OnlyBucheonDefaultStep } from "./OnlyBucheonStep";

export class 원미노인복지관 extends AbstractJob {

    constructor() {
        super(
            '원미노인복지관',
            'https://senior.bucheon4u.kr/',
            [
                new OnlyBucheonDefaultStep('NOTICE', 'https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1005&q_domnCode=2&q_estnColumn1=0110304&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder='),
                new OnlyBucheonDefaultStep('RECRUITMENT', 'https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1014&q_domnCode=2&q_estnColumn1=0110304&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder='),
                new OnlyBucheonDefaultStep('WELFARE', 'https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1006&q_domnCode=2&q_estnColumn1=0110304&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder='),
            ]);
    }
}