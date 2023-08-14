import React,{Component} from "react";
import { FormGroup,FormControl,Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import history from "../history";

class conductTransaction extends Component{
    state={recipient:"",amount:0};

    updateRecipient=(event)=>{
        this.setState({recipient:event.target.value});
    }
    
    updateAmount=(event)=>{
        this.setState({amount:Number(event.target.value)});
    }

    conductTransaction=()=>{
        const {recipient,amount} = this.state;

        fetch(`${document.location.origin}/api/transact`,{
            method:"POST",
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify({recipient,amount})
        })
        .then((response)=>response.json())
        .then((json)=>{
            alert(json.message || json.type);
            history.push("/transaction-pool");
        })
    }

    render(){
        return (
            <div className="conductTransaction">
                <Link to="/">Home</Link>
                <br></br>
                <FormGroup>
                    <FormControl 
                        input="text" 
                        placeholder="recipient"
                        value={this.state.recipient} 
                        onChange={this.updateRecipient}   
                    ></FormControl>
                </FormGroup>
                <br></br>
                <FormGroup>
                    <FormControl 
                        input="number" 
                        placeholder="amount"
                        value={this.state.amount} 
                        onChange={this.updateAmount}    
                    ></FormControl>
                </FormGroup>
                <br></br>
                <div>
                    <Button 
                        variant="danger"
                        onClick={this.conductTransaction} 
                    >
                        Submit
                    </Button>
                </div>
            </div>
        )
    }
}

export default conductTransaction;