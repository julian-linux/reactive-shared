import React from 'react';
interface SharedSimpleListProps {
    items: Array<{
        name: string;
        icon: React.ElementType;
        to: string;
    }>;
    title: string;
}
export declare const SharedSimpleList: ({ items, title }: SharedSimpleListProps) => import("react/jsx-runtime").JSX.Element[];
export {};
