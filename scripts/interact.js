const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // 获取已部署的合约地址（需要替换为实际部署后的地址）
  const DEFI_DEPOSIT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const TEST_TOKEN_ADDRESS = "YOUR_DEPLOYED_TOKEN_ADDRESS";
  
  // 连接到合约
  const defiDeposit = await hre.ethers.getContractAt("DefiDeposit", DEFI_DEPOSIT_ADDRESS);
  const testToken = await hre.ethers.getContractAt("TestToken", TEST_TOKEN_ADDRESS);

  // 存入 1 ETH
  const oneEth = hre.ethers.parseEther("1.0");
  console.log("Depositing 1 ETH...");
  await defiDeposit.depositETH({ value: oneEth });

  // 查询 ETH 余额
  const ethBalance = await defiDeposit.getETHBalance();
  console.log("ETH Balance:", hre.ethers.formatEther(ethBalance));

  // 授权并存入代币
  const tokenAmount = hre.ethers.parseEther("100");
  console.log("Approving tokens...");
  await testToken.approve(DEFI_DEPOSIT_ADDRESS, tokenAmount);
  
  console.log("Depositing tokens...");
  await defiDeposit.depositToken(tokenAmount);

  // 查询代币余额
  const tokenBalance = await defiDeposit.getTokenBalance();
  console.log("Token Balance:", hre.ethers.formatEther(tokenBalance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 