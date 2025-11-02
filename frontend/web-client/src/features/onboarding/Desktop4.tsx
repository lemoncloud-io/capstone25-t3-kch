// src/features/onboarding/Desktop4.tsx

import React, { useState } from 'react';
import Header from './Header'; 
import { Home, BookOpen, Briefcase, TrendingUp, DollarSign, ShoppingBag, Film, Heart, Globe, Users, ChevronLeft } from 'lucide-react'; 

// =========================================================================
// 1. 통합 카테고리 매핑 정의 (CategoryPage.tsx에서 사용한 4개의 대주제)
// =========================================================================
const INTEREST_TO_NEW_SLUG_MAP = {
    '취업 지원': 'jobs',
    '교육/자격증': 'education',
    '창업': 'jobs',
    '주거': 'housing',
    '대출/금융': 'welfareCulture',
    '생활비 지원': 'welfareCulture',
    '문화/여가': 'welfareCulture',
    '건강/상담': 'welfareCulture',
    '해외 기회': 'jobs',
    '청년 참여': 'jobs', // 청년 참여도 '일자리' 카테고리에 포함
} as const;

// =========================================================================
// 타입 정의
// =========================================================================
type IconType = typeof Briefcase; 

// 2. 기존 INTEREST_CATEGORIES 배열 수정: 
// name(한글명)을 기준으로 맵핑할 것이므로 slug 속성은 더 이상 사용되지 않지만,
// 기존 코드의 데이터 구조를 유지하고 재사용성을 높이기 위해 name과 key만 남깁니다.
const INTEREST_CATEGORIES: { key: string; name: string; icon: IconType }[] = [
    { key: 'employment_support', name: '취업 지원', icon: Briefcase },
    { key: 'education_license', name: '교육/자격증', icon: BookOpen },
    { key: 'startup', name: '창업', icon: TrendingUp },
    { key: 'housing', name: '주거', icon: Home },
    { key: 'loan_finance', name: '대출/금융', icon: DollarSign },
    { key: 'living_support', name: '생활비 지원', icon: ShoppingBag },
    { key: 'culture_leisure', name: '문화/여가', icon: Film },
    { key: 'health_counseling', name: '건강/상담', icon: Heart },
    { key: 'overseas_opportunity', name: '해외 기회', icon: Globe },
    { key: 'youth_participation', name: '청년 참여', icon: Users },
] as const;

interface Desktop4Props {
    // onSelectInterests는 이제 통합된 4개 중 하나의 slug를 받게 됩니다.
    onSelectInterests: (interests: string[]) => void;
}

// =========================================================================
// InterestItem 컴포넌트 (변경 없음, item 타입만 소폭 수정)
// =========================================================================

interface ItemProps {
    item: typeof INTEREST_CATEGORIES[0];
    isSelected: boolean;
    onClick: () => void;
}

const InterestItem: React.FC<ItemProps> = ({ item, isSelected, onClick }) => {
    const IconComponent = item.icon;
    
    const itemClasses = `
        flex flex-col items-center justify-center text-center 
        w-full aspect-square min-h-[150px] lg:h-[250px] p-4 rounded-2xl cursor-pointer 
        transition-all duration-200 shadow-lg hover:shadow-xl
        ${isSelected 
            ? 'bg-[#B0CEEA] border-4 border-[#2376C4]' 
            : 'bg-white border-4 border-[#E0E0E0] hover:border-[#B0CEEA]'
        }
    `;
    
    const iconColor = isSelected ? 'text-[#2376C4]' : 'text-[#B0CEEA]';
    const textClasses = isSelected 
        ? 'text-lg lg:text-xl text-[#1a5c9a] font-extrabold' 
        : 'text-lg lg:text-xl text-[#2376C4] font-semibold';

    return (
        <div 
            className={itemClasses} 
            onClick={onClick}
        >
            {/* 아이콘 컨테이너 */}
            <div className="w-16 h-16 lg:w-24 lg:h-24 mb-3 flex items-center justify-center flex-shrink-0">
                <IconComponent 
                    size={64}
                    className={`${iconColor} lg:w-24 lg:h-24`}
                    role="img"
                    aria-label={`${item.name} 아이콘`}
                />
            </div>
            
            {/* 텍스트 */}
            <span className={`leading-snug px-2 ${textClasses}`}>
                {item.name}
            </span>
        </div>
    );
};


