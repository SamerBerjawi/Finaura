import React, { useMemo } from 'react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import { Transaction, Category, SankeyNode as SankeyNodeType, SankeyLink } from '../types';
import { formatCurrency, convertToEur } from '../utils';
import SankeyNode from './SankeyNode';

interface CashflowSankeyProps {
    transactions: Transaction[];
    expenseCategories: Category[];
    income: number;
    expenses: number;
}

// Custom link component for gradients
const CustomLink = ({ sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, index, payload }: any) => {
    const path = `M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
    const gradientId = `gradient-${index}`;

    return (
        <>
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="5%" stopColor={payload.sourceColor} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={payload.targetColor} stopOpacity={0.4} />
                </linearGradient>
            </defs>
            <path
                d={path}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={linkWidth}
            />
        </>
    );
};

const findParentCategory = (categoryName: string, categories: Category[]): Category | undefined => {
    for (const cat of categories) {
        if (cat.name === categoryName) return cat; // It's a parent itself
        // FIX: Explicitly type `forEach` parameter to resolve 'unknown' type error.
        const foundInSub = cat.subCategories.find((sub: Category) => sub.name === categoryName);
        if (foundInSub) return cat;
    }
    // FIX: Corrected typo from undefiend to undefined.
    return undefined;
};

const CashflowSankey: React.FC<CashflowSankeyProps> = ({ transactions, expenseCategories, income, expenses }) => {

    const sankeyData = useMemo(() => {
        type NodeWithColor = SankeyNodeType & { color: string };
        type LinkWithColor = Omit<SankeyLink, 'color'> & { sourceColor: string; targetColor: string };

        const nodes: NodeWithColor[] = [];
        const links: LinkWithColor[] = [];

        const incomeColor = '#22C55E'; // Green
        const deficitColor = '#EF4444'; // Red
        const surplus = income - expenses;
        const cashflowColor = surplus >= 0 ? '#6366F1' : deficitColor; 

        // --- NODES ---
        nodes.push({ name: 'Income', color: incomeColor });
        nodes.push({ name: 'Cash Flow', color: cashflowColor });

        const expenseByParentCategory = transactions
            .filter(tx => tx.type === 'expense' && !tx.transferId)
            .reduce((acc, tx) => {
                const parentCat = findParentCategory(tx.category, expenseCategories);
                const categoryName = parentCat ? parentCat.name : 'Miscellaneous';
                const color = parentCat ? parentCat.color : '#A0AEC0';
                if (!acc[categoryName]) {
                    acc[categoryName] = { value: 0, color };
                }
                acc[categoryName].value += Math.abs(convertToEur(tx.amount, tx.currency));
                return acc;
            }, {} as { [key: string]: { value: number, color: string } });

        // FIX: Explicitly type sort parameters to resolve 'unknown' type errors.
        const sortedExpenses = Object.entries(expenseByParentCategory)
            .sort(([, a]: [string, any], [, b]: [string, any]) => b.value - a.value)
            .slice(0, 7);

        // FIX: Explicitly type forEach parameter to resolve 'unknown' type errors.
        sortedExpenses.forEach(([name, data]: [string, any]) => {
            nodes.push({ name, color: data.color });
        });
        
        // FIX: Explicitly type reduce parameter to resolve 'unknown' type error.
        const totalLinkedExpenses = sortedExpenses.reduce((sum, [, data]: [string, any]) => sum + data.value, 0);
        const otherExpenses = expenses - totalLinkedExpenses;
        if (otherExpenses > 1) {
            const miscIndex = nodes.findIndex(n => n.name === 'Miscellaneous');
            if (miscIndex === -1) {
                nodes.push({ name: 'Miscellaneous', color: '#A0AEC0' });
            }
        }

        if (surplus > 0) {
            nodes.push({ name: 'Surplus', color: incomeColor });
        }
        
        // --- LINKS ---
        const incomeNodeIndex = 0;
        const cashFlowNodeIndex = 1;

        // 1. Income to Cash Flow
        links.push({
            source: incomeNodeIndex,
            target: cashFlowNodeIndex,
            value: income,
            sourceColor: nodes[incomeNodeIndex].color,
            targetColor: nodes[cashFlowNodeIndex].color,
        });
        
        // 2. Cash Flow to Expenses
        // FIX: Explicitly type forEach parameter to resolve 'unknown' type errors.
        sortedExpenses.forEach(([name, data]: [string, any]) => {
            const targetIndex = nodes.findIndex(n => n.name === name);
            if (targetIndex !== -1) {
                links.push({
                    source: cashFlowNodeIndex,
                    target: targetIndex,
                    value: data.value,
                    sourceColor: nodes[cashFlowNodeIndex].color,
                    targetColor: nodes[targetIndex].color,
                });
            }
        });
        
        if (otherExpenses > 1) {
            const miscIndex = nodes.findIndex(n => n.name === 'Miscellaneous');
            if(miscIndex !== -1) {
                const existingLink = links.find(l => l.target === miscIndex);
                if (existingLink) {
                    existingLink.value += otherExpenses;
                } else {
                    links.push({
                        source: cashFlowNodeIndex,
                        target: miscIndex,
                        value: otherExpenses,
                        sourceColor: nodes[cashFlowNodeIndex].color,
                        targetColor: nodes[miscIndex].color,
                    });
                }
            }
        }

        // 3. Cash Flow to Surplus
        if (surplus > 0) {
            const surplusIndex = nodes.findIndex(n => n.name === 'Surplus');
            if (surplusIndex !== -1) {
                 links.push({
                    source: cashFlowNodeIndex,
                    target: surplusIndex,
                    value: surplus,
                    sourceColor: nodes[cashFlowNodeIndex].color,
                    targetColor: nodes[surplusIndex].color,
                });
            }
        }

        return { nodes, links };
    }, [income, expenses, transactions, expenseCategories]);

    if (income === 0 && expenses === 0) {
        return <div className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary">No data for this period.</div>
    }

    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <Sankey
                    data={sankeyData}
                    node={<SankeyNode />}
                    link={<CustomLink />}
                    nodePadding={50}
                    margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
                >
                    <Tooltip />
                </Sankey>
            </ResponsiveContainer>
        </div>
    );
};

export default CashflowSankey;