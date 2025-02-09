const hre = require("hardhat");

async function main() {
  const TEST_TOKEN_ADDRESS = "0x993682755abFe61Be45DEe2bC4168064A74E86d5";
  const DEFI_DEPOSIT_ADDRESS = "0x6A83bada0394177865eC4A77731Aa8945F05f981";

  console.log("开始验证合约...");

  try {
    // 验证 TestToken
    console.log("验证 TestToken 合约...");
    await hre.run("verify:verify", {
      address: TEST_TOKEN_ADDRESS,
      constructorArguments: []
    });
    console.log("TestToken 验证成功！");
  } catch (error) {
    console.log("TestToken 验证失败:", error.message);
  }

  try {
    // 验证 DefiDeposit
    console.log("验证 DefiDeposit 合约...");
    await hre.run("verify:verify", {
      address: DEFI_DEPOSIT_ADDRESS,
      constructorArguments: [TEST_TOKEN_ADDRESS]
    });
    console.log("DefiDeposit 验证成功！");
  } catch (error) {
    console.log("DefiDeposit 验证失败:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 