// =========================================================================
// 메인 컴포넌트 (Desktop4) - 핵심 수정 로직
// =========================================================================

const Desktop4: React.FC<Desktop4Props> = ({ onSelectInterests }) => {
    const [selectedInterest, setSelectedInterest] = useState<string | null>(null);

    const toggleInterest = (interestKey: string) => {
        setSelectedInterest(prev => (prev === interestKey ? null : interestKey));
    };

    const isSelectionValid = selectedInterest !== null;

    // 3. handleNext 로직 수정: 선택된 관심사를 통합 카테고리 slug로 변환합니다.
    const handleNext = () => {
        if (isSelectionValid && selectedInterest) {
            // 1. 선택된 관심사의 key를 사용하여 **한글 이름**을 찾습니다.
            const selectedItem = INTEREST_CATEGORIES.find(item => item.key === selectedInterest);
            const interestName = selectedItem ? selectedItem.name : null;
            
            if (interestName) {
                // 2. 한글 이름을 사용하여 **통합 카테고리 slug**를 맵핑 테이블에서 찾습니다.
                const newCategorySlug = INTEREST_TO_NEW_SLUG_MAP[interestName as keyof typeof INTEREST_TO_NEW_SLUG_MAP];

                // 3. 통합된 slug를 onSelectInterests로 전달합니다.
                if (newCategorySlug) {
                    onSelectInterests([newCategorySlug]); 
                }
            }
        }
    };

    const contentPaddingTopClass = "pt-20 pb-16 lg:pt-0 lg:pb-0"; 

    return (
        <div className="w-screen min-h-screen bg-white flex flex-col items-stretch relative font-inter">
            {/* ... (UI 코드는 변경 없음) */}
            <Header />

            <div className={`flex flex-col items-center flex-grow justify-center px-5 w-full max-w-[1400px] mx-auto ${contentPaddingTopClass}`}>

                <h2 className="text-2xl sm:text-3xl lg:text-[30px] font-bold text-gray-800 text-center mb-8 lg:mb-12">
                    당신의 관심사는 무엇인가요?
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 w-full max-w-[1200px] mb-8 lg:mb-12">
                    {INTEREST_CATEGORIES.map(item => {
                        const isSelected = selectedInterest === item.key;

                        return (
                            <InterestItem
                                key={item.key}
                                item={item}
                                isSelected={isSelected}
                                onClick={() => toggleInterest(item.key)}
                            />
                        );
                    })}
                </div>

                <button
                    className={`
                        w-full max-w-sm sm:w-[300px] h-[60px] lg:h-[70px] mt-4 lg:mt-8 mb-6 lg:mb-10 
                        rounded-full text-white text-xl lg:text-3xl font-semibold transition-colors duration-200
                        ${isSelectionValid ? 'bg-[#2376C4] hover:bg-[#1a5c9a] cursor-pointer shadow-xl' : 'bg-[#CCCCCC] cursor-not-allowed'}
                    `}
                    onClick={handleNext}
                    disabled={!isSelectionValid}
                >
                    선택 완료 ({selectedInterest ? 1 : 0}개)
                </button>

                <div className="flex justify-center gap-2 w-full mb-8">
                    <div className="w-4 h-4 rounded-full bg-[#E0E0E0]" />
                    <div className="w-4 h-4 rounded-full bg-[#E0E0E0]" />
                    <div className="w-4 h-4 rounded-full bg-[#B0CEEA]" />  
                </div>
            </div>
        </div>
    );
};

export default Desktop4;