const fs = require('fs');
const path = require('path');

// 要验证的合约名称
const CONTRACT_NAME = "TestToken";
const CONTRACT_PATH = "contracts/TestToken.sol";

// 读取 build-info 目录
const buildInfoDir = path.join(__dirname, '../artifacts/build-info');
const files = fs.readdirSync(buildInfoDir);

files.forEach(file => {
    const filePath = path.join(buildInfoDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 遍历所有合约
    Object.keys(content.output.contracts).forEach(contractFile => {
        Object.keys(content.output.contracts[contractFile]).forEach(contractName => {
            // 如果找到目标合约
            if (contractName === CONTRACT_NAME) {
                console.log(`找到合约 ${CONTRACT_NAME} 在文件 ${file}`);
                
                // 创建用于验证的 JSON
                const verifyJson = {
                    language: 'Solidity',
                    settings: {
                        optimizer: {
                            enabled: true,
                            runs: 200
                        },
                        outputSelection: {
                            "*": {
                                "*": ["*"]
                            }
                        }
                    },
                    sources: {}
                };

                // 添加所有相关的源文件
                Object.keys(content.input.sources).forEach(sourceFile => {
                    verifyJson.sources[sourceFile] = {
                        content: content.input.sources[sourceFile].content
                    };
                });

                // 将 JSON 写入文件
                const outputPath = path.join(__dirname, `../verify-${CONTRACT_NAME}.json`);
                fs.writeFileSync(outputPath, JSON.stringify(verifyJson, null, 2));
                console.log(`验证 JSON 已保存到: ${outputPath}`);
            }
        });
    });
}); 