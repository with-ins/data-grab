import { AbstractJob } from '../../../../AbstractJob';
import { Category } from '../../../../../Category';
import { OnlyBucheonDefaultStep } from '../OnlyBucheonDefaultStep';
import { OnlyBucheonImageStep } from '../OnlyBucheonImageStep';
import { Optimize, Optimizer } from '../../../../../Optimize';

export class 소사노인복지관 extends AbstractJob {
    constructor() {
        super('소사노인복지관', 'https://senior.bucheon4u.kr', [
            new OnlyBucheonDefaultStep(
                Category.NOTICE,
                'https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1005&q_domnCode=2&q_estnColumn1=0110302&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder=',
                (param1, param2, param3) =>
                    `https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbs.do?q_domnCode=${param1}&q_bbsCode=${param2}&q_bbscttSn=${param3}`
            ),
            new OnlyBucheonDefaultStep(
                Category.RECRUIT,
                'https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1014&q_domnCode=2&q_estnColumn1=0110302&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder=',
                (param1, param2, param3) =>
                    `https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbs.do?q_domnCode=${param1}&q_bbsCode=${param2}&q_bbscttSn=${param3}`
            ),
            new OnlyBucheonDefaultStep(
                Category.WELFARE,
                'https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1006&q_domnCode=2&q_estnColumn1=0110302&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder=',
                (param1, param2, param3) =>
                    `https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbs.do?q_domnCode=${param1}&q_bbsCode=${param2}&q_bbscttSn=${param3}`
            ),
            new OnlyBucheonImageStep(
                Category.EVENT,
                'https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1008&q_domnCode=2&q_estnColumn1=0110302&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder=',
                (param1, param2, param3) =>
                    `https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbs.do?q_domnCode=${param1}&q_bbsCode=${param2}&q_bbscttSn=${param3}`
            ),
        ]);
    }

    registerOptimizer(optimizer: Optimizer) {
        optimizer.register(Optimize.JS);
    }
}
