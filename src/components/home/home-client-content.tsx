'use client';

import React, { memo } from 'react';

import { CubeBrand } from '@/src/components/hooks/use-brand-ads';

interface HomeClientContentProps {
    brands: CubeBrand[];
    selectedBrand: CubeBrand | null;
    setSelectedBrand: (brand: CubeBrand) => void;
    handleStartQuiz: (brand: CubeBrand) => void;
}

function HomeClientContent({ brands, selectedBrand, setSelectedBrand, handleStartQuiz }: HomeClientContentProps) {
    return (
       <div></div>
    );
}

export default memo(HomeClientContent);