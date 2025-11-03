// src/features/onboarding/Desktop4.tsx

import React, { useState } from 'react';
import Header from './Header'; 
import { Home, BookOpen, Briefcase, TrendingUp, DollarSign, ShoppingBag, Film, Heart, Globe, Users, ChevronLeft } from 'lucide-react'; 

// =========================================================================
// 1. 통합 카테고리 매핑 정의 
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
    '청년 참여': 'jobs', 
} as const;

// 🌟 추가: NewCategorySlug 타입 정의 (오류 해결 핵심)
type NewCategorySlug = typeof INTEREST_TO_NEW_SLUG_MAP[keyof typeof INTEREST_TO_NEW_SLUG_MAP];


// =========================================================================
// 타입 및 데이터 정의
// =========================================================================
type IconType = typeof Briefcase; 

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
    onSelectInterests: (interests: string[]) => void;
    // 🌟 추가: 뒤로가기 콜백 함수 타입 정의
    onGoBack: () => void; 
}

// =========================================================================
// InterestItem 컴포넌트 
// =========================================================================

interface ItemProps {
    item: typeof INTEREST_CATEGORIES[0];
    isSelected: boolean;
    onClick: () => void;
}

const InterestItem: React.FC<ItemProps> = ({ item, isSelected, onClick }) => {
    const IconComponent = item.icon;
    
    // 카드 크기 조정: max-w, min-h, lg:h 적용
    const itemClasses = `
        flex flex-col items-center justify-center text-center 
        w-full max-w-[180px] aspect-square min-h-[100px] lg:h-[150px] p-4 rounded-2xl cursor-pointer 
        transition-all duration-200 shadow-lg hover:shadow-xl
        ${isSelected 
            ? 'bg-[#B0CEEA] border-4 border-[#2376C4]' 
            : 'bg-white border-4 border-[#E0E0E0] hover:border-[#B0CEEA]'
        }
    `;
    
    const iconColor = isSelected ? 'text-[#2376C4]' : 'text-[#B0CEEA]';
    // 텍스트 크기 조정: text-base lg:text-lg 적용
    const textClasses = isSelected 
        ? 'text-base lg:text-lg text-[#1a5c9a] font-extrabold' 
        : 'text-base lg:text-lg text-[#2376C4] font-semibold';

    return (
        <div 
            className={itemClasses} 
            onClick={onClick}
        >
            {/* 아이콘 컨테이너 및 아이콘 크기 조정 */}
            <div className="w-10 h-10 lg:w-14 lg:h-14 mb-1 flex items-center justify-center flex-shrink-0">
                <IconComponent 
                    size={40}
                    className={`${iconColor} lg:w-10 lg:h-10`}
                    role="img"
                    aria-label={`${item.name} 아이콘`}
                />
            </div>
            
            <span className={`leading-snug px-2 ${textClasses}`}>
                {item.name}
            </span>
        </div>
    );
};


// =========================================================================
// 메인 컴포넌트 (Desktop4) 
// =========================================================================

const Desktop4: React.FC<Desktop4Props> = ({ onSelectInterests, onGoBack }) => { 
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const toggleInterest = (interestKey: string) => {
        setSelectedInterests(prev => {
            if (prev.includes(interestKey)) {
                return prev.filter(key => key !== interestKey);
            } else {
                return [...prev, interestKey];
            }
        });
    };

    const isSelectionValid = selectedInterests.length > 0;

    const handleNext = () => {
        if (isSelectionValid) {
            
            // 🌟 수정된 부분 1: map의 반환 타입을 명시적으로 지정
            const selectedSlugs = selectedInterests
                .map((key): NewCategorySlug | null => {
                    const selectedItem = INTEREST_CATEGORIES.find(item => item.key === key);
                    const interestName = selectedItem ? selectedItem.name : null;

                    if (interestName) {
                        return INTEREST_TO_NEW_SLUG_MAP[interestName as keyof typeof INTEREST_TO_NEW_SLUG_MAP];
                    }
                    return null;
                })
                // 🌟 수정된 부분 2: 필터링된 결과의 타입을 정확히 NewCategorySlug로 가드
                .filter((slug): slug is NewCategorySlug => slug !== null); 

            if (selectedSlugs.length > 0) {
                // onSelectInterests는 string[]을 받습니다. NewCategorySlug는 string의 유니온 타입이므로 호환됩니다.
                onSelectInterests(selectedSlugs); 
            }
        }
    };

    const contentPaddingTopClass = "pt-20 pb-16 lg:pt-0 lg:pb-0"; 
    // 🌟 수정: mt-[110px] -> mt-10으로 변경하여 제목을 위로 올림
    const questionMarginTopClass = "mt-19"; 
    

    return (
        <div className="w-screen min-h-screen bg-white flex flex-col items-stretch relative font-inter">
            <Header />

            <div className={`flex flex-col items-center flex-grow justify-center px-5 w-full max-w-[1400px] mx-auto relative ${contentPaddingTopClass}`}>
                
                {/* 뒤로가기 버튼 위치는 Desktop3와 동일하게 유지 */}
                <button
                    onClick={onGoBack}
                    className="absolute top-[40px] left-[180px] text-[#2376C4] hover:opacity-70 transition-opacity p-2 z-20"
                    aria-label="이전 단계로"
                >
                    <ChevronLeft size={30} />
                </button>

                {/* 🌟 수정: mt-[110px] 대신 questionMarginTopClass (mt-10) 적용 */}
                <h2 className={`text-xl sm:text-2xl lg:text-[25px] font-bold text-gray-800 text-center ${questionMarginTopClass} mb-8 lg:mb-12`}>
                    당신의 관심사는 무엇인가요?
                </h2>

                {/* 그리드 컨테이너: 간격(gap) 축소 및 max-w 조정, 버튼과의 간격을 위해 mb-4 lg:mb-6으로 축소 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3 w-full max-w-[1000px] mb-4 lg:mb-6">
                    {INTEREST_CATEGORIES.map(item => { 
                        // 선택 상태 확인 로직 변경 (배열에 포함되어 있는지 확인)
                        const isSelected = selectedInterests.includes(item.key);
                        
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
                        w-full max-w-sm sm:w-[180px] h-[50px] lg:h-[60px] 
                        mt-4 lg:mt-1 mb-4 lg:mb-6 // 버튼 윗쪽 마진 축소 (lg:mt-1 적용)
                        rounded-full text-white text-xl lg:text-xl font-semibold transition-colors duration-200
                        ${isSelectionValid ? 'bg-[#2376C4] hover:bg-[#1a5c9a] cursor-pointer shadow-xl' : 'bg-[#CCCCCC] cursor-not-allowed'}
                    `}
                    onClick={handleNext}
                    disabled={!isSelectionValid}
                >
                    {/* 선택 개수 표시 로직 변경 */}
                    선택 완료 ({selectedInterests.length}개)
                </button>

                <div className="flex justify-center gap-2 w-full mb-8">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#E0E0E0]" />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#E0E0E0]" />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#B0CEEA]" />  
                </div>
            </div>
        </div>
    );
};

export default Desktop4;