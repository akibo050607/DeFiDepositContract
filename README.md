# DeFi 存款合约

这是一个基于以太坊的去中心化存款合约，支持 ETH 和 ERC20 代币存取，并提供年化收益率计算功能。

## 功能特性

- ETH 存取功能
- ERC20 代币存取功能
- 5% 年化收益率
- 实时利息计算
- 防重入保护
- 完整的事件日志

## 技术栈

- Solidity ^0.8.0
- Hardhat
- OpenZeppelin Contracts
- Ethers.js
- Ganache (本地测试)

## 开始使用

### 前置要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装

1. 克隆仓库

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

```bash
cp .env.example .env
```

### 单元测试
```bash
npm run test
```

### 本地测试

```bash
npm run ganache:start
npm run ganache:deploy
```

### 部署到 Sepolia 测试网

```bash
npm run sepolia:deploy
```


## 主要功能说明

### ETH 操作
- `depositETH()`: 存入 ETH
- `withdrawETH(uint256 amount)`: 提取指定数量的 ETH

### ERC20 代币操作
- `depositToken(uint256 amount)`: 存入代币
- `withdrawToken(uint256 amount)`: 提取代币

### 余额查询
- `getETHBalance()`: 查询 ETH 余额（包含利息）
- `getTokenBalance()`: 查询代币余额
- `getContractETHBalance()`: 查询合约 ETH 余额
- `getContractTokenBalance()`: 查询合约代币余额

## 安全性

- 使用 OpenZeppelin 的 ReentrancyGuard 防止重入攻击
- 所有数学计算使用 SafeMath（Solidity 0.8.0 内置）
- 完整的测试覆盖率

## 许可证

本项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
