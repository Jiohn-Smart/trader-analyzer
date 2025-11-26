import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const profilePath = path.join(process.cwd(), 'trader_profile_analysis.json');

        if (!fs.existsSync(profilePath)) {
            return NextResponse.json({ error: 'Profile analysis not found' }, { status: 404 });
        }

        const rawData = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

        // Transform to frontend expected format
        const profile = {
            basic_info: {
                trading_style: rawData.trading_frequency?.frequency_level?.includes('高频') ? 'day_trader' :
                    rawData.trading_frequency?.frequency_level?.includes('低频') ? 'swing_trader' : 'day_trader',
                risk_preference: rawData.risk_preference?.risk_level?.includes('高风险') ? 'aggressive' :
                    rawData.risk_preference?.risk_level?.includes('低风险') ? 'conservative' : 'moderate',
                difficulty_level: rawData.summary?.overall_score >= 7 ? 'advanced' :
                    rawData.summary?.overall_score >= 4 ? 'intermediate' : 'beginner'
            },
            performance: {
                win_rate: rawData.pnl_analysis ? `${rawData.pnl_analysis.win_rate}%` : 'N/A',
                profit_factor: rawData.pnl_analysis ? `${rawData.pnl_analysis.profit_factor}` : 'N/A',
                sharpe_ratio: 'N/A', // Not calculated in current analysis
                max_drawdown: 'N/A' // Not calculated in current analysis
            },
            trading_behavior: {
                avg_holding_time: rawData.trading_frequency ?
                    `${Math.round(rawData.trading_frequency.avg_trade_interval_minutes)} 分钟` : 'N/A',
                trades_per_week: rawData.trading_frequency ?
                    `${Math.round(rawData.trading_frequency.daily_avg_trades * 7)}` : 'N/A',
                discipline_score: rawData.discipline_scores ?
                    `${rawData.discipline_scores.discipline_score * 10}/100` : 'N/A',
                patience_score: rawData.discipline_scores ?
                    `${rawData.discipline_scores.patience_score * 10}/100` : 'N/A'
            },
            profile: {
                summary: generateSummary(rawData),
                strengths: generateStrengths(rawData),
                weaknesses: generateWeaknesses(rawData),
                suitable_for: generateSuitableFor(rawData)
            },
            // Include raw data for additional display
            raw: {
                basic_stats: rawData.basic_stats,
                risk_preference: rawData.risk_preference,
                trading_frequency: rawData.trading_frequency,
                discipline_scores: rawData.discipline_scores,
                pnl_analysis: rawData.pnl_analysis,
                trading_patterns: rawData.trading_patterns,
                summary: rawData.summary
            }
        };

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Profile API Error:', error);
        return NextResponse.json(
            { error: 'Failed to load profile', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}

function generateSummary(data: any): string {
    const style = data.summary?.trader_type || '交易者';
    const winRate = data.pnl_analysis?.win_rate || 0;
    const pf = data.pnl_analysis?.profit_factor || 0;
    const discipline = data.discipline_scores?.discipline_score || 0;
    const totalPnl = data.pnl_analysis?.total_pnl_btc || 0;

    return `${style}，胜率${winRate}%，盈亏比${pf}，纪律评分${discipline * 10}/100，` +
        `总交易${data.basic_stats?.total_orders || 0}笔订单，累计盈亏${totalPnl.toFixed(2)} BTC。`;
}

function generateStrengths(data: any): string[] {
    const strengths: string[] = [];

    if (data.discipline_scores?.limit_order_ratio > 70) {
        strengths.push(`高限价单使用率 (${data.discipline_scores.limit_order_ratio}%)`);
    }
    if (data.pnl_analysis?.profit_factor > 1.5) {
        strengths.push(`优秀的盈亏比 (${data.pnl_analysis.profit_factor})`);
    }
    if (data.discipline_scores?.discipline_score >= 7) {
        strengths.push(`高度自律 (评分: ${data.discipline_scores.discipline_score * 10}/100)`);
    }
    if (data.basic_stats?.fill_rate > 70) {
        strengths.push(`高成交率 (${data.basic_stats.fill_rate}%)`);
    }
    if (data.pnl_analysis?.total_pnl_btc > 0) {
        strengths.push(`累计盈利 (+${data.pnl_analysis.total_pnl_btc.toFixed(2)} BTC)`);
    }

    return strengths.length > 0 ? strengths : ['数据分析中...'];
}

function generateWeaknesses(data: any): string[] {
    const weaknesses: string[] = [];

    if (data.pnl_analysis?.win_rate < 50) {
        weaknesses.push(`胜率偏低 (${data.pnl_analysis.win_rate}%)`);
    }
    if (data.discipline_scores?.patience_score < 5) {
        weaknesses.push(`耐心不足 (评分: ${data.discipline_scores.patience_score * 10}/100)`);
    }
    if (data.discipline_scores?.cancel_ratio > 25) {
        weaknesses.push(`取消订单比例较高 (${data.discipline_scores.cancel_ratio}%)`);
    }
    if (data.risk_preference?.risk_score >= 8) {
        weaknesses.push(`风险偏好过高 (评分: ${data.risk_preference.risk_score}/10)`);
    }

    return weaknesses.length > 0 ? weaknesses : ['暂无明显不足'];
}

function generateSuitableFor(data: any): string[] {
    const suitable: string[] = [];

    if (data.summary?.trader_type?.includes('波段')) {
        suitable.push('波段交易学习者');
    }
    if (data.summary?.trader_type?.includes('日内')) {
        suitable.push('日内交易学习者');
    }
    if (data.discipline_scores?.discipline_score >= 7) {
        suitable.push('追求纪律性的交易者');
    }
    if (data.pnl_analysis?.profit_factor > 2) {
        suitable.push('追求高盈亏比的交易者');
    }
    if (data.risk_preference?.risk_level?.includes('高风险')) {
        suitable.push('风险承受能力强的投资者');
    }
    suitable.push('希望学习实战交易的人');

    return suitable;
}
