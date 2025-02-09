const hre = require("hardhat");

async function main() {
  console.log("开始部署合约...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(balance), "ETH");

  // 部署测试代币
  console.log("正在部署 TestToken...");
  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy();
  await testToken.waitForDeployment();
  console.log("TestToken 已部署到:", await testToken.getAddress());

  // 部署 DeFi 存款合约
  console.log("正在部署 DefiDeposit...");
  const DefiDeposit = await hre.ethers.getContractFactory("DefiDeposit");
  const defiDeposit = await DefiDeposit.deploy(await testToken.getAddress());
  await defiDeposit.waitForDeployment();
  console.log("DefiDeposit 已部署到:", await defiDeposit.getAddress());

  // 转一些测试代币给部署者
  console.log("转移代币到部署者账户...");
  const amount = hre.ethers.parseEther("1000");
  const tx = await testToken.transfer(deployer.address, amount);
  await tx.wait();
  console.log("已转移", hre.ethers.formatEther(amount), "代币到部署者账户");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 