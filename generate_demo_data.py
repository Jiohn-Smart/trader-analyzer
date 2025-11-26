#!/usr/bin/env python3
"""
生成演示用的交易数据
"""
import csv
import json
import random
from datetime import datetime, timedelta
import os

# 设置随机种子以保证可重复性
random.seed(42)

def generate_ohlcv_data(symbol, timeframe, days=365):
    """生成K线数据"""
    data = []

    # 根据时间周期确定K线数量
    if timeframe == '1m':
        bars_per_day = 1440
    elif timeframe == '5m':
        bars_per_day = 288
    elif timeframe == '1h':
        bars_per_day = 24
    elif timeframe == '1d':
        bars_per_day = 1
    else:
        bars_per_day = 24

    total_bars = days * bars_per_day

    # 起始价格
    if 'BTC' in symbol or 'XBT' in symbol:
        price = 30000
    else:
        price = 2000

    start_time = datetime.now() - timedelta(days=days)

    for i in range(total_bars):
        if timeframe == '1m':
            timestamp = start_time + timedelta(minutes=i)
        elif timeframe == '5m':
            timestamp = start_time + timedelta(minutes=i*5)
        elif timeframe == '1h':
            timestamp = start_time + timedelta(hours=i)
        elif timeframe == '1d':
            timestamp = start_time + timedelta(days=i)
        else:
            timestamp = start_time + timedelta(hours=i)

        # 生成价格波动
        change = random.gauss(0, 0.002) * price
        price = max(price + change, price * 0.5)

        open_price = price
        high_price = price * (1 + random.uniform(0, 0.02))
        low_price = price * (1 - random.uniform(0, 0.02))
        close_price = price * (1 + random.gauss(0, 0.01))
        volume = random.uniform(100, 10000)

        data.append({
            'timestamp': timestamp.isoformat(),
            'open': round(open_price, 2),
            'high': round(high_price, 2),
            'low': round(low_price, 2),
            'close': round(close_price, 2),
            'volume': round(volume, 2)
        })

        price = close_price

    return data

def generate_executions(days=180):
    """生成成交记录"""
    executions = []

    start_time = datetime.now() - timedelta(days=days)
    exec_id = 1000000
    order_id = 2000000

    price = 45000

    for day in range(days):
        # 每天生成随机数量的交易
        trades_today = random.randint(0, 8)

        for _ in range(trades_today):
            timestamp = start_time + timedelta(days=day, hours=random.randint(0, 23), minutes=random.randint(0, 59))

            side = random.choice(['Buy', 'Sell'])
            qty = random.choice([100, 500, 1000, 2000, 5000, 10000])

            # 价格随机波动
            price = price * (1 + random.gauss(0, 0.02))
            exec_price = round(price, 1)

            exec_cost = qty * exec_price / 100000000  # 转换为BTC
            exec_comm = exec_cost * 0.00075  # 0.075% 手续费

            executions.append({
                'execID': f'exec-{exec_id}',
                'orderID': f'order-{order_id}',
                'symbol': 'XBTUSD',
                'side': side,
                'lastQty': qty,
                'lastPx': exec_price,
                'execType': 'Trade',
                'ordType': random.choice(['Limit', 'Market']),
                'ordStatus': 'Filled',
                'execCost': round(exec_cost * 100000000),
                'execComm': round(exec_comm * 100000000),
                'timestamp': timestamp.isoformat(),
                'text': ''
            })

            exec_id += 1
            if random.random() > 0.7:
                order_id += 1

    return executions

def generate_wallet_history(days=180):
    """生成钱包历史"""
    history = []

    start_time = datetime.now() - timedelta(days=days)
    balance = 1.0  # 起始1 BTC

    for day in range(days):
        timestamp = start_time + timedelta(days=day)

        # 随机盈亏
        pnl = random.gauss(0.001, 0.005)
        balance += pnl

        history.append({
            'transactID': f'trans-{day}',
            'account': 123456,
            'currency': 'XBt',
            'transactType': 'RealisedPNL',
            'amount': round(pnl * 100000000),
            'fee': 0,
            'transactStatus': 'Completed',
            'address': '',
            'tx': '',
            'text': '',
            'timestamp': timestamp.isoformat(),
            'walletBalance': round(balance * 100000000),
            'marginBalance': round(balance * 100000000)
        })

        # 偶尔添加资金费率
        if random.random() > 0.7:
            funding = random.gauss(0, 0.0001) * balance
            history.append({
                'transactID': f'fund-{day}',
                'account': 123456,
                'currency': 'XBt',
                'transactType': 'Funding',
                'amount': round(funding * 100000000),
                'fee': 0,
                'transactStatus': 'Completed',
                'address': '',
                'tx': '',
                'text': 'Funding',
                'timestamp': timestamp.isoformat(),
                'walletBalance': round(balance * 100000000),
                'marginBalance': round(balance * 100000000)
            })

    return history

def generate_account_summary():
    """生成账户摘要"""
    return {
        'exportDate': datetime.now().isoformat(),
        'user': {
            'id': 123456,
            'username': 'demo_trader',
            'email': 'demo@example.com'
        },
        'wallet': {
            'walletBalance': 150000000,  # 1.5 BTC in satoshis
            'marginBalance': 155000000,
            'availableMargin': 120000000,
            'unrealisedPnl': 5000000,
            'realisedPnl': 25000000
        },
        'positions': []
    }

def save_csv(data, filename, fieldnames):
    """保存CSV文件"""
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    print(f'✓ 已生成: {filename} ({len(data)} 条记录)')

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ohlcv_dir = os.path.join(base_dir, 'data', 'ohlcv')
    os.makedirs(ohlcv_dir, exist_ok=True)

    print('正在生成演示数据...\n')

    # 生成K线数据
    for symbol in ['XBTUSD', 'ETHUSD']:
        for tf in ['1d', '1h', '5m']:
            days = 365 if tf == '1d' else (90 if tf == '1h' else 30)
            data = generate_ohlcv_data(symbol, tf, days)
            filename = os.path.join(ohlcv_dir, f'{symbol}_{tf}.csv')
            save_csv(data, filename, ['timestamp', 'open', 'high', 'low', 'close', 'volume'])

    # 生成成交记录
    executions = generate_executions(180)
    save_csv(executions, os.path.join(base_dir, 'bitmex_executions.csv'),
             ['execID', 'orderID', 'symbol', 'side', 'lastQty', 'lastPx', 'execType',
              'ordType', 'ordStatus', 'execCost', 'execComm', 'timestamp', 'text'])

    # 生成钱包历史
    wallet_history = generate_wallet_history(180)
    save_csv(wallet_history, os.path.join(base_dir, 'bitmex_wallet_history.csv'),
             ['transactID', 'account', 'currency', 'transactType', 'amount', 'fee',
              'transactStatus', 'address', 'tx', 'text', 'timestamp', 'walletBalance', 'marginBalance'])

    # 生成账户摘要
    account = generate_account_summary()
    with open(os.path.join(base_dir, 'bitmex_account_summary.json'), 'w') as f:
        json.dump(account, f, indent=2)
    print(f'✓ 已生成: bitmex_account_summary.json')

    print('\n✅ 所有演示数据已生成完成!')

if __name__ == '__main__':
    main()
