import React,{Component} from "react";
import { Link } from "react-router-dom";
import Transaction from "./Transaction";
import { Button } from "react-bootstrap";
import history from "../history";

const POLL_INTERVAL_MS=10000;

class transactionPool extends Component {
    state ={transactionPoolMap:{}};

    fetchTransactionPoolMap=()=>{
        fetch(`${document.location.origin}/api/transaction-pool-map`)
        .then(response=>response.json())
        .then(json=>this.setState({transactionPoolMap:json}));
    }

    fetchMineTransactions=()=>{
        fetch(`${document.location.origin}/api/mine-transactions`)
            .then(response=>{
                if(response.status===200){
                    alert("success");
                    history.push("/blocks");
                }
                else{
                    alert("The mine-transactions block request did not complete");
                }
            })
    }

    componentDidMount(){
        this.fetchTransactionPoolMap();

        this.fetchPoolMapInterval=setInterval(() => {
           this.fetchTransactionPoolMap() 
        },POLL_INTERVAL_MS );
    }

    componentWillUnmount(){
        clearInterval(this.fetchPoolMapInterval);
    }

    render(){
        return(
            <div className="transactionPool">
                <div><Link to={"/"}>Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction=>{
                        return(
                            <div key={transaction.id}>
                                <hr></hr>
                                <Transaction transaction={transaction}></Transaction>
                            </div>
                        )
                    })
                }
                <hr></hr>
                <Button variant="danger" onClick={this.fetchMineTransactions}>Mine the transactions</Button>
            </div>
        )
    }
}

export default transactionPool;