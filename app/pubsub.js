const PubNub=require("pubnub");

const credentials={
    publishKey:"pub-c-44a3b376-1663-4b32-8d6b-4fc42e8e20f4",
    subscribeKey:"sub-c-88eead49-fcbf-4fbf-ba35-c4084b325289",
    uuid:"sec-c-MDUzN2I3ZmEtOTA0ZC00OTdlLTljMmYtMThmNjYyMjIyMDBk"
}

const CHANNELS={
    TEST:"TEST",
    BLOCKCHAIN:"BLOCKCHAIN",
    TRANSACTION:"TRANSACTION"
}

class PubSub{
    constructor({blockchain,transactionPool,wallet}){
        this.blockchain=blockchain;
        this.transactionPool=transactionPool;
        this.wallet=wallet;

        this.pubnub=new PubNub(credentials);
        
        this.pubnub.subscribe({channels:Object.values(CHANNELS)});

        this.pubnub.addListener(this.listener());
    }

    listener(){
        return {
            message:(messageObject)=>{
                const {channel,message}=messageObject;
                //console.log(`message received. channel:${channel}. message:${message}`);
                const parsedMessage = JSON.parse(message);

                if(channel===CHANNELS.BLOCKCHAIN)
                {
                    this.blockchain.replaceChain(parsedMessage,true,()=>{
                        this.transactionPool.clearBlockchainTransactions({
                            chain:parsedMessage
                        });
                    });
                }
                else if(channel===CHANNELS.TRANSACTION)
                {
                    if(!this.transactionPool.existingTransaction({
                        inputAddress:this.wallet.publicKey
                    })){
                        this.transactionPool.setTransaction(parsedMessage);
                    }
                }
            }
        };
    }

    publish({channel,message}){
        this.pubnub.publish({channel,message});

    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction(transaction) {
        this.publish({
            channel:CHANNELS.TRANSACTION,
            message:JSON.stringify(transaction)
        });
    }
}

// const testPubSub=new PubSub();
// testPubSub.publish({channel:CHANNELS.TEST,message:"hello pubnub"});

module.exports=PubSub;