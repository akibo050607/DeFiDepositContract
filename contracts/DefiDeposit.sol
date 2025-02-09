// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DefiDeposit is ReentrancyGuard {
    // 用户存款信息结构体
    struct DepositInfo {
        uint256 ethBalance;      // ETH 余额
        uint256 tokenBalance;    // ERC20 代币余额
        uint256 depositTime;     // 最后存款时间
    }
    
    // 存储用户的存款信息
    mapping(address => DepositInfo) public deposits;
    
    // 年化利率（以基点表示，1% = 100）
    uint256 public constant INTEREST_RATE = 500; // 5% 年化
    uint256 public constant INTEREST_RATE_DENOMINATOR = 10000;
    
    // ERC20 代币地址
    IERC20 public token;
    
    // 事件声明
    event Deposit(address indexed user, uint256 amount, bool isEth);
    event Withdrawal(address indexed user, uint256 amount, bool isEth);
    event InterestPaid(address indexed user, uint256 amount);

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    // ETH 存款函数
    function depositETH() public payable nonReentrant {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        // 先计算之前存款的利息
        _calculateAndUpdateInterest(msg.sender);
        
        deposits[msg.sender].ethBalance += msg.value;
        deposits[msg.sender].depositTime = block.timestamp;
        
        emit Deposit(msg.sender, msg.value, true);
    }

    // ERC20 代币存款函数
    function depositToken(uint256 amount) public nonReentrant {
        require(amount > 0, "Deposit amount must be greater than 0");
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        // 先计算之前存款的利息
        _calculateAndUpdateInterest(msg.sender);
        
        deposits[msg.sender].tokenBalance += amount;
        deposits[msg.sender].depositTime = block.timestamp;
        
        emit Deposit(msg.sender, amount, false);
    }

    // ETH 提款函数
    function withdrawETH(uint256 amount) public nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        
        // 先计算利息
        _calculateAndUpdateInterest(msg.sender);
        
        require(deposits[msg.sender].ethBalance >= amount, "Insufficient ETH balance");
        
        deposits[msg.sender].ethBalance -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit Withdrawal(msg.sender, amount, true);
    }

    // ERC20 代币提款函数
    function withdrawToken(uint256 amount) public nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        
        // 先计算利息
        _calculateAndUpdateInterest(msg.sender);
        
        require(deposits[msg.sender].tokenBalance >= amount, "Insufficient token balance");
        
        deposits[msg.sender].tokenBalance -= amount;
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        
        emit Withdrawal(msg.sender, amount, false);
    }

    // 计算并更新利息的内部函数
    function _calculateAndUpdateInterest(address user) internal {
        uint256 timeElapsed = block.timestamp - deposits[user].depositTime;
        if (timeElapsed > 0 && deposits[user].ethBalance > 0) {
            // 计算 ETH 利息：本金 * 年化利率 * 时间（年）
            uint256 interest = (deposits[user].ethBalance * INTEREST_RATE * timeElapsed) 
                / (365 days * INTEREST_RATE_DENOMINATOR);
                
            if (interest > 0) {
                deposits[user].ethBalance += interest;
                emit InterestPaid(user, interest);
            }
        }
        deposits[user].depositTime = block.timestamp;
    }

    // 查询 ETH 余额（包含利息）
    function getETHBalance() public view returns (uint256) {
        if (deposits[msg.sender].depositTime == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - deposits[msg.sender].depositTime;
        uint256 interest = (deposits[msg.sender].ethBalance * INTEREST_RATE * timeElapsed) 
            / (365 days * INTEREST_RATE_DENOMINATOR);
            
        return deposits[msg.sender].ethBalance + interest;
    }

    // 查询代币余额
    function getTokenBalance() public view returns (uint256) {
        return deposits[msg.sender].tokenBalance;
    }

    // 查询合约 ETH 余额
    function getContractETHBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // 查询合约代币余额
    function getContractTokenBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }
} 