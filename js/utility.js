
function filterUnique(e,i,a){
	if(typeof e =="string" || typeof e =="number"){
		return a.indexOf(e)==i;
	}else{
		return a.findIndex((b)=>{return b.id == e.id})==i;
	}
}

function onlyMonsters(e){
	return e.type?e.type.indexOf("Monster") !=-1:false;
}

function clone(arr){
	return JSON.parse(JSON.stringify(arr));
}

function doRequest(url,cb){
	//http request then callback
	
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			cb(JSON.parse(this.responseText));
		}
	};

	xhr.open("GET", url, true);
	
	
	xhr.send();

}

function findCard(data){
	return (cardId)=>{
		let d = data.find((e)=>{return e.id == cardId});
		if(!d){
			console.log(cardId);
			return cardId;
		}
		let cardData = {
			id : d.id,
			name : d.name,
			
			level : d.level,
			atk : d.atk,
			def : d.def,
			attribute : d.attribute,
			race : d.race, //spells/traps...
			
			type : d.type,
			
		}
		
		return cardData;
	}
}

function smallWorldGroup(card){
	return (e)=>{
		let legal = false;
		
		for(let i of smallWorldFields){
			let same = (e[i]==card[i]) && (e[i] != "?");
			
			if(legal && same){
				return false;
			}
			
			legal = legal||same;
		}
		
		return legal;
	}			
}

function openCardModel(cardId,cardName){
	document.getElementById("modalImage").src = getCardImage(cardId)
	document.getElementById("imageModalLabel").innerText = cardName;
	openModal();
}


function getCardImage(id){
	return `https://storage.googleapis.com/ygoprodeck.com/pics/${id}.jpg`;
}



/*modal*/
function openModal() {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("imageModal").style.display = "block"
    document.getElementById("imageModal").classList.add("show")
}
function closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("imageModal").style.display = "none"
    document.getElementById("imageModal").classList.remove("show")
}
// Get the modal
var modal = document.getElementById('imageModal');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    closeModal()
  }
}



