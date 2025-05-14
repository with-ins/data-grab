import {AbstractJob} from "../AbstractJob";
import {OnlyBucheonNoticeStep, OnlyBucheonRecruitStep} from "./OnlyBucheonStep";

export class 부천시니어클럽 extends AbstractJob {

    constructor() {
        super(
            '부천시니어클럽',
            'https://senior.bucheon4u.kr/',
            [
                new OnlyBucheonNoticeStep('https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1005&q_domnCode=2&q_estnColumn1=0110301&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder='),
                new OnlyBucheonRecruitStep('https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1014&q_domnCode=2&q_estnColumn1=0110301&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder='),

            ]);
    }
}