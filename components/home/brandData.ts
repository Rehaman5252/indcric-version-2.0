
import { getRandomImage } from "@/app/lib/getRandomImage";

export interface CubeBrand {
    id: number;
    brand: string;
    format: string;
    logoUrl: string;
    logoHint: string;
    description: string;
}

const brandDetails = [
    { id: 1, brand: 'Amazon', format: 'Mixed', description: 'A mix of questions from all formats of cricket.' },
    { id: 2, brand: 'Mastercard', format: 'IPL', description: 'Test your knowledge on the Indian Premier League.' },
    { id: 3, brand: 'Netflix', format: 'T20', description: 'Fast-paced questions on T20 cricket.' },
    { id: 4, brand: 'ICICI', format: 'ODI', description: 'Challenge yourself with One Day International facts.' },
    { id: 5, brand: 'Gucci', format: 'WPL', description: "Questions about the Women's Premier League." },
    { id: 6, brand: 'Nike', format: 'Test', description: 'Put your classic cricket knowledge to the test.' },
];

export const brandData: CubeBrand[] = brandDetails.map((detail) => {
    const logoData = {
        'Amazon': { src: "/Indcric.png", hint: 'Indcric' },
        'Mastercard': { src: "/Indcric.png", hint: 'Indcric' },
        'Netflix': { src: "/Indcric.png", hint: 'Indcric' },
        'ICICI': { src: "/Indcric.png", hint: 'Indcric' },
        'Gucci': { src: "/Indcric.png", hint: 'Indcric' },
        'Nike': { src: "/Indcric.png", hint: 'Indcric' },
    };
    
    const logoInfo = logoData[detail.brand as keyof typeof logoData] || { src: '', hint: '' };

    return {
        ...detail,
        logoUrl: logoInfo.src,
        logoHint: logoInfo.hint,
    };
});
