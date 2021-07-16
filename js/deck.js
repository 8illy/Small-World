class ygoDeck{
	
	constructor(){
		
		this.resetDeck();
		
		this.smallWorldData = [];
		
		
	}
	
	resetDeck(){
		this.decks = {
			main : [],
			extra : [],
			side : [],
			generic : clone(generics),
		};
	}
	
	
	loadDeckList(ydkFile){
		this.resetDeck();
		
		let fr=new FileReader();
            
		fr.onload= ()=>{
               this.processDeckList(fr.result);
		}
              
		fr.readAsText(ydkFile);
	}
	
	processDeckList(ydkText){
		
		//ygocore deck format.
		let lines = ydkText.replace(/\r/g,"").split("\n");
		let mode = "";
		for(let i in lines){
			let cardId = lines[i];
			let prefix = cardId[0];
			
			if(prefix=="#"||prefix=="!"){
				mode = cardId.substr(1);
			}else if(Number(cardId)){
				this.decks[mode].push(cardId);
			}
		}
		
		this.retrieveCardData();
		
	}
	
	
	retrieveCardData(){
		
		let allCards = [].concat.call(...Object.values(this.decks));
		
		let allCardsStr = allCards.filter(filterUnique).join(",");
		
		doRequest('https://db.ygoprodeck.com/api/v7/cardinfo.php?id='+allCardsStr , (data)=>{
			this.processCardsResponse(data.data);
		})
		
		
	}
	
	
	processCardsResponse(data){
		
		for(let i in this.decks){
			this.decks[i] = this.decks[i].map(findCard(data));
		}
		
		this.updateSmallWorldData();
			
	}
	
	updateSmallWorldData(){
		
		let includeSide = document.getElementById("includeSide").checked;
		let addGenericCards = document.getElementById("addGenericCards").checked;
		let data = clone(this.decks.main);
		if(includeSide){
			data = data.concat(this.decks.side);
		}
		
		if(addGenericCards){
			data = data.concat(this.decks.generic);
		}
		
		this.smallWorldData = data.filter(filterUnique).filter(onlyMonsters).map((e)=>{
			let c = clone(e);
			c.smallWorld = this.getSmallWorldGroup(data,c,true); 
			return c; 
		}).sort((a,b)=>{
			return a.name>b.name?1:-1;
		});
			
		this.populateCardList();
		
	}
	
	populateCardList(){
		this.calculateSmallWorldLinks();
		
		this.initPicklist("cardList",this.smallWorldData);
		
		var selectBox = document.getElementById("cardList");
		for (var i = 0; i < selectBox.options.length; i++) { 
             selectBox.options[i].selected = true; 
        } 
		
		selectBox.size = Math.min(20,selectBox.options.length);
		
		
		this.changeList();
	}
	
	calculateSmallWorldLinks(){
		this.smallWorldLinks = {};
		for(let i in this.smallWorldData){
			let card =  this.smallWorldData[i];
			let cardId = card.id;
			let firstLinks = card.smallWorld;
			this.smallWorldLinks[cardId] = {};
			for(let j in firstLinks){
				let secondLinks = firstLinks[j].smallWorld;
				for(let k in secondLinks){
					this.smallWorldLinks[cardId][secondLinks[k].id] = this.smallWorldLinks[cardId][secondLinks[k].id]?this.smallWorldLinks[cardId][secondLinks[k].id]:[];
					this.smallWorldLinks[cardId][secondLinks[k].id].push(firstLinks[j].id);
				}
				
			}	
		}
	}
	
	initPicklist(id,list,insertBlank){
		let html = insertBlank?`<option value="">-- Select Card --</option>`:"";
		for(let i in list){
			html += `<option value="${list[i].id}">${list[i].name}   (${Object.keys(this.smallWorldLinks[list[i].id]).length}/${list.length})</option>`
		}
		document.getElementById(id).innerHTML = html;
		
		
	}
	
	
	changeList(){
				
		let html = "";
		
		let simplifyOutput = document.getElementById("simplifyOutput").checked;
		let showSelfSearch = document.getElementById("showSelfSearch").checked;
		let selected = Array.from(document.getElementById("cardList").selectedOptions).map((e)=>{return e.value});
		
		let cards = [].concat.call(...Object.values(this.decks));
		
		
		if(!simplifyOutput){
			for(let cardId of selected){
				
				let outputs =  this.smallWorldLinks[cardId];
				for(let i in outputs){
					for(let j in outputs[i]){
						
						if(!showSelfSearch && cardId == i ){
							continue;
						}
						
						
						html += `
							<div class="row cardRow">
								<div class="col-sm-3">
									<img class="cardImg" src="${getCardImage(cardId)}">
								</div>
								<div class="col-sm-1"></div>
								<div class="col-sm-3">
									<img class="cardImg" src="${getCardImage(outputs[i][j])}">
								</div>
								<div class="col-sm-1"></div>
								<div class="col-sm-3">
									<img class="cardImg" src="${getCardImage(i)}">
								</div>
						
							</div>
						`;
					}
				}
			}
		}else{
			for(let cardId of selected){
				
				let outputs =  this.smallWorldLinks[cardId];
				for(let i in outputs){
					
					
						if(!showSelfSearch && cardId == i ){
							continue;
						}
					
					html += `
						<div class="row cardRow">
							<div class="col-sm-3">
								<img class="cardImg" src="${getCardImage(cardId)}">
							</div>
							<div class="col-sm-1"></div>
							<div class="col-sm-3"><div class="stackedCardContainer">`
							for(let j in outputs[i]){
								let cardName = cards.find((e)=>e.id==outputs[i][j]).name;
								html+=	`<img class="cardImg stackedCardImg" src="${getCardImage(outputs[i][j])}" style="left:${j*25}px;" onclick="openCardModel(${outputs[i][j]},'${cardName}')">`
							}
							html+=`</div></div>
							<div class="col-sm-1"></div>
							<div class="col-sm-3">
								<img class="cardImg" src="${getCardImage(i)}">
							</div>
					
						</div>
					`;
					
				}
			}
			
			
			
			
		}
		
		
		document.getElementById("cardOutput").innerHTML = html;
	}
		
	
	
	
	
	getSmallWorldGroup(data,card,recursive){
		
		let list = clone(data.filter(smallWorldGroup(card))).filter(filterUnique);
		
		if(recursive){
			list = list.map((e)=>{
				e.smallWorld = this.getSmallWorldGroup(data,e,false); 
				return e;
			});
		}
		
		return list;
	}

}