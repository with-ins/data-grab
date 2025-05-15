import {AbstractJob} from "../../AbstractJob";
import { OnlyBucheonDefaultStep } from "./OnlyBucheonStep";
import {Category} from "../../../Category";

export class 오정노인복지기관 extends AbstractJob {

    constructor() {
        super(
            '오정노인복지관',
            'https://senior.bucheon4u.kr/',
            [
                new OnlyBucheonDefaultStep(Category.NOTICE, 'https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1005&q_domnCode=2&q_estnColumn1=0110303&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder='),
                new OnlyBucheonDefaultStep(Category.RECRUIT,'https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1014&q_domnCode=2&q_estnColumn1=0110303&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder='),
                new OnlyBucheonDefaultStep(Category.WELFARE, 'https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1006&q_domnCode=2&q_estnColumn1=0110303&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder='),

            ]);
    }
}