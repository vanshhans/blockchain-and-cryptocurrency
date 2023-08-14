import React from "react";
import { render } from "react-dom";
import {Router,Switch, Route} from "react-router-dom";
import history from "./history";
import App from "./components/App";
import Blocks from "./components/Blocks";
import conductTransaction from "./components/conductTransaction";
import transactionPool from "./components/transactionPool";
import "./index.css";

render(
    <Router history={history}>
        <Switch>
            <Route exact path="/" component={App}/>
            <Route path="/blocks" component={Blocks}/>
            <Route path="/conductTransaction" component={conductTransaction}/>
            <Route path="/transaction-pool" component={transactionPool}/>
        </Switch>
    </Router>,
    // <App></App>,
    document.getElementById("root")
);