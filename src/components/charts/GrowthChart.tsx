'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Evaluation } from '@/types/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GrowthChartProps {
    evaluations: Evaluation[];
}

export function GrowthChart({ evaluations }: GrowthChartProps) {
    if (evaluations.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Growth Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No evaluation data to display yet
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Sort chronologically and map to chart data
    const chartData = [...evaluations]
        .sort((a, b) => new Date(a.evaluated_at).getTime() - new Date(b.evaluated_at).getTime())
        .map((evaluation, index) => ({
            name: `Eval ${index + 1}`,
            date: new Date(evaluation.evaluated_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            }),
            'Code Quality': evaluation.code_quality,
            Architecture: evaluation.architecture,
            'Problem Solving': evaluation.problem_solving,
            Communication: evaluation.communication,
            Teamwork: evaluation.teamwork,
            Reliability: evaluation.reliability,
            Average: Number(evaluation.average_score.toFixed(1)),
        }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Growth Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 5]}
                            ticks={[0, 1, 2, 3, 4, 5]}
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line
                            type="monotone"
                            dataKey="Average"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            dot={{ r: 5, fill: 'hsl(var(--primary))' }}
                            activeDot={{ r: 7 }}
                        />
                        <Line type="monotone" dataKey="Code Quality" stroke="#6366f1" strokeWidth={1.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Architecture" stroke="#8b5cf6" strokeWidth={1.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Problem Solving" stroke="#ec4899" strokeWidth={1.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Communication" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Teamwork" stroke="#10b981" strokeWidth={1.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Reliability" stroke="#06b6d4" strokeWidth={1.5} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
