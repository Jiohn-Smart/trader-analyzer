'use client';

import React, { useEffect, useState } from 'react';
import {
    User,
    Shield,
    Zap,
    Clock,
    Target,
    TrendingUp,
    TrendingDown,
    Award,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    Activity,
    Users,
    BookOpen,
    Flame,
    Snowflake,
    Timer,
    Gauge,
    RefreshCw,
    Wallet,
    Calendar,
    Percent
} from 'lucide-react';

interface TraderProfileData {
    basic_info: {
        trading_style: string;
        risk_preference: string;
        difficulty_level: string;
    };
    performance: {
        win_rate: string;
        profit_factor: string;
        sharpe_ratio: string;
        max_drawdown: string;
    };
    trading_behavior: {
        avg_holding_time: string;
        trades_per_week: string;
        discipline_score: string;
        patience_score: string;
    };
    profile: {
        summary: string;
        strengths: string[];
        weaknesses: string[];
        suitable_for: string[];
    };
    raw?: {
        basic_stats?: any;
        risk_preference?: any;
        trading_frequency?: any;
        discipline_scores?: any;
        pnl_analysis?: any;
        trading_patterns?: any;
        summary?: any;
    };
}

interface TraderProfileProps {
    data?: TraderProfileData;
    loading?: boolean;
}

// 风格标签映射 - 使用更柔和的颜色
const styleLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    scalper: { label: '超短线', icon: <Zap className="w-4 h-4" />, color: 'text-violet-300 bg-violet-500/20 border border-violet-500/30' },
    day_trader: { label: '日内交易', icon: <Activity className="w-4 h-4" />, color: 'text-sky-300 bg-sky-500/20 border border-sky-500/30' },
    swing_trader: { label: '波段交易', icon: <TrendingUp className="w-4 h-4" />, color: 'text-teal-300 bg-teal-500/20 border border-teal-500/30' },
    position_trader: { label: '趋势交易', icon: <Timer className="w-4 h-4" />, color: 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30' }
};

const riskLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    aggressive: { label: '激进型', icon: <Flame className="w-4 h-4" />, color: 'text-rose-300 bg-rose-500/20 border border-rose-500/30' },
    moderate: { label: '稳健型', icon: <Shield className="w-4 h-4" />, color: 'text-amber-300 bg-amber-500/20 border border-amber-500/30' },
    conservative: { label: '保守型', icon: <Snowflake className="w-4 h-4" />, color: 'text-sky-300 bg-sky-500/20 border border-sky-500/30' }
};

const difficultyLabels: Record<string, { label: string; color: string }> = {
    beginner: { label: '适合新手', color: 'text-emerald-400' },
    intermediate: { label: '需要一定经验', color: 'text-amber-400' },
    advanced: { label: '高级难度', color: 'text-rose-400' }
};

// Demo data
const demoData: TraderProfileData = {
    basic_info: {
        trading_style: 'swing_trader',
        risk_preference: 'moderate',
        difficulty_level: 'intermediate'
    },
    performance: {
        win_rate: '58.32%',
        profit_factor: '1.85',
        sharpe_ratio: '1.42',
        max_drawdown: '15.67%'
    },
    trading_behavior: {
        avg_holding_time: '18.5 小时',
        trades_per_week: '12.3',
        discipline_score: '72/100',
        patience_score: '68/100'
    },
    profile: {
        summary: '稳健型的波段交易者，胜率58%，盈亏比1.85，交易纪律性强，平均持仓时间约18.5小时。',
        strengths: [
            '高胜率 (58.32%)',
            '优秀的盈亏比 (1.85)',
            '优秀的交易纪律 (评分: 72/100)',
            '优秀的风险控制 (最大回撤: 15.67%)'
        ],
        weaknesses: [
            '倾向过早平仓 (评分: 68/100)',
            '交易频率偏高'
        ],
        suitable_for: [
            '风险中性的交易者',
            '波段交易者',
            '兼职交易者',
            '能严格执行止损的交易者',
            '追求高胜率高盈亏比的交易者'
        ]
    }
};

