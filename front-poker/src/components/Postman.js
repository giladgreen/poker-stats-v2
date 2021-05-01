
import React, { Component } from 'react';
import 'react-input-range/lib/css/index.css';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import GreenBubbleButton from '../containers/GreenBubbleButton';
import generalRequest from '../actions/generalRequest';
import JSONTree from 'react-json-tree'



class Postman extends Component {

    constructor(props) {
        super(props);

        this.state = { tabKey:'Tab 1', tabs:[{ name:'Tab 1', method:'GET', url:'https://www.poker-stats.com/api/v2/groups/', headers:['provider: google', 'x-auth-token: ****']}] };


    }
    onKeyChange = (tabKey)=>{

        if (tabKey === '+'){
            console.log('+ was pressed')
            const newStateTabs = [...this.state.tabs];
            newStateTabs.push({name:`Tab ${this.state.tabs.length+1}`, method:'GET', url:'', headers:[]});
            this.setState({tabs: newStateTabs, tabKey:newStateTabs[newStateTabs.length-1].name})
        }else{
            this.setState({tabKey})
        }
    };

    async sendRequest(){
        this.setState({bodyObj: null,statusCode: null,error: null,headers: null})
        const tabData = this.state.tabs.find(x=>x.name === this.state.tabKey);
        console.log('sendRequest tabData',tabData)
        if (!tabData){
            console.error('sendRequest no tabData found!',this.state.tabs,this.state.tabKey)
        }

        const {  statusCode,
            body,
            headers,
            bodyObj,
            error } = await generalRequest(tabData);

        console.log('statusCode',statusCode)
        console.log('body',body)
        console.log('bodyObj',bodyObj)
        console.log('error',error)
        console.log('headers',headers)
        this.setState({bodyObj,statusCode,error, headers})

    }
    render(){

        const tabs = this.state.tabs.map(tabData=>{
            return  <Tab eventKey={tabData.name} title={tabData.name} key={tabData.name}>
                <div>
                    <select className="postman-method-combo" name="method" value={tabData.method} onChange={(e)=>{
                        const newTabs = [...this.state.tabs];
                        newTabs.find(x=>x.name===tabData.name).method = e.target.value;
                        this.setState({tabs: newTabs})

                    }}>
                        <option key={`_comboVals_get`} value="GET">GET </option>
                        <option key={`_comboVals_post`} value="POST">POST </option>
                        <option key={`_comboVals_put`} value="PUT">PUT </option>
                        <option key={`_comboVals_delete`} value="DELETE">DELETE </option>
                        <option key={`_comboVals_patch`} value="PATCH">PATCH </option>
                    </select>

                    <input  className="postman-url" type="text" value={tabData.url} onChange={(e)=>{
                        const newTabs = [...this.state.tabs];
                        newTabs.find(x=>x.name===tabData.name).url = e.target.value;
                        this.setState({tabs: newTabs})
                    }}/>

                    <GreenBubbleButton className="button left-margin" onClick={()=>this.sendRequest()}> Send</GreenBubbleButton>

                </div>
                <div>
                    <div>  Headers:</div>
                    <div>{

                        tabData.headers.map((header,index)=>{
                            const key = header.split(':')[0].trim();
                            const val = header.split(':')[1].trim();
                            return  <div>
                                <input className="postman-header postman-header-key" type="text" value={key} onChange={(e)=>{
                                    const newTabs = [...this.state.tabs];
                                    newTabs.find(x=>x.name===tabData.name).headers[index] = `${e.target.value}:${val}` ;
                                    this.setState({tabs: newTabs})
                                }}/>
                                <input className="postman-header postman-header-value" type="text" value={val} onChange={(e)=>{
                                    const newTabs = [...this.state.tabs];
                                    newTabs.find(x=>x.name===tabData.name).headers[index] = `${key}:${e.target.value}` ;
                                    this.setState({tabs: newTabs})
                                }}/>

                                {index === tabData.headers.length - 1 ? <div className="add-header-col" onClick={()=>{
                                    const newTabs = [...this.state.tabs];
                                    newTabs.find(x=>x.name===tabData.name).headers.push(':')
                                    this.setState({tabs: newTabs})
                                }}>+</div> : <div></div>}
                            </div>
                        })
                    }
                    </div>




                </div>


                {this.state.statusCode ?   <div className="postman-result-div">
                    <div>result status code: {this.state.statusCode}</div>

                    <div>
                        result body:
                        <div>
                            <JSONTree data={this.state.bodyObj} />
                        </div>
                    </div>


                    <div>

                        result headers
                        <div>
                            <JSONTree data={this.state.headers} />
                        </div>
                    </div>

                </div> : <div></div>}



            </Tab>
        })
        if (tabs.length < 12){

            tabs.push(<Tab eventKey="+" title="+" key="+">
            </Tab>)
        }

        return (<div id="postman" >
            <div id="postman-header">Postman</div>
            <div id="postman-div-body">
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example2" style={{fontSize: "1em", }} activeKey={this.state.tabKey} onSelect={this.onKeyChange} variant="pills">
                    {tabs}
                </Tabs>
            </div>


        </div>)

    }
}

export default Postman;
