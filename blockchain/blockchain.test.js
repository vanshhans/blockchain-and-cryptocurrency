const Block = require("./block");
const Blockchain=require("./blockchain");
const {cryptoHash}=require("../util");
const Wallet=require("../wallet/index");
const Transaction =require("../wallet/transaction");

describe("Blockchain",()=>{
    let blockchain,newchain,originalChain;

    beforeEach(()=>{
        blockchain=new Blockchain();
        newchain=new Blockchain();
        originalChain=blockchain.chain;
    });

    it("contains a `chain` array instance",()=>{
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block',()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it("adds a new block to the chain",()=>{
        const newData="foo-bar";
        blockchain.addBlock({data:newData});

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe("isValidChain()",()=>{
        describe("when the chain does not start with the genesis block",()=>{
            it("returns false",()=>{
                blockchain.chain[0]={data:"fake-genesis"};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe("when the chain starts with the genesis block and has multiple blocks",()=>{

            beforeEach(()=>{
                blockchain.addBlock({data:"Bears"});
                blockchain.addBlock({data:"Beets"});
                blockchain.addBlock({data:"Battlestar Galactica"});
            });

            describe("and a lastHash reference has changed",()=>{
                it("returns false",()=>{
                    blockchain.chain[2].lastHash="broken-lastHash";
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe("and the chain contains a block with an invalid field",()=>{
                it("returns false",()=>{
                    blockchain.chain[2].data="some-bad-and-evil-data";
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe("and the chain contains a block with a jumped difficutly",()=>{
                it("returns false",()=>{
                    const lastBlock=blockchain.chain[blockchain.chain.length-1];
                    const lastHash=lastBlock.hash;
                    const timestamp=Date.now();
                    const nonce=0;
                    const data=[];
                    const difficulty=lastBlock.difficulty-3;
                    const hash=cryptoHash(timestamp,lastHash,difficulty,nonce,data);
                    const badBlock=new Block({timestamp,lastHash,hash,nonce,difficulty,data});
                    blockchain.chain.push(badBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                })
            })

            // describe("and the chain does not contain any invalid blocks",()=>{
            //     it("returns true",()=>{
            //         expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);                    
            //     });
            // });
        });
    });

    describe("replaceChain()",()=>{
        describe("when the new chain is not longer",()=>{
            it("does not replace the chain",()=>{
                newchain.chain[0]={new:"chain"};

                blockchain.replaceChain(newchain.chain);
                expect(blockchain.chain).toEqual(originalChain);
            });
        });

        describe("when the new chain is longer",()=>{
            
            beforeEach(()=>{
                newchain.addBlock({data:"Bears"});
                newchain.addBlock({data:"Beets"});
                newchain.addBlock({data:"Battlestar Galactica"});
            });
            
            describe("and the chain is invalid",()=>{
                it("does not replace the chain",()=>{
                    newchain.chain[2].hash="some-fake-hash";
                    blockchain.replaceChain(newchain.chain);
                    expect(blockchain.chain).toEqual(originalChain);
                });
            });

            // describe("and the chain is valid",()=>{
            //     it("replaces the chain",()=>{
            //         blockchain.replaceChain(newchain.chain);
            //         expect(blockchain.chain).toEqual(newchain.chain);
            //     });
            // });
        });

        // describe("and the `validateTransactions` flag is true",()=>{
        //     it("calls validTransactionData()",()=>{
        //         const validTransctionDataMock=jest.fn();

        //         blockchain.validTransactionData=validTransctionDataMock;

        //         newchain.addBlock({data:"foo"});
        //         blockchain.replaceChain(newchain.chain,true);
        //         expect(validTransctionDataMock).toHaveBeenCalled();
        //     });
        // });
    });

    describe("validTransactionData()",()=>{
        let transaction,rewardedTransaction,wallet;

        beforeEach(()=>{
            wallet=new Wallet();
            transaction=wallet.createTransaction({recipient:"foo-address",amount:65});
            rewardedTransaction=Transaction.rewardTransaction({minerWallet:wallet});
        });

        describe("and the transaction data is valid",()=>{
            it("returns true",()=>{
                newchain.addBlock({data:[transaction,rewardedTransaction]});
                expect(blockchain.validTransactionData({chain:newchain.chain})).toBe(true);
            });
        });

        describe("and the transaction data has multiple rewards",()=>{
            it("returns false",()=>{
                newchain.addBlock({data:[transaction,rewardedTransaction,rewardedTransaction]});

                expect(blockchain.validTransactionData({chain:newchain.chain})).toBe(false);
            });
        });

        describe("and the transaction data has at least one malformed outputMap",()=>{
            describe("and the transaction is not a reward transaction",()=>{
                it("returns false",()=>{
                    transaction.outputMap[wallet.publicKey]=999999;

                    newchain.addBlock({data:[transaction,rewardedTransaction]});

                    expect(blockchain.validTransactionData({chain:newchain.chain})).toBe(false);
                });
            });

            describe("and the transaction is a reward transaction",()=>{
                it("returns false",()=>{
                    rewardedTransaction.outputMap[wallet.publicKey]=999999;

                    newchain.addBlock({data:[transaction,rewardedTransaction]});

                    expect(blockchain.validTransactionData({chain:newchain.chain})).toBe(false);
                });
            });
        });

        describe("and the transaction data has at least one malformed input",()=>{
            it("returns false",()=>{
                wallet.balance=9000;

                const evilOutputMap={
                    [wallet.publicKey]:8900,
                    fooRecipient:100
                };

                const evilTransaction={
                    input:{
                        timestamp:Date.now(),
                        amount:wallet.balance,
                        address:wallet.publicKey,
                        signature:wallet.sign(evilOutputMap)
                    },
                    outputMap:evilOutputMap
                };

                newchain.addBlock({data:[evilTransaction]});
                expect(blockchain.validTransactionData({chain:newchain.chain})).toBe(false);
            });
        });

        describe("and a block contains multiple identical transactions",()=>{
            it("returns false",()=>{
                newchain.addBlock({
                    data:[transaction,transaction,transaction,rewardedTransaction]
                });

                expect(blockchain.validTransactionData({chain:newchain.chain})).toBe(false);
            });
        });
    });
});