#!/usr/bin/env python3
"""
交易员画像分析 - 基于真实 BitMEX 交易数据
Trader Profile Analysis - Based on Real BitMEX Trading Data
"""

import csv
import json
from datetime import datetime, timedelta
from collections import defaultdict
import os

def load_orders(filepath):
    """Load order history from CSV"""
    orders = []
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            orders.append(row)
    return orders

def load_wallet_history(filepath):
    """Load wallet history from CSV"""
    history = []
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            history.append(row)
    return history

def load_executions(filepath):
    """Load execution history from CSV"""
    executions = []
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            executions.append(row)
    return executions

def analyze_trader_profile(orders, wallet_history, executions):
    """
    Analyze trader profile based on trading data
    返回交易员画像分析结果
    """

    profile = {
        "basic_stats": {},
        "risk_preference": {},
        "trading_frequency": {},
        "discipline_scores": {},
        "trading_patterns": {},
        "summary": {}
    }

    # ========== 基础统计 ==========
    total_orders = len(orders)
    filled_orders = [o for o in orders if o.get('ordStatus') == 'Filled']
    canceled_orders = [o for o in orders if o.get('ordStatus') == 'Canceled']

    # 订单类型统计
    order_types = defaultdict(int)
    for o in orders:
        order_types[o.get('ordType', 'Unknown')] += 1

    profile["basic_stats"] = {
        "total_orders": total_orders,
        "filled_orders": len(filled_orders),
        "canceled_orders": len(canceled_orders),
        "fill_rate": round(len(filled_orders) / total_orders * 100, 2) if total_orders > 0 else 0,
        "order_types": dict(order_types)
    }

    # ========== 交易时间分析 ==========
    if filled_orders:
        timestamps = []
        for o in filled_orders:
            try:
                ts = datetime.fromisoformat(o.get('timestamp', '').replace('Z', '+00:00'))
                timestamps.append(ts)
            except:
                pass

        if timestamps:
            # 按小时分布
            hour_distribution = defaultdict(int)
            for ts in timestamps:
                hour_distribution[ts.hour] += 1

            # 按星期分布
            weekday_distribution = defaultdict(int)
            for ts in timestamps:
                weekday_distribution[ts.weekday()] += 1

            # 找出最活跃时段
            most_active_hour = max(hour_distribution, key=hour_distribution.get)
            most_active_day = max(weekday_distribution, key=weekday_distribution.get)

            profile["trading_patterns"]["hour_distribution"] = dict(hour_distribution)
            profile["trading_patterns"]["weekday_distribution"] = dict(weekday_distribution)
            profile["trading_patterns"]["most_active_hour"] = most_active_hour
            profile["trading_patterns"]["most_active_day"] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][most_active_day]

    # ========== 风险偏好分析 ==========
    # 分析订单大小
    order_sizes = []
    for o in filled_orders:
        try:
            size = abs(float(o.get('orderQty', 0)))
            if size > 0:
                order_sizes.append(size)
        except:
            pass

    if order_sizes:
        avg_order_size = sum(order_sizes) / len(order_sizes)
        max_order_size = max(order_sizes)
        min_order_size = min(order_sizes)

        # 大单比例 (>10000)
        large_orders = [s for s in order_sizes if s > 10000]
        large_order_ratio = len(large_orders) / len(order_sizes) * 100

        # 风险评分 (1-10)
        # 基于大单比例和订单大小波动
        risk_score = min(10, max(1, int(large_order_ratio / 5 + 3)))

        profile["risk_preference"] = {
            "avg_order_size": round(avg_order_size, 2),
            "max_order_size": max_order_size,
            "min_order_size": min_order_size,
            "large_order_ratio": round(large_order_ratio, 2),
            "risk_score": risk_score,
            "risk_level": "高风险" if risk_score >= 7 else "中等风险" if risk_score >= 4 else "低风险"
        }

    # ========== 交易频率分析 ==========
    if timestamps and len(timestamps) >= 2:
        # 计算交易跨度
        first_trade = min(timestamps)
        last_trade = max(timestamps)
        trading_days = (last_trade - first_trade).days or 1

        # 日均交易次数
        daily_trades = len(filled_orders) / trading_days

        # 计算交易间隔
        sorted_ts = sorted(timestamps)
        intervals = []
        for i in range(1, len(sorted_ts)):
            interval = (sorted_ts[i] - sorted_ts[i-1]).total_seconds() / 60  # 分钟
            if interval > 0 and interval < 60 * 24 * 7:  # 排除异常值
                intervals.append(interval)

        avg_interval = sum(intervals) / len(intervals) if intervals else 0

        # 频率评分
        frequency_score = min(10, max(1, int(daily_trades / 5)))

        profile["trading_frequency"] = {
            "total_trading_days": trading_days,
            "daily_avg_trades": round(daily_trades, 2),
            "avg_trade_interval_minutes": round(avg_interval, 2),
            "frequency_score": frequency_score,
            "frequency_level": "高频交易者" if frequency_score >= 7 else "中频交易者" if frequency_score >= 4 else "低频交易者"
        }

    # ========== 纪律性评分 ==========
    # 基于限价单/市价单比例
    limit_orders = order_types.get('Limit', 0)
    market_orders = order_types.get('Market', 0)
    total_lm = limit_orders + market_orders

    limit_ratio = limit_orders / total_lm * 100 if total_lm > 0 else 0

    # 纪律性评分 - 限价单比例越高越有纪律
    discipline_score = min(10, max(1, int(limit_ratio / 10)))

    # 耐心分数 - 基于取消订单比例 (取消少=更有耐心)
    cancel_ratio = len(canceled_orders) / total_orders * 100 if total_orders > 0 else 0
    patience_score = min(10, max(1, int(10 - cancel_ratio / 5)))

    profile["discipline_scores"] = {
        "limit_order_ratio": round(limit_ratio, 2),
        "cancel_ratio": round(cancel_ratio, 2),
        "discipline_score": discipline_score,
        "patience_score": patience_score,
        "discipline_level": "高度自律" if discipline_score >= 7 else "中等自律" if discipline_score >= 4 else "需要改进",
        "patience_level": "非常耐心" if patience_score >= 7 else "中等耐心" if patience_score >= 4 else "较为冲动"
    }

    # ========== 盈亏分析 (从钱包历史) ==========
    pnl_entries = [w for w in wallet_history if w.get('transactType') == 'RealisedPNL']

    if pnl_entries:
        pnl_amounts = []
        for entry in pnl_entries:
            try:
                amount = float(entry.get('amount', 0)) / 100000000  # Convert satoshis to BTC
                pnl_amounts.append(amount)
            except:
                pass

        if pnl_amounts:
            total_pnl = sum(pnl_amounts)
            winning_trades = [p for p in pnl_amounts if p > 0]
            losing_trades = [p for p in pnl_amounts if p < 0]

            win_rate = len(winning_trades) / len(pnl_amounts) * 100 if pnl_amounts else 0
            avg_win = sum(winning_trades) / len(winning_trades) if winning_trades else 0
            avg_loss = abs(sum(losing_trades) / len(losing_trades)) if losing_trades else 0

            # 盈亏比
            profit_factor = avg_win / avg_loss if avg_loss > 0 else float('inf')

            profile["pnl_analysis"] = {
                "total_pnl_btc": round(total_pnl, 8),
                "total_trades": len(pnl_amounts),
                "winning_trades": len(winning_trades),
                "losing_trades": len(losing_trades),
                "win_rate": round(win_rate, 2),
                "avg_win_btc": round(avg_win, 8),
                "avg_loss_btc": round(avg_loss, 8),
                "profit_factor": round(profit_factor, 2) if profit_factor != float('inf') else "∞"
            }

    # ========== 总结 ==========
    risk_level = profile.get("risk_preference", {}).get("risk_level", "未知")
    freq_level = profile.get("trading_frequency", {}).get("frequency_level", "未知")
    discipline_level = profile.get("discipline_scores", {}).get("discipline_level", "未知")

    trader_type = "未知"
    if "高频" in freq_level and "高风险" in risk_level:
        trader_type = "激进型日内交易者"
    elif "高频" in freq_level and "低风险" in risk_level:
        trader_type = "稳健型日内交易者"
    elif "低频" in freq_level and "高风险" in risk_level:
        trader_type = "大胆型波段交易者"
    elif "低频" in freq_level and "低风险" in risk_level:
        trader_type = "保守型价值投资者"
    elif "中频" in freq_level:
        trader_type = "均衡型短线交易者"
    else:
        trader_type = "综合型交易者"

    profile["summary"] = {
        "trader_type": trader_type,
        "risk_level": risk_level,
        "frequency_level": freq_level,
        "discipline_level": discipline_level,
        "overall_score": round(
            (profile.get("risk_preference", {}).get("risk_score", 5) +
             profile.get("trading_frequency", {}).get("frequency_score", 5) +
             profile.get("discipline_scores", {}).get("discipline_score", 5) +
             profile.get("discipline_scores", {}).get("patience_score", 5)) / 4,
            1
        ),
        "advice": [
            "继续保持限价单交易习惯，提高执行效率" if limit_ratio > 70 else "建议增加限价单使用，降低滑点成本",
            "交易节奏稳定，保持当前策略" if daily_trades < 50 else "考虑降低交易频率，提高每笔交易质量",
            "风险控制良好" if profile.get("risk_preference", {}).get("risk_score", 5) < 5 else "注意控制仓位大小，分散风险"
        ]
    }

    return profile


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    print("═" * 60)
    print("        交易员画像分析 / Trader Profile Analysis")
    print("═" * 60)
    print()

    # Load data
    orders_file = os.path.join(base_dir, 'bitmex_orders.csv')
    wallet_file = os.path.join(base_dir, 'bitmex_wallet_history.csv')
    executions_file = os.path.join(base_dir, 'bitmex_executions.csv')

    print("Loading data...")
    orders = load_orders(orders_file) if os.path.exists(orders_file) else []
    wallet_history = load_wallet_history(wallet_file) if os.path.exists(wallet_file) else []
    executions = load_executions(executions_file) if os.path.exists(executions_file) else []

    print(f"  Orders: {len(orders)}")
    print(f"  Wallet History: {len(wallet_history)}")
    print(f"  Executions: {len(executions)}")
    print()

    # Analyze
    print("Analyzing trader profile...")
    profile = analyze_trader_profile(orders, wallet_history, executions)

    # Print results
    print()
    print("═" * 60)
    print("                 分析结果 / Analysis Results")
    print("═" * 60)

    print("\n📊 基础统计 / Basic Statistics")
    print("─" * 40)
    bs = profile["basic_stats"]
    print(f"  总订单数: {bs['total_orders']}")
    print(f"  成交订单: {bs['filled_orders']}")
    print(f"  取消订单: {bs['canceled_orders']}")
    print(f"  成交率: {bs['fill_rate']}%")
    print(f"  订单类型: {bs['order_types']}")

    print("\n🎯 风险偏好 / Risk Preference")
    print("─" * 40)
    rp = profile.get("risk_preference", {})
    print(f"  平均订单大小: {rp.get('avg_order_size', 'N/A')} USD")
    print(f"  最大订单: {rp.get('max_order_size', 'N/A')} USD")
    print(f"  大单比例: {rp.get('large_order_ratio', 'N/A')}%")
    print(f"  风险评分: {rp.get('risk_score', 'N/A')}/10")
    print(f"  风险级别: {rp.get('risk_level', 'N/A')}")

    print("\n⏱️ 交易频率 / Trading Frequency")
    print("─" * 40)
    tf = profile.get("trading_frequency", {})
    print(f"  交易天数: {tf.get('total_trading_days', 'N/A')} 天")
    print(f"  日均交易: {tf.get('daily_avg_trades', 'N/A')} 笔")
    print(f"  平均间隔: {tf.get('avg_trade_interval_minutes', 'N/A')} 分钟")
    print(f"  频率评分: {tf.get('frequency_score', 'N/A')}/10")
    print(f"  频率级别: {tf.get('frequency_level', 'N/A')}")

    print("\n🧠 纪律性评估 / Discipline Assessment")
    print("─" * 40)
    ds = profile.get("discipline_scores", {})
    print(f"  限价单比例: {ds.get('limit_order_ratio', 'N/A')}%")
    print(f"  取消比例: {ds.get('cancel_ratio', 'N/A')}%")
    print(f"  纪律评分: {ds.get('discipline_score', 'N/A')}/10")
    print(f"  耐心评分: {ds.get('patience_score', 'N/A')}/10")
    print(f"  纪律级别: {ds.get('discipline_level', 'N/A')}")
    print(f"  耐心级别: {ds.get('patience_level', 'N/A')}")

    if "pnl_analysis" in profile:
        print("\n💰 盈亏分析 / PnL Analysis")
        print("─" * 40)
        pnl = profile["pnl_analysis"]
        print(f"  总盈亏: {pnl['total_pnl_btc']} BTC")
        print(f"  总交易次数: {pnl['total_trades']}")
        print(f"  盈利次数: {pnl['winning_trades']}")
        print(f"  亏损次数: {pnl['losing_trades']}")
        print(f"  胜率: {pnl['win_rate']}%")
        print(f"  平均盈利: {pnl['avg_win_btc']} BTC")
        print(f"  平均亏损: {pnl['avg_loss_btc']} BTC")
        print(f"  盈亏比: {pnl['profit_factor']}")

    print("\n📋 交易模式 / Trading Patterns")
    print("─" * 40)
    tp = profile.get("trading_patterns", {})
    print(f"  最活跃时段: {tp.get('most_active_hour', 'N/A')}:00 UTC")
    print(f"  最活跃日: {tp.get('most_active_day', 'N/A')}")

    print("\n🏆 综合评价 / Summary")
    print("─" * 40)
    summary = profile["summary"]
    print(f"  交易者类型: {summary['trader_type']}")
    print(f"  综合评分: {summary['overall_score']}/10")
    print(f"  风险级别: {summary['risk_level']}")
    print(f"  频率级别: {summary['frequency_level']}")
    print(f"  纪律级别: {summary['discipline_level']}")

    print("\n💡 建议 / Advice")
    print("─" * 40)
    for i, advice in enumerate(summary['advice'], 1):
        print(f"  {i}. {advice}")

    print()
    print("═" * 60)

    # Save to JSON
    output_file = os.path.join(base_dir, 'trader_profile_analysis.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)
    print(f"\n✅ 分析结果已保存至: {output_file}")


if __name__ == '__main__':
    main()
