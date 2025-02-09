const hre = require("hardhat");

async function main() {
  console.log("开始部署到 Sepolia 测试网...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(balance), "ETH");

  // 部署测试代币
  console.log("正在部署 TestToken...");
  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy();
  await testToken.waitForDeployment();
  const testTokenAddress = await testToken.getAddress();
  console.log("TestToken 已部署到:", testTokenAddress);

  // 部署 DeFi 存款合约
  console.log("正在部署 DefiDeposit...");
  const DefiDeposit = await hre.ethers.getContractFactory("DefiDeposit");
  const defiDeposit = await DefiDeposit.deploy(testTokenAddress);
  await defiDeposit.waitForDeployment();
  const defiDepositAddress = await defiDeposit.getAddress();
  console.log("DefiDeposit 已部署到:", defiDepositAddress);

  console.log("部署完成！");
  console.log("合约地址:");
  console.log("- TestToken:", testTokenAddress);
  console.log("- DefiDeposit:", defiDepositAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 