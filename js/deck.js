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
		
		this.smallWorldData = this.decks.main.filter(filterUnique).filter(onlyMonsters).map((e)=>{
			let c = clone(e);
			c.smallWorld = this.getSmallWorldGroup(c,true); 
			return c; 
		});
			
		this.initPicklist("card1",this.smallWorldData,true);
		this.initPicklist("cardList",this.smallWorldData);
		
		var selectBox = document.getElementById("cardList");
		for (var i = 0; i < selectBox.options.length; i++) { 
             selectBox.options[i].selected = true; 
        } 
		selectBox.onchange()
			
	}
	
	
	initPicklist(id,list,insertBlank){
		let html = insertBlank?`<option value="">-- Select Card --</option>`:"";
		for(let i in list){
			html += `<option value="${list[i].id}">${list[i].name}</option>`
		}
		document.getElementById(id).innerHTML = html;
		
		
	}
	
	
	changeList(){
		let html = "";
		let selected = Array.from(document.getElementById("cardList").selectedOptions).map((e)=>{return e.value});
		
		for(let cardId of selected){

			let card =  this.smallWorldData.find((e)=>{return e.id==cardId})
			let firstLinks =card.smallWorld;
			
			for(let j in firstLinks){
				
				let secondLinks = firstLinks[j].smallWorld;
				
				for(let k in secondLinks){
					if(card.id ==secondLinks[k].id ){
						continue;
					}
					html += `
						<div class="row cardRow">
							<div class="col-sm-3">
								<img class="cardImg" src="https://storage.googleapis.com/ygoprodeck.com/pics/${card.id}.jpg">
							</div>
							<div class="col-sm-1"></div>
							<div class="col-sm-3">
								<img class="cardImg" src="https://storage.googleapis.com/ygoprodeck.com/pics/${firstLinks[j].id}.jpg">
							</div>
							<div class="col-sm-1"></div>
							<div class="col-sm-3">
								<img class="cardImg" src="https://storage.googleapis.com/ygoprodeck.com/pics/${secondLinks[k].id}.jpg">
							</div>
					
						</div>
					`;
				}
				
			}
			
			
		}
		
		document.getElementById("cardOutput").innerHTML = html;
		
	}
	
	changeCard(id,target){
		let cardId = document.getElementById(id).value;
		let list = [];
		if(cardId){
			list = this.smallWorldData.find((e)=>{return e.id==cardId}).smallWorld;
		}
		this.initPicklist(target,list,true);
	}
	
	
	getSmallWorldGroup(card,recursive){
		
		let list = clone(this.decks.main.filter(smallWorldGroup(card))).filter(filterUnique);
		
		if(recursive){
			list = list.map((e)=>{
				e.smallWorld = this.getSmallWorldGroup(e,false); 
				return e;
			});
		}
		
		return list;
	}

}