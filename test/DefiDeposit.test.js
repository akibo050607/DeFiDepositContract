const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DefiDeposit", function () {
    let defiDeposit;
    let testToken;
    let owner;
    let user1;
    let user2;
    const oneEth = ethers.parseEther("1.0");
    const oneYear = 365 * 24 * 60 * 60; // 一年的秒数

    beforeEach(async function () {
        // 获取测试账号
        [owner, user1, user2] = await ethers.getSigners();

        // 部署测试代币
        const TestToken = await ethers.getContractFactory("TestToken");
        testToken = await TestToken.deploy();
        await testToken.waitForDeployment();

        // 部署 DefiDeposit 合约
        const DefiDeposit = await ethers.getContractFactory("DefiDeposit");
        defiDeposit = await DefiDeposit.deploy(await testToken.getAddress());
        await defiDeposit.waitForDeployment();

        // 给测试用户转一些代币
        await testToken.transfer(user1.address, ethers.parseEther("1000"));
        await testToken.transfer(user2.address, ethers.parseEther("1000"));
    });

    describe("ETH 存款测试", function () {
        it("应该可以正确存入 ETH", async function () {
            await defiDeposit.connect(user1).depositETH({ value: oneEth });
            
            const balance = await defiDeposit.connect(user1).getETHBalance();
            expect(balance).to.equal(oneEth);
        });

        it("存入 0 ETH 应该失败", async function () {
            await expect(
                defiDeposit.connect(user1).depositETH({ value: 0n })
            ).to.be.revertedWith("Deposit amount must be greater than 0");
        });

        it("应该可以正确计算利息", async function () {
            await defiDeposit.connect(user1).depositETH({ value: oneEth });
            
            // 模拟时间经过一年
            await time.increase(oneYear);
            
            const balance = await defiDeposit.connect(user1).getETHBalance();
            // 检查余额是否等于本金 + 5% 利息
            expect(balance).to.equal(oneEth * 105n / 100n);
        });
    });

    describe("ETH 提款测试", function () {
        beforeEach(async function () {
            // 先存入一些 ETH
            await defiDeposit.connect(user1).depositETH({ value: oneEth });
        });

        it("应该可以提取全部 ETH", async function () {
            const initialBalance = await ethers.provider.getBalance(user1.address);
            
            const tx = await defiDeposit.connect(user1).withdrawETH(oneEth);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            
            const finalBalance = await ethers.provider.getBalance(user1.address);
            
            // 考虑 gas 费用，最终余额应该接近初始余额
            expect(finalBalance + gasUsed - initialBalance).to.equal(oneEth);
        });

        it("提取超过余额的 ETH 应该失败", async function () {
            const tooMuch = oneEth * 2n;
            await expect(
                defiDeposit.connect(user1).withdrawETH(tooMuch)
            ).to.be.revertedWith("Insufficient ETH balance");
        });
    });

    describe("ERC20 代币测试", function () {
        const tokenAmount = ethers.parseEther("100");

        beforeEach(async function () {
            // 授权 DefiDeposit 合约使用代币
            await testToken.connect(user1).approve(await defiDeposit.getAddress(), tokenAmount);
        });

        it("应该可以存入代币", async function () {
            await defiDeposit.connect(user1).depositToken(tokenAmount);
            
            const balance = await defiDeposit.connect(user1).getTokenBalance();
            expect(balance).to.equal(tokenAmount);
        });

        it("应该可以提取代币", async function () {
            await defiDeposit.connect(user1).depositToken(tokenAmount);
            
            await defiDeposit.connect(user1).withdrawToken(tokenAmount);
            
            const balance = await testToken.balanceOf(user1.address);
            expect(balance).to.equal(ethers.parseEther("1000")); // 初始余额
        });

        it("未授权时存入代币应该失败", async function () {
            await expect(
                defiDeposit.connect(user2).depositToken(tokenAmount)
            ).to.be.revertedWith("ERC20: insufficient allowance");
        });
    });

    describe("合约余额查询", function () {
        it("应该正确显示合约 ETH 余额", async function () {
            await defiDeposit.connect(user1).depositETH({ value: oneEth });
            
            const contractBalance = await defiDeposit.getContractETHBalance();
            expect(contractBalance).to.equal(oneEth);
        });

        it("应该正确显示合约代币余额", async function () {
            const amount = ethers.parseEther("100");
            await testToken.connect(user1).approve(await defiDeposit.getAddress(), amount);
            await defiDeposit.connect(user1).depositToken(amount);
            
            const contractBalance = await defiDeposit.getContractTokenBalance();
            expect(contractBalance).to.equal(amount);
        });
    });
}); 