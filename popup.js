
function createTableRow(tab) {
	var mainTableBody = document.getElementById('mainTableBody');
	var tr = mainTableBody.insertRow();
	//tr.innerHTML = `<div> ${tab.index}, ${tab.url}, ${tab.loadtime} </div>`;
	tr.insertCell().innerText = tab.index;
	tr.insertCell().innerText = tab.url;
	tr.insertCell().innerText = tab.loadtime;
}

async function restoreOptions() {
	var mainTableBody = document.getElementById('mainTableBody');

    const params = (new URL(document.location.href)).searchParams

    var values = [];
    if(params.get("activeTab")){
        values = await browser.runtime.sendMessage({url: "<all_urls>", currentWindow: true, hidden: false, active: true});
    }else{
        values = await browser.runtime.sendMessage({url: "<all_urls>", currentWindow: true, hidden: false});
    }
	values.forEach( (item) => {
		createTableRow(item);
	});
}

document.addEventListener('DOMContentLoaded', restoreOptions);

