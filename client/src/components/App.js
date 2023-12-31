import React,{Component} from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

class App extends Component{
    state={walletInfo:{}};

    componentDidMount(){
        fetch(`${document.location.origin}/api/wallet-info`)
            .then(response=>response.json())
            .then(json=>this.setState({walletInfo:json}))
            .catch(error=>console.log("error",error))
    }

    render(){
        const {address,balance}=this.state.walletInfo;
        
        return (
            <div className="App">
                <img className="logo" src={logo}></img>
                <br></br>
                <div>Welcome to the blockchain...</div>
                <br></br>
                <div><Link to={"/blocks"}>Blocks</Link></div>
                <div><Link to={"/conductTransaction"}>Conduct a Transaction</Link></div>
                <div><Link to={"/transaction-pool"}>Transaction Pool</Link></div>
                <br></br>
                <div className="WalletInfo">
                    <div>Address:{address}</div>
                    <div>Balance:{balance}</div>
                </div>
            </div>
        );
    }
}

export default App;