# 交易员扮演法分析器 (Trader Role-Play Analyzer)

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

通过扮演优秀交易员来学习交易策略的智能分析平台。

## 独家功能

### 1. 扮演学习模式 (Role-Play Learning)
- 在不知道交易员操作的情况下，根据市场情境猜测交易员的下一步
- 实时评分系统，记录你的判断准确率
- 提供交易员思路提示，帮助理解决策逻辑
- 自动播放模式，可调节播放速度

### 2. AI 操作预测
- 基于交易员历史模式的智能预测
- 展示相似历史情况及其结果
- 模式统计分析，包括操作分布和平均盈亏
- 预测置信度和详细理由

### 3. 交易员画像分析
- 风险偏好评估（激进/稳健/保守）
- 交易频率类型（超短线/日内/波段/趋势）
- 交易纪律和耐心评分
- 适合学习人群匹配
- 核心优势和待改进点

### 4. 完整数据可视化
- 📊 多周期K线图 (1m ~ 1w)
- 🎯 交易标记在图表上实时展示
- 📈 仓位历史追踪
- 💰 权益曲线和月度PnL分析

## 技术栈

- **前端**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **图表**: Lightweight Charts, Recharts
- **后端**: Python FastAPI (独立服务)
- **交易所**: Bitmex API (使用ccxt)

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动后端服务

```bash
cd ../backend
pip install -r requirements.txt
python main.py
# 后端运行在 http://localhost:8000
```

### 3. 启动前端

```bash
cd ../frontend
npm run dev
# 前端运行在 http://localhost:3000
```

### 4. 配置环境变量 (可选)

创建 `.env.local` 文件：

```
BACKEND_URL=http://localhost:8000
```

## 项目结构

```
frontend/
├── app/
│   ├── api/
│   │   ├── backend/          # 后端API代理
│   │   │   ├── test/         # 连接测试
│   │   │   ├── predict/      # AI预测
│   │   │   └── profile/      # 画像分析
│   │   ├── trades/           # 交易数据
│   │   └── ohlcv/            # K线数据
│   └── page.tsx
├── components/
│   ├── Dashboard.tsx         # 主仪表板
│   ├── TraderRolePlay.tsx    # 扮演学习模式
│   ├── AIPrediction.tsx      # AI预测面板
│   ├── TraderProfile.tsx     # 交易员画像
│   ├── TVChart.tsx           # K线图表
│   ├── StatsOverview.tsx     # 统计概览
│   ├── EquityCurve.tsx       # 权益曲线
│   ├── MonthlyPnLChart.tsx   # 月度PnL
│   └── ...
└── lib/
    ├── types.ts              # 类型定义
    └── data_loader.ts        # 数据加载
```

## 数据文件

> **注意**: 本项目需要交易数据才能运行

### 必需的数据文件

#### 1. 交易数据（根目录）

```
frontend/
├── bitmex_executions.csv      # 成交执行记录（必需）
├── bitmex_trades.csv          # 交易记录
├── bitmex_orders.csv          # 订单历史
├── bitmex_wallet_history.csv  # 钱包历史
└── bitmex_account_summary.json # 账户摘要
```

#### 2. K线数据（data/ohlcv 目录）

```
frontend/data/ohlcv/
├── XBTUSD_1m.csv      # BTC 1分钟 K 线
├── XBTUSD_5m.csv      # BTC 5分钟 K 线
├── XBTUSD_1h.csv      # BTC 1小时 K 线
├── XBTUSD_1d.csv      # BTC 日线
├── ETHUSD_1m.csv      # ETH 1分钟 K 线
└── ...
```

## 使用方法

1. **配置API**: 点击右上角"配置API"，输入交易所只读API密钥
2. **数据概览**: 查看整体交易统计、权益曲线、月度盈亏
3. **扮演学习**: 在不知道答案的情况下猜测交易员的操作
4. **AI预测**: 获取基于历史模式的下一步操作预测
5. **交易员画像**: 深入了解交易员的风格和特点
6. **仓位历史**: 查看每个仓位的详细信息

## 安全说明

- 仅使用**只读API密钥**，无法进行交易操作
- API密钥在本地处理，不会上传到服务器
- 所有数据传输使用HTTPS加密

## 许可证

MIT License
