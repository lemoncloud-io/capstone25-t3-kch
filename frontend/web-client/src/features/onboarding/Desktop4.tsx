// src/features/onboarding/Desktop4.tsx

import React, { useState } from 'react';
import Header from './Header'; 
import { Home, BookOpen, Briefcase, TrendingUp, DollarSign, ShoppingBag, Film, Heart, Globe, Users, ChevronLeft } from 'lucide-react'; 

// =========================================================================
// 타입 정의
// =========================================================================
type IconType = typeof Briefcase; 

const INTEREST_CATEGORIES: { key: string; name: string; icon: IconType; slug: string }[] = [
    { key: 'employment_support', name: '취업 지원', icon: Briefcase, slug: 'employment' },
    { key: 'education_license', name: '교육/자격증', icon: BookOpen, slug: 'license' },
    { key: 'startup', name: '창업', icon: TrendingUp, slug: 'startup' },
    { key: 'housing', name: '주거', icon: Home, slug: 'housing' },
    { key: 'loan_finance', name: '대출/금융', icon: DollarSign, slug: 'finance' },
    { key: 'living_support', name: '생활비 지원', icon: ShoppingBag, slug: 'living' },
    { key: 'culture_leisure', name: '문화/여가', icon: Film, slug: 'culture' },
    { key: 'health_counseling', name: '건강/상담', icon: Heart, slug: 'health' },
    { key: 'overseas_opportunity', name: '해외 기회', icon: Globe, slug: 'overseas' },
    { key: 'youth_participation', name: '청년 참여', icon: Users, slug: 'participation' },
] as const;

interface Desktop4Props {
    onSelectInterests: (interests: string[]) => void;
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
// 메인 컴포넌트 (Desktop4)
// =========================================================================

const Desktop4: React.FC<Desktop4Props> = ({ onSelectInterests }) => {
    const [selectedInterest, setSelectedInterest] = useState<string | null>(null);

    const toggleInterest = (interestKey: string) => {
        setSelectedInterest(prev => (prev === interestKey ? null : interestKey));
    };

    const isSelectionValid = selectedInterest !== null;

    const handleNext = () => {
        if (isSelectionValid && selectedInterest) {
            const selectedItem = INTEREST_CATEGORIES.find(item => item.key === selectedInterest);
            const selectedSlug = selectedItem ? selectedItem.slug : null;
            
            if (selectedSlug) {
                onSelectInterests([selectedSlug]); 
            }
        }
    };

    const contentPaddingTopClass = "pt-20 pb-16 lg:pt-0 lg:pb-0"; 

    return (
        <div className="w-screen min-h-screen bg-white flex flex-col items-stretch relative font-inter">
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