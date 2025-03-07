import { Skeleton } from "@mui/material";
import React, { useContext, useEffect } from "react";
import { Accordion, Card, Stack } from "react-bootstrap";
import useLocalStorage from "use-local-storage";
import { SMRT16Context } from "../SMRT16Context";
import { fetcher, TheData } from "../Utils/data";
import useSWR from "swr";
import moment from "moment";

/**
 * 
 * @param {id} props 
 * id - address of my wallet 
 * 
 */
export default function BalanceWidget(props) {

    //APIgetWalletTokenTransfers


    const context = useContext(SMRT16Context);
    const refLink = TheData.addrScan + (props.id || context.r.addr);
    const apiUrl = TheData.APIgetWalletTokenTransfers + (props.id || context.r.addr);
    const { data, error, isLoading } = useSWR(
        apiUrl,
        fetcher
    );

    const [userMATIC, setUserMatic] = useLocalStorage("userMATIC", 0);
    const [userUSDT, setUserUsdt] = useLocalStorage("userUSDT", 0);
    const [userSMRT16, setUserSmrt16] = useLocalStorage("userSMRT16", 0);
    const [trCount, setTrCount] = useLocalStorage("trCount", '...');


    const handleRefresh = async () => {
        setUserMatic(0);
        setUserUsdt(0);
        setUserSmrt16(0);
        context.SMRT16dispatch({ balance: "update" });
    }

    useEffect(() => {
        console.log("balance update effect", context.r.matic);
        if (context.r.matic) setUserMatic(context.r.matic);
        if (context.r.usdt) setUserUsdt(context.r.usdt);
        if (context.r.smrt16) setUserSmrt16(context.r.smrt16);
        if (data && data.result) {
            setTrCount(data.data.total);
        }
        console.log("apiUrl", apiUrl, data?.data);
    }, [context, data]);

    const formatLine = (item) => {
        const In = <span className="cIn">In</span>;
        const Out = <span className="cOut">Out</span>;
        let inOut = (item.from_address == context.r.addr) ? Out : In;
        let name = "Tokens";
        let value = +item.value;
        if(TheData.smrt16ContractAddr.toLocaleLowerCase() == item.address.toLocaleLowerCase()) {
            name = "S16";
            value /= 1000000;
        }
        if(TheData.usdtContractAddr.toLocaleLowerCase() == item.address.toLocaleLowerCase()) {
            name = "USDT";
            value /= 1000000;
        } 
        
        return <>
                
                {inOut}
                <span>{value}</span>&nbsp;
                <span><b>{name}</b></span>&nbsp;
                
            
        </>;
    }

    const formatData = (tr) => {
        let arr = [];
        
        for (let i = 0; i < tr.length; i++) {
            const item = tr[i];
            if(!arr[item.block_timestamp]) {
                arr[item.block_timestamp] = [];
            }
            arr[item.block_timestamp].push(item);
            
        }
        
        const keys = Object.keys(arr);
        //console.log("tr",tr, keys);
        return <div className="balanceWidgetContainer">
            {keys.map((itx, idx) => {
                let items = arr[itx];
                let itm = items[0];
                console.log('items',items);
                return (<div key={idx}>
                    <div className="text-truncate">
                        <b>{moment(itx).fromNow()}</b>
                    &nbsp;<a href={TheData.txScan + itm.transaction_hash} 
                        title={"Hash: "+itm.transaction_hash} target="_blank">
                        <span >{itm.transaction_hash}</span>
                        </a> 
                    </div>
                    <div className="shift">
                        {items.map((item,i)=>{
                        return <div key={i}>
                                {formatLine(item)}
                            </div>;
                        })}
                            
                    </div>
                </div>
                )})
            }
        </div>
    }

    return (
        <>
            <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Your balances</Accordion.Header>
                    <Accordion.Body>
                                <div>
                                    <Stack gap={2}>
                                        {context.r.ethereum ? <div style={{ textAlign: "right" }}>
                                            <a href={refLink}
                                                style={{ fontSize: '66%' }}
                                                className="btn btn-sm btn-outline-secondary smaller"
                                                target="_blank">View on PolygonScan</a>&nbsp;<button
                                                    style={{ fontSize: '66%' }}
                                                    onClick={handleRefresh}
                                                    className="btn btn-sm btn-outline-secondary smaller"
                                                    target="_blank">Refresh</button>
                                        </div> : <><br /></>}
                                        <Stack direction="horizontal" gap={3}>

                                            <div>
                                                <p>MATIC:</p>
                                                <p>USDT:</p>
                                                <p>SMRT16:</p>
                                            </div>
                                            <div>
                                                <p>{userMATIC || <Skeleton style={{ minWidth: "100px" }} />}</p>
                                                <p>{userUSDT || <Skeleton style={{ minWidth: "100px" }} />}</p>
                                                <p>{userSMRT16 || <Skeleton style={{ minWidth: "100px" }} />}</p>
                                            </div>
                                            {/* <div className="smaller">
                        <p><button className="btn btn-sm btn-outline-secondary" style={{fontSize:'66%'}}>Add network</button></p>
                        <p><button className="btn btn-sm btn-outline-secondary" style={{fontSize:'66%'}}>Add asset</button></p>
                        <p><button className="btn btn-sm btn-outline-secondary" style={{fontSize:'66%'}}>Add asset</button></p>
                    </div> */}
                                        </Stack>
                                        {context.r.ethereum ? <>
                                            {userUSDT == '0.0' ? <p><b>Seems like you need to top up your USDT balance.</b></p> : <></>}
                                            {userMATIC == '0.0' ? <p><b>Seems like you have to refill your MATIC balance first.</b></p> : <></>}
                                        </> : <>
                                            <p>Wallet is not connected</p>
                                        </>}

                                    </Stack>
                                </div>

                            
                                {context.r.pcontract && <span className="smaller grey">
                                    {/* <div title="pcontract">" {context.r.pcontract}"</div> */}
                                    {context.r.pcontract != '0x0000000000000000000000000000000000000000' ?

                                        <span title={context.r.pcontract}>
                                            Your referrer is fixed to:&nbsp;
                                            {context.r.referrer ?
                                                <a href={'/' + context.r.referrer}>{context.r.referrer}</a>
                                                :
                                                <Skeleton />
                                            }
                                        </span>

                                        :
                                        <>You don't have a fixed referrer yet.</>
                                    }
                                </span>}

                          
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Your Transactions </Accordion.Header>
                    <Accordion.Body>
                        {isLoading ? <Skeleton /> : <>
                            {error ? <>
                                Error fetching transactions: {error + ""}
                            </> : <>
                                <div>
                                    {trCount>0?<>
                                        {data && formatData(data.data.result)}
                                    </>:<>
                                        <div>No data to display</div>
                                    </>}
                                    
                                </div>
                            </>}

                        </>}

                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

        </>


    );
}