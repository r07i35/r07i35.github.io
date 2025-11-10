let scrollPosition;
const main = document.getElementById("main");
const inputTabName = document.getElementById("input-tab-name");
const changeTabName = document.getElementById("change-tab-name");
const clearListBtn = document.getElementById("clear-list-btn");
const storeList = document.getElementById("store-as-url-btn");
const filteringStatus = document.getElementsByClassName("filtering-status");
const checkListInHTML = document.getElementById("check-list");
const pageTopBtn = document.getElementById("page-top-btn");
const overlay = document.getElementById("add-list-overlay");
const overlayBackground = document.getElementById("add-list-overlay-background");
const selectStatusOnOverlay = document.getElementsByClassName("select-status-on-overlay");
const selectStatusOnPrompt = document.getElementsByClassName("select-status-on-prompt");
const minIndex = document.getElementById("min-index");
const maxIndex = document.getElementById("max-index");
const addToListBtn = document.getElementById("add-to-list-btn");
const inputKeys = document.getElementsByClassName("input-key");
const displayInput = document.getElementById("display-input");
const selectEditMode = document.getElementsByClassName("select-editmode");
const incrementKey = document.getElementById("increment-key");
const decrementKey = document.getElementById("decrement-key");
const zeroOrLessAlert = document.getElementById("zero-or-less-alert");
const noMatchingListAlert = document.getElementById("no-matching-list-alert");

const statusList = ["notsubmitted", "submitting", "submitted", "forgets"];
const statusListInJp = {notsubmitted: "未提出", submitting: "提出済", submitted: "既提出", forgets: "忘却"};
const pattern = /[0-9]{1,}/;
const defaultListHTML = '<table id="check-list"><thead><tr><th>index</th><th>Status</th></tr><thead><tbody></tbody></table>';
const alertDisplayTime = 1000;

let checkedStatus;

const checkList = new class {
	constructor() {
		this.map = new Map();
		this.list = [];
	}

	set(indexInList, submittingStatus) {
		const key = Number(indexInList);
		if(!this.map.has(key)){
			this.list.push(key);
		}
		this.map.set(key, submittingStatus);
	}
	verifyIndexInList(indexInList) {
		if(this.map.has(Number(indexInList))){
			return true;
		}else {
			return false;
		}
	}
	getIndexInList(index) {
		return this.list[Number(index)];
	}
	getByIndexInList(indexInList) {
		return this.map.get(Number(indexInList));
	}
	getByIndex(index) {
		const key = this.list[Number(index)];
		return this.map.get(key);
	}
	getSize() {
		return this.map.size;
	}
	delete(indexInList) {
		const key = Number(indexInList);
		if(this.map.has(key)){
			this.map.delete(key);
			this.list = this.list.filter(x => x !== key);
		}
	}
	clear() {
		this.map.clear();
		this.list = [];
	}
}

