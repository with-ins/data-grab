import { Category } from '../entity/Category';

export function classifyCategory(text: string): Category | null {
    if (!text) return null;
    
    const categoryMap = [
        { keywords: ['채용'], category: Category.RECRUIT }
    ];
    
    const found = categoryMap.find(item => 
        item.keywords.some(keyword => text.includes(keyword))
    );
    
    return found ? found.category : null;
} 