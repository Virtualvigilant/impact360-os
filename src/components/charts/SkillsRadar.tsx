'use client';

import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { Evaluation } from '@/types/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkillsRadarProps {
    evaluations: Evaluation[];
}

export function SkillsRadar({ evaluations }: SkillsRadarProps) {
    if (evaluations.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Skills Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No evaluation data to display yet
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Average each skill across all evaluations
    const avg = (key: keyof Evaluation) =>
        Number((evaluations.reduce((s, e) => s + (e[key] as number), 0) / evaluations.length).toFixed(1));

    const radarData = [
        { skill: 'Code Quality', value: avg('code_quality'), fullMark: 5 },
        { skill: 'Architecture', value: avg('architecture'), fullMark: 5 },
        { skill: 'Problem Solving', value: avg('problem_solving'), fullMark: 5 },
        { skill: 'Communication', value: avg('communication'), fullMark: 5 },
        { skill: 'Teamwork', value: avg('teamwork'), fullMark: 5 },
        { skill: 'Reliability', value: avg('reliability'), fullMark: 5 },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Skills Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarData} outerRadius="75%">
                        <PolarGrid className="opacity-30" />
                        <PolarAngleAxis
                            dataKey="skill"
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <PolarRadiusAxis
                            domain={[0, 5]}
                            tickCount={6}
                            tick={{ fontSize: 10 }}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                        />
                        <Radar
                            name="Average Score"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.25}
                            strokeWidth={2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
