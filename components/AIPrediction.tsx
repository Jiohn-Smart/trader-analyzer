'use client';

import React, { useState, useEffect } from 'react';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    Minus,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    Target,
    BarChart2,
    Sparkles,
    History,
    ArrowRight,
    Activity,
    Percent
} from 'lucide-react';

interface PredictionResult {
    action: string;
    confidence: string;
    reasoning: string[];
}

interface SimilarSituation {
    timestamp: string;
    action: string;
    price: number;
    pnl: number;
    similarity: string;
    market_context: {
        rsi: string;
        price_change_24h: string;
    };
}

interface PatternStats {
    total_patterns: number;
    action_distribution: Record<string, number>;
    avg_pnl_by_action: Record<string, number>;
    date_range: {
        start: string;
        end: string;
    };
}

interface AIPredictionProps {
    apiEndpoint?: string;
    credentials?: {
        api_key: string;
        api_secret: string;
        exchange: string;
    };
    symbol?: string;
    currentPrice?: number;
}

export function AIPrediction({
    apiEndpoint = '/api/predict',
    credentials,
    symbol = 'BTC/USD',
    currentPrice
}: AIPredictionProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [similarSituations, setSimilarSituations] = useState<SimilarSituation[]>([]);
    const [patternStats, setPatternStats] = useState<PatternStats | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchPrediction = async () => {
        if (!credentials?.api_key) {
            setError('请先配置API密钥');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credentials,
                    symbol,
                    current_price: currentPrice
                }),
            });

            if (!response.ok) {
                throw new Error('预测请求失败');
            }

            const data = await response.json();
            setPrediction(data.prediction);
            setSimilarSituations(data.similar_situations || []);
            setPatternStats(data.pattern_stats || null);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : '预测失败');
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action?.toLowerCase()) {
            case 'buy':
                return <TrendingUp className="w-6 h-6" />;
            case 'sell':
                return <TrendingDown className="w-6 h-6" />;
            default:
                return <Minus className="w-6 h-6" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action?.toLowerCase()) {
            case 'buy':
                return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
            case 'sell':
                return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
            default:
                return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
        }
    };

    const getActionLabel = (action: string) => {
        switch (action?.toLowerCase()) {
            case 'buy':
                return '买入';
            case 'sell':
                return '卖出';
            default:
                return '观望';
        }
    };

    // Demo mode with simulated prediction
    const loadDemoPrediction = () => {
        setPrediction({
            action: 'buy',
            confidence: '72.5%',
            reasoning: [
                'RSI处于超卖区域 (28.5)',
                '24小时价格下跌 -3.25%',
                '在10个相似历史情况中，7次采取了buy操作',
                '平均相似度: 85.2%',
                '历史相似操作盈利率: 71.4%'
            ]
        });
        setSimilarSituations([
            {
                timestamp: '2024-10-15 14:30',
                action: 'buy',
                price: 62500,
                pnl: 1250.5,
                similarity: '92.3%',
                market_context: { rsi: '27.8', price_change_24h: '-4.12%' }
            },
            {
                timestamp: '2024-09-22 09:15',
                action: 'buy',
                price: 58900,
                pnl: 890.2,
                similarity: '88.7%',
                market_context: { rsi: '31.2', price_change_24h: '-2.85%' }
            },
            {
                timestamp: '2024-08-18 16:45',
                action: 'buy',
                price: 55200,
                pnl: -320.8,
                similarity: '85.1%',
                market_context: { rsi: '29.5', price_change_24h: '-3.67%' }
            }
        ]);
        setPatternStats({
            total_patterns: 156,
            action_distribution: { buy: 78, sell: 65, hold: 13 },
            avg_pnl_by_action: { buy: 456.32, sell: 312.18, hold: -45.67 },
            date_range: { start: '2024-01-15', end: '2024-11-20' }
        });
        setLastUpdated(new Date());
    };

    return (
        <div className="space-y-6">
            {/* 标题和刷新按钮 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/30 to-sky-500/30 border border-violet-500/30">
                            <Brain className="w-7 h-7 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">AI 操作预测</h3>
                            <p className="text-sm text-slate-400">
                                基于交易员历史模式的智能预测
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadDemoPrediction}
                            className="px-4 py-2 text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-600/50"
                        >
                            演示模式
                        </button>
                        <button
                            onClick={fetchPrediction}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-xl transition-colors disabled:opacity-50 border border-violet-500/30"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? '分析中...' : '获取预测'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 错误提示 */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <p className="text-sm text-rose-300">{error}</p>
                </div>
            )}

            {/* 预测结果 */}
            {prediction && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 主要预测 */}
                    <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    预测操作
                                </div>
                                <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border ${getActionColor(prediction.action)}`}>
                                    {getActionIcon(prediction.action)}
                                    <span className="text-2xl font-bold">{getActionLabel(prediction.action)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-slate-400 mb-2 flex items-center gap-2 justify-end">
                                    <Percent className="w-4 h-4" />
                                    置信度
                                </div>
                                <div className="text-4xl font-bold text-sky-400">{prediction.confidence}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                预测理由
                            </div>
                            <ul className="space-y-3 bg-slate-900/30 rounded-xl p-4">
                                {prediction.reasoning.map((reason, index) => (
                                    <li key={index} className="flex items-start gap-3 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-300">{reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {lastUpdated && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                更新于 {lastUpdated.toLocaleTimeString('zh-CN')}
                            </div>
                        )}
                    </div>

                    {/* 模式统计 */}
                    {patternStats && (
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-5">
                                <BarChart2 className="w-5 h-5 text-teal-400" />
                                <span className="font-semibold text-white">模式统计</span>
                            </div>

                            <div className="space-y-5">
                                <div className="bg-slate-900/30 rounded-xl p-4">
                                    <div className="text-sm text-slate-400 mb-1">学习模式数</div>
                                    <div className="text-3xl font-bold text-white">{patternStats.total_patterns}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-slate-400 mb-3">操作分布</div>
                                    <div className="space-y-3">
                                        {Object.entries(patternStats.action_distribution).map(([action, count]) => (
                                            <div key={action} className="flex items-center justify-between">
                                                <span className={`text-sm font-medium ${
                                                    action === 'buy' ? 'text-emerald-400' :
                                                    action === 'sell' ? 'text-rose-400' : 'text-amber-400'
                                                }`}>
                                                    {getActionLabel(action)}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                action === 'buy' ? 'bg-emerald-500' :
                                                                action === 'sell' ? 'bg-rose-500' : 'bg-amber-500'
                                                            }`}
                                                            style={{
                                                                width: `${(count / patternStats.total_patterns) * 100}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-white w-8">{count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-slate-400 mb-3">平均盈亏</div>
                                    <div className="space-y-2 bg-slate-900/30 rounded-xl p-3">
                                        {Object.entries(patternStats.avg_pnl_by_action).map(([action, pnl]) => (
                                            <div key={action} className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">{getActionLabel(action)}</span>
                                                <span className={`font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-xs text-slate-500 pt-3 border-t border-slate-700/50">
                                    数据范围: {patternStats.date_range.start} ~ {patternStats.date_range.end}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 相似历史情况 */}
            {similarSituations.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-5">
                        <History className="w-5 h-5 text-sky-400" />
                        <span className="font-semibold text-white">相似历史情况</span>
                        <span className="text-sm text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-lg">
                            共 {similarSituations.length} 个
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700/50">
                                    <th className="text-left py-3 px-3 text-slate-400 font-medium">时间</th>
                                    <th className="text-left py-3 px-3 text-slate-400 font-medium">操作</th>
                                    <th className="text-right py-3 px-3 text-slate-400 font-medium">价格</th>
                                    <th className="text-right py-3 px-3 text-slate-400 font-medium">盈亏</th>
                                    <th className="text-right py-3 px-3 text-slate-400 font-medium">相似度</th>
                                    <th className="text-right py-3 px-3 text-slate-400 font-medium">RSI</th>
                                    <th className="text-right py-3 px-3 text-slate-400 font-medium">24h变化</th>
                                </tr>
                            </thead>
                            <tbody>
                                {similarSituations.map((situation, index) => (
                                    <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors">
                                        <td className="py-3 px-3 text-slate-300">{situation.timestamp}</td>
                                        <td className="py-3 px-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                                                situation.action === 'buy'
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                            }`}>
                                                {situation.action === 'buy' ? (
                                                    <TrendingUp className="w-3 h-3" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3" />
                                                )}
                                                {getActionLabel(situation.action)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-white">
                                            ${situation.price.toLocaleString()}
                                        </td>
                                        <td className={`py-3 px-3 text-right font-mono font-medium ${
                                            situation.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                            {situation.pnl >= 0 ? '+' : ''}{situation.pnl.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <span className="text-sky-400 font-medium">{situation.similarity}</span>
                                        </td>
                                        <td className="py-3 px-3 text-right text-slate-400">
                                            {situation.market_context.rsi}
                                        </td>
                                        <td className={`py-3 px-3 text-right font-medium ${
                                            parseFloat(situation.market_context.price_change_24h) >= 0
                                                ? 'text-emerald-400'
                                                : 'text-rose-400'
                                        }`}>
                                            {situation.market_context.price_change_24h}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 空状态 */}
            {!prediction && !loading && !error && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-700/50">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-sky-500/20 flex items-center justify-center border border-violet-500/20">
                        <Brain className="w-10 h-10 text-violet-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">准备就绪</h4>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        点击"获取预测"按钮，AI将分析交易员历史模式并预测下一步操作
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 bg-slate-900/30 rounded-xl py-3 px-5 w-fit mx-auto">
                        <Target className="w-4 h-4 text-sky-400" />
                        <span>基于 <span className="text-sky-400 font-medium">{symbol}</span> 的历史交易数据</span>
                    </div>
                </div>
            )}
        </div>
    );
}
