let recommendApp = [];
let installedApp = [];
let currentApp = {};

const base_url = "http://127.0.0.1:4321";

window.onload = function () {
  loadInstalledData();
};

function loadData() {
  var header = new Headers();
  header.append("Accept", "application/json");
  header.append("Node-RED-API-Version", "v2");

  var requestOptions = {
    method: "GET",
    headers: header,
    redirect: "follow",
  };

  fetch(`${base_url}/applications`, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      const data = JSON.parse(result);
      const apps = [];
      data.forEach((app) => {
        const index = installedApp.findIndex(x => x.app_id === app.app_id);
        if (index < 0) {
          apps.push(app);
        }
      })
      recommendApp = apps;
      setRecommendedData(recommendApp);
    })
    .catch((error) => console.log("error", error));
}

function loadInstalledData() {
  var header = new Headers();
  header.append("Accept", "application/json");
  header.append("Node-RED-API-Version", "v2");

  var requestOptions = {
    method: "GET",
    headers: header,
    redirect: "follow",
  };

  fetch(`${base_url}/config`, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      const data = JSON.parse(result);
      installedApp = data;
      setInstalledData(data);
      loadData();
    })
    .catch((error) => console.log("error", error));
}

function getResource(appId) {
  var header = new Headers();
  header.append("Accept", "application/json");
  header.append("Node-RED-API-Version", "v2");

  var requestOptions = {
    method: "GET",
    headers: header,
    redirect: "follow",
  };

  fetch(`${base_url}/app/${appId}/install`, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      showMessage("install extension successfully");
      showSpinner(false);
      console.log(result);
    })
    .catch((error) => {showSpinner(false);console.log("error", error)});
}

function setInstalledData(data) {
  $("#installed").empty();
  data.forEach((item, index) => {
    $("#installed").append(`<div onclick="setItemValue('${index}', 'installed')" class="d-flex p-3 app-item">
      <img src="../assets/brand/logo.svg" width="32" height="32" class="pt-2"/>
      <div class="ps-3">
        <strong class="text right">${item.app_name}</strong> 
        <small class="d-block">description</small>
      </div>
    </div>`);
  });
}
function setRecommendedData(data) {
  $("#recommended").empty();
  data.forEach((item, index) => {
    $("#recommended").append(`<div onclick="setItemValue('${index}', 'recommended')" class="d-flex p-3 app-item">
      <img src="../assets/brand/logo.svg" width="32" height="32" class="pt-2"/>
      <div class="ps-3">
        <strong class="text right">${item.app_name}</strong> 
        <small class="d-block">description</small>
      </div>
    </div>`);
  });
}

function setItemValue(index, status = "installed") {
  // installed, recommended
  if (status == "installed") {
    currentApp = installedApp[index];
    $("#btn-disable").removeClass('d-none');
    $("#btn-install").addClass('d-none');
    $("#btn-un-install").removeClass('d-none');
  } else if (status == "recommended") {
    currentApp = recommendApp[index];
    $("#btn-disable").addClass('d-none');
    $("#btn-install").removeClass('d-none');
    $("#btn-un-install").addClass('d-none');
  } else {
    $("#btn-disable").addClass('d-none');
    $("#btn-install").addClass('d-none');
    $("#btn-un-install").addClass('d-none');
  }
  $("#container-detail").removeClass('d-none');
  $("#itemName")[0].innerHTML = currentApp.app_name;
  $("#itemAuthor")[0].innerHTML = 'Phúc Vi';
  $("#itemDes")[0].innerHTML = 'Syntax highlighting for Apollo Guidance Computer (AGC) assembly source code';

}

$(document).ready(function () {
  $("#search").change(function () {
    const textSearch = $("#search").val();
    const dataSearch = recommendApp.filter(x => x.label.toLowerCase().includes(textSearch.toLowerCase()));
    setRecommendedData(dataSearch);
  });
});

function installExtension() {
  showSpinner(true);
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Node-RED-API-Version", "v2");
  myHeaders.append("Content-Type", "application/json");

  const data = JSON.parse(currentApp.app_flows);
  const param = data[0];
  param.nodes = [];
  param.configs = data.filter(x => x.id != param.id);

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(param),
    redirect: 'follow'
  };

  fetch(`${base_url}/admin/flow`, requestOptions)
    .then(response => response.text())
    .then(result => {
      result = JSON.parse(result) 
      if (result.id) {
        setTimeout(() => {
          getResource(currentApp.app_id);
        }, 200);
      }
    })
    .catch(error => {
      console.log('error', error);
      showSpinner(false);
      showMessage("install extension error");
    });
}

function showMessage(message) {
  $("#snackbar")[0].innerHTML = message;
  $("#snackbar").addClass("show");
  setTimeout(function () {
    $("#snackbar").removeClass("show");
  }, 3000);
}

function showSpinner(isShow = true) {
  if (isShow) {
    $("#spinner-custom").removeClass("d-none");
    $("#wrapper").addClass("overlay");
  } else {
    $("#spinner-custom").addClass("d-none");
    $("#wrapper").removeClass("overlay");
  }
}