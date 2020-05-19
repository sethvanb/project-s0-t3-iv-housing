// index.jsx

import React, { useState, useEffect } from 'react';
import Head from 'next/head'  // for Next.js
import fetch from "isomorphic-unfetch";
import utilStyles from '../styles/utils.module.css'  // css style
import Layout, {siteTitle} from '../components/layout.js'
import Navbar from '../components/navbar.js'
import IndexForms from '../components/forms/indexForms.jsx'
import DataView from '../components/view/dataView.jsx'
import Info from '../components/info.jsx'

export default function Index(){
	const [initList, setInitList] = useState([]);  // houses data
	const [refinedData, setRefinedData] = useState([]);
	const [{street, block,  size, price, priceType}, setStreetBlock] = useState({street:'Any', block:'Any', size:'Any', price:'Any',priceType:'total'});
	const [direction, setDirection] = useState("ascending");
	const [view, setView] = useState('table');

	useEffect(() => { if(initList.length===0) getList(); });

	const filter = (street,block)=>{ setStreetBlock({block, street}); }
	const sortByPrice = (direction)=>{ setDirection(direction); }
	const toggleTable = ()=>{ setView('table'); }
	const toggleCard = ()=>{ setView('card'); }

	const getList = async () => {
		const response = await fetch(`/api`, { method: "GET" });
		const data = await response.json();
		setInitList(data);
		setRefinedData(data);
	}

	useEffect(() => {
		let houses = [...initList];
		let s = document.getElementById('streetSelect');
		let b = document.getElementById('blockSelect');

		if(street!=='Any') {
			houses = houses.filter(item=>{
				return item.address.indexOf(street)!==-1
			 })
		 }
		 if(block!=='Any') {
			 houses = houses.filter(item=>{
				return item.address.substr(0,2) === block
			})
		 }
		 if(size!=='Any') {
			houses = houses.filter(item=>{
				let tIndex=size.indexOf('+')
				if(tIndex!==-1){
					return item.size > Number(size.substring(0,tIndex))
				}else{
					return item.size === Number(size)
				}
		   })
		}
		 if(price!=='Any') {
			 if(priceType=='total'){
				houses = houses.filter(item=>{
					let tIndex=price.indexOf('+')
					if(tIndex!==-1){
						return item.totalPrice >= Number(price.substring(0,tIndex))
					}else{
						let tarr=price.split('-')
						return item.totalPrice >= Number(tarr[0])&&item.totalPrice < Number(tarr[1])
					}
				})
			 }else{
				houses = houses.filter(item=>{
					let tIndex=price.indexOf('+')
					if(tIndex!==-1){
						return Number((item.totalPrice/item.size).toFixed(2)) >= Number(price.substring(0,tIndex))
					}else{
						let tarr=price.split('-')
						return Number((item.totalPrice/item.size).toFixed(2)) >= Number(tarr[0])&&Number((item.totalPrice/item.size).toFixed(2)) < Number(tarr[1])
					}
				})
			 }
		}

		setRefinedData(houses);
	}, [initList, street, block,  size, price, priceType, direction]);
	
	useEffect(() => {
		let t = document.getElementById('tableButton');
		let c = document.getElementById('cardButton');
		if (view=='table') {
			t.classList.toggle(utilStyles['clicked']);
			if (c.classList.contains(utilStyles['clicked'])) c.classList.toggle(utilStyles['clicked']);
		}
		if (view=='card') {
			c.classList.toggle(utilStyles['clicked']);
			if (t.classList.contains(utilStyles['clicked'])) t.classList.toggle(utilStyles['clicked']);
		}
	}, [view]);

	return (
		<Layout index>
			<Head>
				<title>{siteTitle}</title>
			</Head>
			<Navbar></Navbar>
			<div className={utilStyles.containerIndex}>
				<h1 className={utilStyles.searchH1}>Search Listings</h1>
				<div className={utilStyles.indexDivs}>
					<IndexForms filter={filter} sortByPrice={sortByPrice}/>
					<DataView chosenView={view} data={refinedData} toggleTable={toggleTable} toggleCard={toggleCard}/>
					<Info/>
				</div>
			</div>
		</Layout>
	);
}