export function TraderProfile({ data, loading: externalLoading }: TraderProfileProps) {
    const [profileData, setProfileData] = useState<TraderProfileData | null>(data || null);
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!data) {
            fetchProfile();
        }
    }, [data]);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/profile');
            if (!res.ok) {
                throw new Error('Failed to fetch profile');
            }
            const profile = await res.json();
            setProfileData(profile);
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('无法加载交易员画像数据');
            setProfileData(demoData);
        } finally {
            setLoading(false);
        }
    };

    const currentData = profileData || demoData;
    const isDemoMode = !profileData?.raw;

    const style = styleLabels[currentData.basic_info.trading_style] || styleLabels.swing_trader;
    const risk = riskLabels[currentData.basic_info.risk_preference] || riskLabels.moderate;
    const difficulty = difficultyLabels[currentData.basic_info.difficulty_level] || difficultyLabels.intermediate;

    if (loading || externalLoading) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-slate-700/50">
                <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-400">正在分析交易员画像...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* 数据模式提示 */}
            {!isDemoMode && currentData.raw && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">真实数据模式 - 基于 {currentData.raw.basic_stats?.total_orders?.toLocaleString() || 0} 笔订单分析</span>
                    <button onClick={fetchProfile} className="ml-auto text-emerald-400 hover:text-emerald-300 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            )}
            {isDemoMode && (
                <div className="flex items-center gap-3 px-4 py-3 bg-sky-500/10 border border-sky-500/30 rounded-xl">
                    <BookOpen className="w-5 h-5 text-sky-400" />
                    <span className="text-sky-300 text-sm font-medium">演示模式 - 连接API后显示真实数据</span>
                </div>
            )}

            {/* 头部概览卡片 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* 左侧：头像和标签 */}
                    <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/30 to-violet-500/30 flex items-center justify-center border border-white/10 shadow-lg">
                            <User className="w-10 h-10 text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">交易员画像分析</h2>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${style.color}`}>
                                    {style.icon}
                                    {style.label}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${risk.color}`}>
                                    {risk.icon}
                                    {risk.label}
                                </span>
                            </div>
                            <p className={`text-sm font-medium ${difficulty.color}`}>
                                学习难度: {difficulty.label}
                            </p>
                        </div>
                    </div>

                    {/* 右侧：风格总结 */}
                    <div className="flex-1 bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                        <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">风格总结</div>
                        <p className="text-slate-200 leading-relaxed text-sm">
                            {currentData.profile.summary}
                        </p>
                    </div>
                </div>
            </div>

            {/* 核心绩效指标 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Target className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">胜率</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                        {currentData.performance.win_rate}
                    </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-sky-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">盈亏比</span>
                    </div>
                    <div className="text-2xl font-bold text-sky-400">
                        {currentData.performance.profit_factor}
                    </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-violet-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">夏普比率</span>
                    </div>
                    <div className="text-2xl font-bold text-violet-400">
                        {currentData.performance.sharpe_ratio}
                    </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-rose-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">最大回撤</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-400">
                        {currentData.performance.max_drawdown}
                    </div>
                </div>
            </div>

            {/* 真实数据详细统计 */}
            {currentData.raw && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Wallet className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">累计盈亏</span>
                        </div>
                        <div className={`text-2xl font-bold ${(currentData.raw.pnl_analysis?.total_pnl_btc || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {(currentData.raw.pnl_analysis?.total_pnl_btc || 0) >= 0 ? '+' : ''}{(currentData.raw.pnl_analysis?.total_pnl_btc || 0).toFixed(2)} BTC
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">交易天数</span>
                        </div>
                        <div className="text-2xl font-bold text-teal-400">
                            {(currentData.raw.trading_frequency?.total_trading_days || 0).toLocaleString()} 天
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Percent className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">限价单比例</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-400">
                            {currentData.raw.discipline_scores?.limit_order_ratio || 0}%
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">最活跃时段</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-400">
                            {currentData.raw.trading_patterns?.most_active_hour || 0}:00 UTC
                        </div>
                    </div>
                </div>
            )}

            {/* 交易行为分析 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-teal-400" />
                        交易行为指标
                    </h3>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">平均持仓时间</span>
                            <span className="text-white font-semibold">{currentData.trading_behavior.avg_holding_time}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">每周交易次数</span>
                            <span className="text-white font-semibold">{currentData.trading_behavior.trades_per_week}</span>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">交易纪律</span>
                                <span className="text-white font-semibold">{currentData.trading_behavior.discipline_score}</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: currentData.trading_behavior.discipline_score.replace('/100', '%') }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">持仓耐心</span>
                                <span className="text-white font-semibold">{currentData.trading_behavior.patience_score}</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: currentData.trading_behavior.patience_score.replace('/100', '%') }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 优势与弱点 */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        优势与弱点
                    </h3>

                    <div className="space-y-5">
                        <div>
                            <div className="text-sm text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                核心优势
                            </div>
                            <ul className="space-y-2">
                                {currentData.profile.strengths.map((strength, index) => (
                                    <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">•</span>
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border-t border-slate-700/50 pt-4">
                            <div className="text-sm text-rose-400 font-semibold mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                待改进
                            </div>
                            <ul className="space-y-2">
                                {currentData.profile.weaknesses.map((weakness, index) => (
                                    <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-rose-500 mt-0.5">•</span>
                                        {weakness}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 适合人群 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-400" />
                    适合学习人群
                </h3>

                <div className="flex flex-wrap gap-2">
                    {currentData.profile.suitable_for.map((audience, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-700/50 text-slate-200 border border-slate-600/50 rounded-lg text-sm hover:bg-slate-700 hover:border-slate-500 transition-colors"
                        >
                            <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                            {audience}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
