import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";

export default function OrdersPage(){
    const [orders,setOrders] = useState([]);
    useEffect(()=>{
        axios.get('/api/orders').then(response =>{
            setOrders(response.data);
        })


    }),[]
    return(
        <Layout>
            <h1>Orders</h1>
            <table className="basic">
                <thead>
                    <tr>
                        <th>Date and Time</th>
                        <th>Paid</th>
                        <th>Recipient</th>
                        <th>Products</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 && orders.map(order =>(
                        <tr>
                            <td>{(new Date(order.createdAt)).toUTCString()}</td>
                            <td className={order.paid ? 'text-green-600':'text-red-600'}>
                                {order.paid? 'YES':'NO'}
                            </td>
                            <td>
                                {order.name} {order.email}<br/>
                                {order.city} {order.postalCode} {order.country}<br/>
                                {order.streetAddress}
                            </td>
                            <td>
                                {order.line_items.map(l=>(
                                    <>
                                    {l.price_data?.product_data?.name} × {l.quantity} <br/>
                                    </>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    )
        
}