function addToList(number, status) {
	if(number > 0){
		checkList.set(number, status);
	}
}
function clearList() {
	checkList.clear();
	checkListInHTML.innerHTML = defaultListHTML;
	location.search = "";
}
function displayToHTML(count, status) {
	const listWrapper = checkListInHTML.getElementsByTagName("tbody")[0];
	if(pattern.test(count)){
		if(count > 0){
			const tr = document.createElement("tr");
			tr.setAttribute("class", "list");
			let td = document.createElement("td");
			// indexの作成
			const index = document.createElement("p");
			index.setAttribute("class", "index");
			index.appendChild(document.createTextNode(count));
			td.appendChild(index);
			tr.appendChild(td);
			// selectStatusの作成
			const selectBox = document.createElement("div");
			selectBox.setAttribute("class", "select-box-in-list");
			td = document.createElement("td");
			let label;
			let selectStatusBtn;
			for(let i = 0; i < statusList.length; ++i){
				label = document.createElement("label");
				label.setAttribute("class", "button-wrapper");
				selectStatusBtn = document.createElement("input");
				selectStatusBtn.setAttribute("class", "select-status");
				selectStatusBtn.setAttribute("type", "radio");
				selectStatusBtn.setAttribute("name", "select-status" + String(count));
				selectStatusBtn.setAttribute("value", statusList[i]);
				// statusによってinputのcheckedの位置を変える
				if(status === statusList[i]){
					selectStatusBtn.checked = "true";
				}
				label.appendChild(selectStatusBtn);
				label.appendChild(document.createTextNode(statusListInJp[statusList[i]]));
				selectBox.appendChild(label);
			}
			td.appendChild(selectBox);
			tr.appendChild(td);

			// リストを消すボタンの作成
			td = document.createElement("td");
			const deleteListBtn = document.createElement("button");
			deleteListBtn.setAttribute("class", "delete-list");
			deleteListBtn.setAttribute("name", "delete-list");
			deleteListBtn.setAttribute("value", count);
			deleteListBtn.appendChild(document.createTextNode("x"));
			td.appendChild(deleteListBtn);
			tr.appendChild(td);

			listWrapper.appendChild(tr);
		}
	}
}
function loadDisplay() {
	checkListInHTML.innerHTML = defaultListHTML;
	checkList.list.sort((a,b) => a - b);
	for(let i = 0; i < checkList.getSize(); ++i){
		displayToHTML(checkList.list[i], checkList.getByIndexInList(checkList.list[i]));
	}
	const selectBoxInList = document.getElementsByClassName("select-box-in-list");
	const deleteList = document.getElementsByClassName("delete-list");
	for(let i = 0; i < checkList.getSize(); ++i){
		selectBoxInList[i].addEventListener('change', (event) => {
			checkList.set(event.target.name.slice(13), event.target.value);
			storeAsURL();
		})
		deleteList[i].addEventListener('click', (event) => {
			checkList.delete(event.target.value);
			storeAsURL();
			loadDisplay();
		})
	}
}
function getCheckedStatus(list) {
	for(let i = 0; i < statusList.length; ++i){
		if(list[i].checked){
			return list[i].value;
		}
	}
}
function filteringList() {
	const isCheckedStatus0 = filteringStatus[0].checked;
	const isCheckedStatus1 = filteringStatus[1].checked;
	const isCheckedStatus2 = filteringStatus[2].checked;
	const isCheckedStatus3 = filteringStatus[3].checked;
	const listInTable = checkListInHTML.getElementsByClassName("list");
	// document.documentElement.scrollTop || document.body.scrollTop とscrollYのどちらを使うか
	//　スクロール位置の保持
	scrollPosition = scrollY;
	for(let i = 0; i < checkList.getSize(); ++i){
		if(checkList.getByIndex(i) === statusList[0]){
			if(isCheckedStatus0){
				listInTable[i].style.display = "table-row";
			}else{
				listInTable[i].style.display = "none";
			}
		}
		if(checkList.getByIndex(i) === statusList[1]){
			if(isCheckedStatus1){
				listInTable[i].style.display = "table-row";
			}else{
				listInTable[i].style.display = "none";
			}
		}
		if(checkList.getByIndex(i) === statusList[2]){
			if(isCheckedStatus2){
				listInTable[i].style.display = "table-row";
			}else{
				listInTable[i].style.display = "none";
			}
		}
		if(checkList.getByIndex(i) === statusList[3]){
			if(isCheckedStatus3){
				listInTable[i].style.display = "table-row";
			}else{
				listInTable[i].style.display = "none";
			}
		}
	}
	// scroll位置セット
	window.scrollTo(0, scrollPosition);
}
function storeAsURL() {
	let queryParam = "";
	if(checkList.getSize() > 0){
		queryParam = "list=";
	}
	for(let i = 0; i < checkList.getSize(); ++i){
		switch(checkList.getByIndex(i)){
			case statusList[0]:
				queryParam += "0";
				break;
			case statusList[1]:
				queryParam += "1";
				break;
			case statusList[2]:
				queryParam += "2";
				break;
			case statusList[3]:
				queryParam += "3";
				break;
		}
		queryParam += checkList.getIndexInList(i);
		if(i < checkList.getSize() - 1){
			queryParam += "-";
		}
	}
	history.pushState("", "", "?" + queryParam);
}
function expandFromURL() {
	const url = new URLSearchParams(location.search);
	let queryParamArray = [];
	if(url.has("list")){
		const queryParam = url.get("list");
		queryParamArray = queryParam.split("-");
		for(let i = 0; i < queryParamArray.length; ++i){
			switch(queryParamArray[i].slice(0, 1)){
				case "0":
					checkList.set(queryParamArray[i].slice(1), statusList[0]);
					break;
				case "1":
					checkList.set(queryParamArray[i].slice(1), statusList[1]);
					break;
				case "2":
					checkList.set(queryParamArray[i].slice(1), statusList[2]);
					break;
				case "3":
					checkList.set(queryParamArray[i].slice(1), statusList[3]);
					break;
			}
		}
	}
}

