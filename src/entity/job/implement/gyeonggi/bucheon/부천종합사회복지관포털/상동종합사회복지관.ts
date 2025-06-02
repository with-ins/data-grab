import {AbstractJob} from "../../../../AbstractJob";
import {Category} from "../../../../../Category";
import {OnlyBucheonDefaultStep} from "../OnlyBucheonDefaultStep";
import {OnlyBucheonImageStep} from "../OnlyBucheonImageStep";
import {Optimize, Optimizer} from "../../../../../Optimize";

export class 상동종합사회복지관 extends AbstractJob {

    constructor() {
        super(
            '상동종합사회복지관',
            'https://welfare.bucheon4u.kr',
            [
                new OnlyBucheonDefaultStep(
                    Category.NOTICE,
                    'https://welfare.bucheon4u.kr/welfare/user/bbs/BD_selectBbsList.do?q_bbsCode=1005&q_domnCode=1&q_estnColumn1=0110105&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder=',
                    (param1, param2, param3) => `https://welfare.bucheon4u.kr/welfare/user/bbs/BD_selectBbs.do?q_domnCode=${param1}&q_bbsCode=${param2}&q_bbscttSn=${param3}`
                ),
                new OnlyBucheonImageStep(
                    Category.WELFARE,
                    'https://welfare.bucheon4u.kr/welfare/user/bbs/BD_selectBbsList.do?q_bbsCode=1008&q_domnCode=1&q_estnColumn1=0110105&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder=',
                    (param1, param2, param3) => `https://welfare.bucheon4u.kr/welfare/user/bbs/BD_selectBbs.do?q_domnCode=${param1}&q_bbsCode=${param2}&q_bbscttSn=${param3}`
                ),
            ]);
    }

    registerOptimizer(optimizer: Optimizer) {
        optimizer.register(Optimize.JS)
    }
}