window.addEventListener('load', expandFromURL);
window.addEventListener('load', loadDisplay);
changeTabName.addEventListener('click', () => {
	document.title = inputTabName.value;
});
storeList.addEventListener('click', storeAsURL);
for(let i = 0; i < statusList.length; ++i){
	filteringStatus[i].addEventListener('click', filteringList);
}
for(let i = 0; i < inputKeys.length; ++i){
	if(inputKeys[i].value === "increment"){
		inputKeys[i].addEventListener('click', () => {
			if(displayInput.value != ""){
				displayInput.value = Number(displayInput.value) + 1;
			}
		});
	}else if(inputKeys[i].value === "decrement"){
		inputKeys[i].addEventListener('click', () => {
			if(Number(displayInput.value) - 1 > 0){
				displayInput.value = Number(displayInput.value) - 1;
			}
		});
	}else if(inputKeys[i].value === "clear"){
		inputKeys[i].addEventListener('click', () => {
			displayInput.value = "";
		})
	}else if(inputKeys[i].value === "enter"){
		inputKeys[i].addEventListener('click', () => {
			if(checkList.verifyIndexInList(displayInput.value)){
				checkedStatus = getCheckedStatus(selectStatusOnPrompt);
				checkList.set(displayInput.value, checkedStatus);
				loadDisplay();
				filteringList();
				storeAsURL();
				if(selectEditMode[1].checked){
					displayInput.value = "";
				}
			}else{
				noMatchingListAlert.style.visibility = "visible";
				setTimeout(() => {
					noMatchingListAlert.style.visibility = "hidden";
				}, alertDisplayTime);
			}
		})
	}else if(inputKeys[i].value === "0"){
		inputKeys[i].addEventListener('click', () => {
			if(displayInput.value != ""){
				displayInput.value += "0";
			}
		})
	}else{
		inputKeys[i].addEventListener('click', () => {
			displayInput.value += inputKeys[i].value;
		})
	}
}
clearListBtn.addEventListener('click', clearList);
window.addEventListener('scroll', () => {
	if (window.pageYOffset > 10){
		pageTopBtn.style.opacity = "1";
	} else{
		pageTopBtn.style.opacity = "0";
	}
});
pageTopBtn.addEventListener('click', (e) => {
	e.preventDefault();
	window.scrollTo({top: 0, behavior: 'smooth'});
});

addToListBtn.addEventListener('click', () => {
	let minValue, maxValue, temp;
	if(minIndex.value != "" && maxIndex.value != ""){
		minValue = Number(minIndex.value);
		maxValue = Number(maxIndex.value);
		if(minValue > 0 && maxValue > 0){
			checkedStatus = getCheckedStatus(selectStatusOnOverlay);
			if(minValue > maxValue){
				temp = minValue;
				minValue = maxValue;
				maxValue = temp;
			}
			for(let i = minValue; i <= maxValue; ++i){
				addToList(i, checkedStatus);
			}
			loadDisplay();
			storeAsURL();
			minIndex.value = "";
			maxIndex.value = "";
		}else{
			zeroOrLessAlert.style.visibility = "visible";
			setTimeout(() => {
				zeroOrLessAlert.style.visibility ="hidden";
			}, alertDisplayTime);
		}
	}
});


